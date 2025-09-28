from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# 最小設定でCloud Run起動確認
app = FastAPI(
    title="Kantei FastAPI Service",
    description="鑑定統合APIサービス - 九星気学と姓名判断の統合鑑定システム",
    version="1.0.0"
)

# 基本CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Cloud Run起動確認後に他の設定を段階的に追加


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