from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import User, TemplateSettings
from app.schemas import (
    TemplateSettings as TemplateSettingsSchema,
    TemplateSettingsCreate,
    TemplateSettingsUpdate,
    LogoUploadResponse
)
import os
import shutil
from typing import Optional

router = APIRouter()


@router.get("/settings", response_model=TemplateSettingsSchema)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """テンプレート設定取得"""

    # 既存設定を取得
    settings = db.query(TemplateSettings).filter(
        TemplateSettings.user_id == current_user.id
    ).first()

    if not settings:
        # デフォルト設定を作成
        settings = TemplateSettings(
            user_id=current_user.id,
            company_name="",
            company_address="",
            company_phone="",
            company_email="",
            pdf_header_text="鑑定書",
            pdf_footer_text="",
            primary_color="#000000",
            secondary_color="#666666",
            include_company_info=True,
            include_logo=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("/update", response_model=TemplateSettingsSchema)
async def update_settings(
    settings_data: TemplateSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """テンプレート設定更新"""

    # 既存設定を取得
    settings = db.query(TemplateSettings).filter(
        TemplateSettings.user_id == current_user.id
    ).first()

    if not settings:
        # 新規作成
        settings = TemplateSettings(user_id=current_user.id)
        db.add(settings)

    # 更新
    update_data = settings_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return settings


@router.post("/upload-logo", response_model=LogoUploadResponse)
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ロゴアップロード"""

    # ファイル形式チェック
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and GIF are allowed."
        )

    # ファイルサイズチェック（2MB制限）
    file_size = 0
    chunk_size = 1024
    content = await file.read()
    file_size = len(content)

    if file_size > 2 * 1024 * 1024:  # 2MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 2MB."
        )

    try:
        # アップロードディレクトリ作成
        upload_dir = "uploaded_logos"
        os.makedirs(upload_dir, exist_ok=True)

        # ファイル名生成
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        logo_filename = f"logo_{current_user.id}.{file_extension}"
        logo_path = os.path.join(upload_dir, logo_filename)

        # ファイル保存
        with open(logo_path, "wb") as buffer:
            buffer.write(content)

        # データベース更新
        settings = db.query(TemplateSettings).filter(
            TemplateSettings.user_id == current_user.id
        ).first()

        if not settings:
            settings = TemplateSettings(user_id=current_user.id)
            db.add(settings)

        settings.company_logo_path = logo_path
        db.commit()

        return LogoUploadResponse(
            success=True,
            logo_path=logo_path,
            message="Logo uploaded successfully"
        )

    except Exception as e:
        return LogoUploadResponse(
            success=False,
            message=f"Logo upload failed: {str(e)}"
        )