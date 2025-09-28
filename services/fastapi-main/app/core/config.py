from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # データベース設定
    database_url: str

    # JWT設定
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # マイクロサービス設定
    kyusei_service_url: str = "http://localhost:5002"
    seimei_service_url: str = "http://localhost:5003"

    # CORS設定
    cors_origin: str = "http://localhost:3001"

    # アプリケーション設定
    app_name: str = "Kantei FastAPI Service"
    debug: bool = False

    class Config:
        env_file = ".env.local"
        case_sensitive = False
        # Cloud Runでの環境変数読み込みを優先
        env_file_encoding = "utf-8"


settings = Settings()