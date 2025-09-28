from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TemplateSettingsBase(BaseModel):
    company_name: Optional[str] = ""
    company_address: Optional[str] = ""
    company_phone: Optional[str] = ""
    company_email: Optional[str] = ""
    pdf_header_text: Optional[str] = "鑑定書"
    pdf_footer_text: Optional[str] = ""
    primary_color: Optional[str] = "#000000"
    secondary_color: Optional[str] = "#666666"
    include_company_info: Optional[bool] = True
    include_logo: Optional[bool] = True


class TemplateSettingsCreate(TemplateSettingsBase):
    pass


class TemplateSettingsUpdate(TemplateSettingsBase):
    pass


class TemplateSettings(TemplateSettingsBase):
    id: int
    user_id: int
    company_logo_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LogoUploadResponse(BaseModel):
    success: bool
    logo_path: Optional[str] = None
    message: str