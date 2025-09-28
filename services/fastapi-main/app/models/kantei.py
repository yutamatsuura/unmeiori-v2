from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class KanteiRecord(Base):
    __tablename__ = "kantei_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # クライアント情報
    client_surname = Column(String, nullable=False)
    client_given_name = Column(String, nullable=False)
    client_birth_date = Column(String, nullable=False)

    # 九星気学結果
    kyusei_result = Column(Text)

    # 姓名判断結果
    seimei_result = Column(Text)

    # 統合結果
    combined_result = Column(Text)

    # 鑑定士コメント
    kantei_comment = Column(Text)

    # PDF情報
    pdf_path = Column(String)
    pdf_generated = Column(Boolean, default=False)

    # メール情報
    email_sent = Column(Boolean, default=False)
    email_address = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # リレーション
    user = relationship("User", back_populates="kantei_records")
    email_history = relationship("EmailHistory", back_populates="kantei_record")


class EmailHistory(Base):
    __tablename__ = "email_history"

    id = Column(Integer, primary_key=True, index=True)
    kantei_record_id = Column(Integer, ForeignKey("kantei_records.id"), nullable=False)
    email_address = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="sent")  # sent, failed, pending

    # リレーション
    kantei_record = relationship("KanteiRecord", back_populates="email_history")