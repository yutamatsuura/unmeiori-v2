from app.schemas.user import User, UserCreate, UserUpdate, Token, TokenData, ThemeSettingsUpdate, ThemeSettingsResponse
from app.schemas.kantei import (
    ClientInfo,
    KanteiRequest,
    KanteiResponse,
    PDFGenerateRequest,
    PDFGenerateResponse,
    PDFGenerationRequest,
    PDFGenerationResponse,
    EmailSendRequest,
    EmailSendResponse,
    KanteiHistoryItem,
    KanteiHistoryResponse,
    CommentUpdateRequest,
    CommentUpdateResponse
)
from app.schemas.template import (
    TemplateSettings,
    TemplateSettingsCreate,
    TemplateSettingsUpdate,
    LogoUploadResponse
)

# スキーマの単一真実源として全てのスキーマをここに集約
__all__ = [
    "User",
    "UserCreate",
    "UserUpdate",
    "Token",
    "TokenData",
    "ClientInfo",
    "KanteiRequest",
    "KanteiResponse",
    "PDFGenerateRequest",
    "PDFGenerateResponse",
    "PDFGenerationRequest",
    "PDFGenerationResponse",
    "EmailSendRequest",
    "EmailSendResponse",
    "KanteiHistoryItem",
    "KanteiHistoryResponse",
    "CommentUpdateRequest",
    "CommentUpdateResponse",
    "TemplateSettings",
    "TemplateSettingsCreate",
    "TemplateSettingsUpdate",
    "LogoUploadResponse",
    "ThemeSettingsUpdate",
    "ThemeSettingsResponse"
]