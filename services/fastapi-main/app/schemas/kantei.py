from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class ClientInfo(BaseModel):
    surname: str
    given_name: str
    birth_date: str  # YYYY-MM-DD format
    birth_time: Optional[str] = None  # HH:MM format
    gender: Optional[str] = None
    birth_place: Optional[str] = None
    email: Optional[str] = None


class KanteiRequest(BaseModel):
    client_info: ClientInfo


class KanteiResponse(BaseModel):
    id: int
    client_info: ClientInfo
    kyusei_result: Optional[Dict[str, Any]] = None
    seimei_result: Optional[Dict[str, Any]] = None
    combined_result: Optional[Dict[str, Any]] = None
    kantei_comment: Optional[str] = None
    pdf_generated: bool = False
    pdf_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# PDF生成用の詳細スキーマ
class KyuseiKigakuData(BaseModel):
    nenban: Dict[str, Any]
    getsuban: Dict[str, Any]
    nippan: Optional[Dict[str, Any]] = None
    kichihoui: Dict[str, Any]

class SeimeiHandanData(BaseModel):
    characters: List[Dict[str, Any]]
    kakusu: Dict[str, int]
    kantei_results: List[Dict[str, Any]]
    gogyou_balance: Dict[str, Any]
    youin_pattern: Dict[str, Any]
    overall_score: int
    grade: str

class TemplateSettings(BaseModel):
    logo_url: Optional[str] = None
    business_name: str = Field(default="開運鑑定所")
    operator_name: str = Field(default="鑑定士")
    color_theme: str = Field(default="blue")
    font_family: str = Field(default="mincho")
    include_logo: bool = Field(default=True)
    include_signature: bool = Field(default=True)

class PDFGenerationRequest(BaseModel):
    kantei_data: Dict[str, Any]  # KyuseiKigakuData + SeimeiHandanData
    template_settings: TemplateSettings
    custom_message: Optional[str] = None

class PDFGenerationResponse(BaseModel):
    success: bool
    pdf_url: Optional[str] = None
    file_size: Optional[int] = None
    page_count: Optional[int] = None
    generated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    message: str

class PDFGenerateRequest(BaseModel):
    kantei_id: int
    template_settings: Optional[TemplateSettings] = None
    custom_message: Optional[str] = None

class PDFGenerateResponse(BaseModel):
    success: bool
    pdf_path: Optional[str] = None
    pdf_url: Optional[str] = None
    message: str


class EmailSendRequest(BaseModel):
    kantei_id: int
    email_address: EmailStr
    subject: str
    message: Optional[str] = None


class EmailSendResponse(BaseModel):
    success: bool
    message: str


class KanteiHistoryItem(BaseModel):
    id: int
    client_name: str
    client_birth_date: str
    created_at: datetime
    pdf_generated: bool
    email_sent: bool

    class Config:
        from_attributes = True


class KanteiHistoryResponse(BaseModel):
    items: list[KanteiHistoryItem]
    total: int
    page: int
    per_page: int


class CommentUpdateRequest(BaseModel):
    comment: str = Field(..., max_length=200, description="鑑定士コメント（200文字以内）")


class CommentUpdateResponse(BaseModel):
    success: bool
    message: str
    comment: Optional[str] = None