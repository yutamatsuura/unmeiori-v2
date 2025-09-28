from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class TemplateSettings(Base):
    __tablename__ = "template_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 会社情報
    company_name = Column(String, default="")
    company_address = Column(Text, default="")
    company_phone = Column(String, default="")
    company_email = Column(String, default="")
    company_logo_path = Column(String)

    # PDF設定
    pdf_header_text = Column(Text, default="鑑定書")
    pdf_footer_text = Column(Text, default="")

    # カラー設定
    primary_color = Column(String, default="#000000")
    secondary_color = Column(String, default="#666666")

    # その他設定
    include_company_info = Column(Boolean, default=True)
    include_logo = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # リレーション
    user = relationship("User", back_populates="template_settings")