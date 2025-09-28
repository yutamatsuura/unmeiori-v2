from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, kantei, template, pdf
# from app.routes import word_export  # 一時的に無効化
from app.core.database import engine
from app.models import Base

# テーブル作成（開発時の保険、本番では安全にスキップ）
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")
    # Cloud Run環境では接続エラーでも続行

app = FastAPI(
    title=settings.app_name,
    description="鑑定統合APIサービス - 九星気学と姓名判断の統合鑑定システム",
    version="1.0.0",
    debug=settings.debug
)

# CORS設定
allowed_origins = [
    getattr(settings, 'cors_origin', 'http://localhost:3001'),
    "http://localhost:3001",  # 開発環境用
    "http://127.0.0.1:3001",  # 開発環境用
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# APIルーターを登録
app.include_router(auth.router, prefix="/api/auth", tags=["認証"])
app.include_router(kantei.router, prefix="/api/kantei", tags=["鑑定"])
app.include_router(template.router, prefix="/api/template", tags=["テンプレート"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF"])
# app.include_router(word_export.router, prefix="/api", tags=["Word出力"])  # 一時的に無効化


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Kantei FastAPI Service",
        "service": "fastapi-main",
        "version": "1.0.0",
        "description": "九星気学と姓名判断の統合鑑定APIサービス"
    }


@app.get("/health")
async def health():
    """シンプルなヘルスチェックエンドポイント（Cloud Run対応）"""
    return {
        "status": "healthy",
        "service": "fastapi-main",
        "version": "1.0.0"
    }


@app.get("/health/detailed")
async def health_detailed():
    """詳細ヘルスチェックエンドポイント"""
    from sqlalchemy import text
    from app.core.database import get_db

    # データベース接続チェック
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db_status = "connected"
        db.close()
    except Exception as e:
        db_status = f"error: {str(e)}"

    # マイクロサービスのヘルスチェック（エラーでも続行）
    try:
        from app.services import kyusei_service, seimei_service
        kyusei_healthy = await kyusei_service.health_check()
        seimei_healthy = await seimei_service.health_check()
        microservices = {
            "kyusei": "healthy" if kyusei_healthy else "unhealthy",
            "seimei": "healthy" if seimei_healthy else "unhealthy"
        }
    except Exception as e:
        microservices = {"error": str(e)}

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "fastapi-main",
        "database": db_status,
        "microservices": microservices
    }


@app.get("/api/status")
async def status():
    """詳細ステータス"""
    return {
        "app_name": settings.app_name,
        "database_url": settings.database_url.split("@")[1] if "@" in settings.database_url else "configured",
        "kyusei_service": settings.kyusei_service_url,
        "seimei_service": settings.seimei_service_url,
        "debug": settings.debug
    }