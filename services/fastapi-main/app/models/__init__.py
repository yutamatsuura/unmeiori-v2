from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import User
from app.models.kantei import KanteiRecord, EmailHistory
from app.models.template import TemplateSettings

# SQLAlchemyの単一真実源の原則に従い、全てのモデルをここに集約
__all__ = [
    "Base",
    "User",
    "KanteiRecord",
    "EmailHistory",
    "TemplateSettings"
]

# リレーションシップの追加
User.kantei_records = relationship("KanteiRecord", back_populates="user")
User.template_settings = relationship("TemplateSettings", back_populates="user")
KanteiRecord.email_history = relationship("EmailHistory", back_populates="kantei_record")