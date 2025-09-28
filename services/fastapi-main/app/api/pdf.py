from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import User, KanteiRecord
from app.schemas import PDFGenerateRequest, PDFGenerateResponse
from app.services import pdf_service
from typing import Dict, Any
import json
import os
from datetime import datetime

router = APIRouter()

# ログファイル設定
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

def write_pdf_log(message: str):
    """PDF APIログをファイルに出力"""
    timestamp = datetime.now().isoformat()
    log_file = os.path.join(LOG_DIR, "pdf_api.log")
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {message}\n")
    except Exception as e:
        print(f"ログ書き込みエラー: {e}")


@router.post("/generate", response_model=PDFGenerateResponse)
async def generate_pdf(
    request: PDFGenerateRequest,
    db: Session = Depends(get_db)
):
    """PDF生成エンドポイント - 印刷プレビューと同じ内容を生成"""

    write_pdf_log(f"PDF生成開始 - 鑑定ID: {request.kantei_id}")

    # 鑑定記録取得（認証無効時はuser_idチェックをスキップ）
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == request.kantei_id
    ).first()

    if not kantei_record:
        write_pdf_log(f"鑑定記録が見つかりません - ID: {request.kantei_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    try:
        write_pdf_log(f"印刷プレビュー互換PDF生成開始 - クライアント: {kantei_record.client_name}")

        # 印刷プレビューページのURLを生成
        preview_url = f"http://localhost:3001/print-preview/{kantei_record.id}"

        # フロントエンドの印刷プレビューを使って印刷用PDFを生成
        pdf_path = await pdf_service.generate_pdf_from_print_preview(
            kantei_id=kantei_record.id,
            preview_url=preview_url
        )

        write_pdf_log(f"印刷プレビュー互換PDF生成成功 - パス: {pdf_path}")

        # データベース更新
        kantei_record.pdf_path = pdf_path
        kantei_record.pdf_generated = True
        db.commit()

        write_pdf_log(f"データベース更新成功 - 鑑定ID: {kantei_record.id}")

        return PDFGenerateResponse(
            success=True,
            pdf_path=pdf_path,
            pdf_url=f"/api/pdf/download/{kantei_record.id}",
            message="PDF generated successfully from print preview"
        )

    except Exception as e:
        write_pdf_log(f"PDF生成エラー: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(e)}"
        )


@router.get("/download/{kantei_id}")
async def download_pdf(
    kantei_id: int,
    db: Session = Depends(get_db)
):
    """PDFダウンロード"""

    write_pdf_log(f"PDFダウンロード要求 - 鑑定ID: {kantei_id}")

    # 鑑定記録取得（認証無効時はuser_idチェックをスキップ）
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == kantei_id
    ).first()

    if not kantei_record:
        write_pdf_log(f"鑑定記録が見つかりません - ID: {kantei_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    if not kantei_record.pdf_generated or not kantei_record.pdf_path:
        write_pdf_log(f"PDFが未生成 - ID: {kantei_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not generated yet"
        )

    if not pdf_service.pdf_exists(kantei_record.pdf_path):
        write_pdf_log(f"PDFファイルが見つかりません - パス: {kantei_record.pdf_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found"
        )

    write_pdf_log(f"PDFダウンロード開始 - パス: {kantei_record.pdf_path}")

    return FileResponse(
        path=kantei_record.pdf_path,
        media_type="application/pdf",
        filename=f"kantei_{kantei_record.client_name}_{kantei_record.id}.pdf"
    )


@router.get("/preview/{kantei_id}")
async def preview_pdf(
    kantei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """PDFプレビュー（ダウンロードと同じだが、プレビュー用）"""

    write_pdf_log(f"PDFプレビュー要求 - ユーザー: {current_user.email}, 鑑定ID: {kantei_id}")

    # download_pdfと同じ処理
    return await download_pdf(kantei_id, current_user, db)


@router.get("/exists/{kantei_id}")
async def check_pdf_exists(
    kantei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """PDF存在確認"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        return {"exists": False, "reason": "Kantei record not found"}

    if not kantei_record.pdf_generated or not kantei_record.pdf_path:
        return {"exists": False, "reason": "PDF not generated"}

    if not pdf_service.pdf_exists(kantei_record.pdf_path):
        return {"exists": False, "reason": "PDF file not found"}

    return {
        "exists": True,
        "pdf_path": kantei_record.pdf_path,
        "generated_at": kantei_record.created_at
    }