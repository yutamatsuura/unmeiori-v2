"""
Word出力APIエンドポイント
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from app.services.word_generator import generate_word_document
from app.services.svg_converter import generate_hoiban_image

logger = logging.getLogger(__name__)

router = APIRouter()


class WordExportRequest(BaseModel):
    """Word出力リクエストモデル"""
    formData: Dict[str, Any]
    kyuseiResult: Optional[Dict[str, Any]] = None
    seimeiResult: Optional[Dict[str, Any]] = None
    birthData: Optional[Dict[str, Any]] = None
    houiDetails: Optional[List[Dict[str, Any]]] = None
    kyuseiHoiban: Optional[Dict[str, Any]] = None
    kanteiComment: Optional[str] = None
    targetDate: Optional[str] = None


@router.post("/generate-word")
async def generate_word_export(request: WordExportRequest):
    """
    Word文書生成・ダウンロードエンドポイント

    Args:
        request: 鑑定データ

    Returns:
        Word文書（.docx）のバイナリレスポンス
    """
    try:
        logger.info("Word文書生成開始")

        # リクエストデータの準備
        data = {
            'formData': request.formData,
            'kyuseiResult': request.kyuseiResult,
            'seimeiResult': request.seimeiResult,
            'birthData': request.birthData,
            'houiDetails': request.houiDetails,
            'kantei_comment': request.kanteiComment,
            'targetDate': request.targetDate or datetime.now().strftime('%Y年%m月%d日')
        }

        # 方位盤画像生成
        hoiban_image = None
        if request.kyuseiHoiban:
            try:
                logger.info("方位盤画像生成開始")
                hoiban_image = generate_hoiban_image(request.kyuseiHoiban)
                data['hoibanImage'] = hoiban_image
                logger.info("方位盤画像生成完了")
            except Exception as e:
                logger.warning(f"方位盤画像生成失敗: {str(e)} - 続行します")
                # 方位盤画像生成失敗時も文書生成は続行

        # Word文書生成
        logger.info("Word文書生成処理開始")
        word_bytes = generate_word_document(data)
        logger.info("Word文書生成完了")

        # ファイル名生成（URL エンコード対応）
        client_name = request.formData.get('name', 'unknown')
        current_date = datetime.now().strftime('%Y-%m-%d')
        filename_raw = f"鑑定書_{client_name}_{current_date}.docx"

        # UTF-8でURL エンコード
        from urllib.parse import quote
        filename_encoded = quote(filename_raw.encode('utf-8'))

        # レスポンス返却
        return Response(
            content=word_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{filename_encoded}",
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            }
        )

    except Exception as e:
        logger.error(f"Word文書生成エラー: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Word文書の生成に失敗しました: {str(e)}"
        )


@router.get("/test-word")
async def test_word_generation():
    """
    Word文書生成テストエンドポイント

    Returns:
        テスト用Word文書
    """
    try:
        # テストデータ
        test_data = {
            'formData': {
                'name': 'テスト太郎',
                'birthDate': '1990-01-01',
                'gender': 'male'
            },
            'kyuseiResult': {
                'honmei': '一白水星',
                'getsusei': '二黒土星',
                'nissei': '三碧木星'
            },
            'seimeiResult': {
                'heaven': 8,
                'personality': 18,
                'earth': 25,
                'total': 33
            },
            'birthData': {
                'year': {'name': '一白水星'},
                'month': {'name': '二黒土星'},
                'day': {'name': '三碧木星'}
            },
            'houiDetails': [
                {
                    'houi': '北',
                    'nenbanStar': 1,
                    'getsubanStar': 2,
                    'nippanStar': 3,
                    'kichiType': '吉方',
                    'kyouType': None
                },
                {
                    'houi': '南',
                    'nenbanStar': 9,
                    'getsubanStar': 8,
                    'nippanStar': 7,
                    'kichiType': None,
                    'kyouType': '凶方'
                }
            ],
            'targetDate': '2025年9月27日'
        }

        # Word文書生成
        word_bytes = generate_word_document(test_data)

        # ファイル名（テスト用）
        filename_raw = f"test_document_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"

        # UTF-8でURL エンコード
        from urllib.parse import quote
        filename_encoded = quote(filename_raw.encode('utf-8'))

        return Response(
            content=word_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{filename_encoded}",
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            }
        )

    except Exception as e:
        logger.error(f"テストWord文書生成エラー: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"テストWord文書の生成に失敗しました: {str(e)}"
        )