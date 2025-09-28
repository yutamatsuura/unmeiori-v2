from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import User, KanteiRecord, EmailHistory
from app.schemas import (
    KanteiRequest, KanteiResponse, PDFGenerateRequest, PDFGenerateResponse,
    PDFGenerationRequest, PDFGenerationResponse, TemplateSettings,
    EmailSendRequest, EmailSendResponse, KanteiHistoryResponse, KanteiHistoryItem,
    CommentUpdateRequest, CommentUpdateResponse
)
from app.services import kyusei_service, seimei_service, pdf_service
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
import os

# ログファイル設定
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

def write_kantei_log(message: str):
    """鑑定APIログをファイルに出力"""
    timestamp = datetime.now().isoformat()
    log_file = os.path.join(LOG_DIR, "kantei_api.log")
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {message}\n")
    except Exception as e:
        print(f"ログ書き込みエラー: {e}")

router = APIRouter()


@router.post("/test-calculate", response_model=KanteiResponse)
async def test_calculate_kantei(
    request: KanteiRequest,
    db: Session = Depends(get_db)
):
    """統合鑑定計算を実行（認証なしテスト用）"""

    client_info = request.client_info

    # 姓名を結合
    full_name = f"{client_info.surname}{client_info.given_name}"

    # 九星気学計算
    kyusei_result = await kyusei_service.calculate_kyusei(
        name=full_name,
        birth_date=client_info.birth_date
    )

    # 姓名判断計算（姓・名分離で精度向上）
    seimei_result = await seimei_service.analyze_name_separated(
        surname=client_info.surname,
        given_name=client_info.given_name
    )

    # 統合結果の作成（シンプルな統合ロジック）
    combined_result = {
        "summary": "統合鑑定結果",
        "kyusei_available": kyusei_result is not None,
        "seimei_available": seimei_result is not None,
        "overall_fortune": "良好" if (kyusei_result and seimei_result) else "一部取得失敗"
    }

    return KanteiResponse(
        id=999,  # テスト用ID
        client_info=client_info,
        kyusei_result=kyusei_result,
        seimei_result=seimei_result,
        combined_result=combined_result,
        pdf_generated=False,
        pdf_path=None,
        created_at=datetime.now()
    )


@router.post("/calculate", response_model=KanteiResponse)
async def calculate_kantei(
    request: KanteiRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """統合鑑定計算を実行"""

    client_info = request.client_info
    full_name = f"{client_info.surname}{client_info.given_name}"
    write_kantei_log(f"鑑定計算開始 - ユーザー: {current_user.email}, クライアント: {full_name}, 生年月日: {client_info.birth_date}")

    try:
        # 九星気学計算
        write_kantei_log(f"九星気学計算開始 - {full_name}, {client_info.birth_date}")
        kyusei_result = await kyusei_service.calculate_kyusei(
            name=full_name,
            birth_date=client_info.birth_date
        )
        write_kantei_log(f"九星気学計算終了 - 結果: {kyusei_result is not None}")

        # 姓名判断計算（姓・名分離で精度向上）
        write_kantei_log(f"姓名判断計算開始 - 姓: {client_info.surname}, 名: {client_info.given_name}")
        seimei_result = await seimei_service.analyze_name_separated(
            surname=client_info.surname,
            given_name=client_info.given_name
        )
        write_kantei_log(f"姓名判断計算終了 - 結果: {seimei_result is not None}")

        # 統合結果の作成（シンプルな統合ロジック）
        combined_result = {
            "summary": "統合鑑定結果",
            "kyusei_available": kyusei_result is not None,
            "seimei_available": seimei_result is not None,
            "overall_fortune": "良好" if (kyusei_result and seimei_result) else "一部取得失敗"
        }
        write_kantei_log(f"統合結果作成 - 九星: {kyusei_result is not None}, 姓名: {seimei_result is not None}")

        # データベースに保存
        kantei_record = KanteiRecord(
            user_id=current_user.id,
            client_surname=client_info.surname,
            client_given_name=client_info.given_name,
            client_birth_date=client_info.birth_date,
            kyusei_result=json.dumps(kyusei_result, ensure_ascii=False) if kyusei_result else None,
            seimei_result=json.dumps(seimei_result, ensure_ascii=False) if seimei_result else None,
            combined_result=json.dumps(combined_result, ensure_ascii=False),
            pdf_generated=False,
            email_sent=False
        )

        db.add(kantei_record)
        db.commit()
        db.refresh(kantei_record)
        write_kantei_log(f"データベース保存成功 - 鑑定ID: {kantei_record.id}")

    except Exception as e:
        write_kantei_log(f"鑑定計算エラー: {e}")
        if 'kantei_record' in locals():
            db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="計算処理でエラーが発生しました。もう一度お試しください。"
        )

    return KanteiResponse(
        id=kantei_record.id,
        client_info=client_info,
        kyusei_result=kyusei_result,
        seimei_result=seimei_result,
        combined_result=combined_result,
        kantei_comment=kantei_record.kantei_comment,
        pdf_generated=kantei_record.pdf_generated,
        pdf_path=kantei_record.pdf_path,
        created_at=kantei_record.created_at
    )


@router.post("/generate-pdf", response_model=PDFGenerationResponse)
async def generate_pdf_v2(
    request: PDFGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """統合PDF生成（新版）"""

    try:
        # PDF生成（新しいサービスメソッドを使用）
        pdf_buffer = pdf_service.generate_kantei_report(
            kantei_data=request.kantei_data,
            template_settings=request.template_settings.dict()
        )

        # ファイル名生成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        client_name = request.kantei_data.get("client_info", {}).get("name", "unknown")
        filename = f"kantei_{client_name}_{timestamp}.pdf"
        filepath = os.path.join(pdf_service.output_dir, filename)

        # ファイル保存
        with open(filepath, 'wb') as f:
            f.write(pdf_buffer.getvalue())

        # PDFファイル情報取得
        pdf_info = pdf_service.get_pdf_info(filepath)

        return PDFGenerationResponse(
            success=True,
            pdf_url=f"/api/kantei/download/{filename}",
            file_size=pdf_info.get("size", 0),
            page_count=1,  # 実際のページ数計算は省略
            generated_at=pdf_info.get("created_at"),
            expires_at=pdf_info.get("expires_at"),
            message="PDF generated successfully"
        )

    except Exception as e:
        return PDFGenerationResponse(
            success=False,
            message=f"PDF generation failed: {str(e)}"
        )


@router.post("/generate-pdf-legacy", response_model=PDFGenerateResponse)
async def generate_pdf_legacy(
    request: PDFGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """PDF生成（レガシー版：互換性のため）"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == request.kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    try:
        # PDF生成用データ準備
        pdf_data = {
            "client_info": {
                "surname": kantei_record.client_surname,
            "given_name": kantei_record.client_given_name,
                "birth_date": kantei_record.client_birth_date,
            },
            "kyusei_kigaku": json.loads(kantei_record.kyusei_result) if kantei_record.kyusei_result else None,
            "seimei_handan": json.loads(kantei_record.seimei_result) if kantei_record.seimei_result else None,
            "combined_result": json.loads(kantei_record.combined_result) if kantei_record.combined_result else None
        }

        # テンプレート設定のデフォルト値
        template_settings = request.template_settings or {}

        # PDF生成
        pdf_path = pdf_service.generate_kantei_pdf(
            kantei_data=pdf_data,
            template_settings=template_settings
        )

        # データベース更新
        kantei_record.pdf_path = pdf_path
        kantei_record.pdf_generated = True
        db.commit()

        return PDFGenerateResponse(
            success=True,
            pdf_path=pdf_path,
            pdf_url=f"/api/kantei/pdf/{kantei_record.id}",
            message="PDF generated successfully"
        )

    except Exception as e:
        return PDFGenerateResponse(
            success=False,
            message=f"PDF generation failed: {str(e)}"
        )


@router.get("/pdf/{kantei_id}")
async def get_pdf(
    kantei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """PDFプレビュー/ダウンロード"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    if not kantei_record.pdf_generated or not kantei_record.pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not generated yet"
        )

    if not pdf_service.pdf_exists(kantei_record.pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found"
        )

    return FileResponse(
        path=kantei_record.pdf_path,
        media_type="application/pdf",
        filename=f"kantei_{f"{kantei_record.client_surname}{kantei_record.client_given_name}"}_{kantei_record.id}.pdf"
    )


@router.get("/download/{filename}")
async def download_pdf(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """PDFファイル直接ダウンロード"""

    # ファイルパス構築
    filepath = os.path.join(pdf_service.output_dir, filename)

    # ファイル存在チェック
    if not pdf_service.pdf_exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found"
        )

    # セキュリティ：パストラバーサル攻撃を防ぐ
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )

    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=filename
    )


@router.post("/send-email", response_model=EmailSendResponse)
async def send_email(
    request: EmailSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """メール送信（モック実装）"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == request.kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    try:
        # メール送信履歴を記録（実際の送信はモック）
        email_history = EmailHistory(
            kantei_record_id=kantei_record.id,
            email_address=request.email_address,
            subject=request.subject,
            status="sent"  # モック実装では常に成功
        )

        db.add(email_history)

        # 鑑定記録を更新
        kantei_record.email_sent = True
        kantei_record.email_address = request.email_address

        db.commit()

        return EmailSendResponse(
            success=True,
            message="Email sent successfully (mock implementation)"
        )

    except Exception as e:
        return EmailSendResponse(
            success=False,
            message=f"Email sending failed: {str(e)}"
        )


@router.get("/history", response_model=KanteiHistoryResponse)
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """鑑定履歴取得"""

    # ページネーション計算
    offset = (page - 1) * per_page

    # 総数取得
    total = db.query(KanteiRecord).filter(KanteiRecord.user_id == current_user.id).count()

    # データ取得
    records = db.query(KanteiRecord).filter(
        KanteiRecord.user_id == current_user.id
    ).order_by(KanteiRecord.created_at.desc()).offset(offset).limit(per_page).all()

    # レスポンス作成
    items = [
        KanteiHistoryItem(
            id=record.id,
            client_name=f"{record.client_surname}{record.client_given_name}",
            client_birth_date=record.client_birth_date,
            created_at=record.created_at,
            pdf_generated=record.pdf_generated,
            email_sent=record.email_sent
        )
        for record in records
    ]

    return KanteiHistoryResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/{kantei_id}", response_model=KanteiResponse)
async def get_kantei(
    kantei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """鑑定詳細取得（省略パス版）"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    # レスポンス作成
    return KanteiResponse(
        id=kantei_record.id,
        client_info={
            "surname": kantei_record.client_surname,
            "given_name": kantei_record.client_given_name,
            "birth_date": kantei_record.client_birth_date
        },
        kyusei_result=json.loads(kantei_record.kyusei_result) if kantei_record.kyusei_result else None,
        seimei_result=json.loads(kantei_record.seimei_result) if kantei_record.seimei_result else None,
        combined_result=json.loads(kantei_record.combined_result) if kantei_record.combined_result else None,
        kantei_comment=kantei_record.kantei_comment,
        pdf_generated=kantei_record.pdf_generated,
        pdf_path=kantei_record.pdf_path,
        created_at=kantei_record.created_at
    )


@router.get("/detail/{kantei_id}", response_model=KanteiResponse)
async def get_detail(
    kantei_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """鑑定詳細取得"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    # レスポンス作成
    return KanteiResponse(
        id=kantei_record.id,
        client_info={
            "surname": kantei_record.client_surname,
            "given_name": kantei_record.client_given_name,
            "birth_date": kantei_record.client_birth_date
        },
        kyusei_result=json.loads(kantei_record.kyusei_result) if kantei_record.kyusei_result else None,
        seimei_result=json.loads(kantei_record.seimei_result) if kantei_record.seimei_result else None,
        combined_result=json.loads(kantei_record.combined_result) if kantei_record.combined_result else None,
        kantei_comment=kantei_record.kantei_comment,
        pdf_generated=kantei_record.pdf_generated,
        pdf_path=kantei_record.pdf_path,
        created_at=kantei_record.created_at
    )


@router.put("/{kantei_id}/comment", response_model=CommentUpdateResponse)
async def update_comment(
    kantei_id: int,
    request: CommentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """鑑定士コメント更新"""

    # 鑑定記録取得
    kantei_record = db.query(KanteiRecord).filter(
        KanteiRecord.id == kantei_id,
        KanteiRecord.user_id == current_user.id
    ).first()

    if not kantei_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kantei record not found"
        )

    try:
        # コメント更新
        kantei_record.kantei_comment = request.comment
        db.commit()
        db.refresh(kantei_record)

        write_kantei_log(f"コメント更新 - 鑑定ID: {kantei_id}, ユーザー: {current_user.email}")

        return CommentUpdateResponse(
            success=True,
            message="コメントが更新されました",
            comment=kantei_record.kantei_comment
        )

    except Exception as e:
        db.rollback()
        write_kantei_log(f"コメント更新エラー - 鑑定ID: {kantei_id}, エラー: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="コメントの更新に失敗しました"
        )