from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# PostgreSQL接続エンジンを作成（同期版）
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,  # プールサイズを拡張
    max_overflow=20,  # オーバーフローを拡張
    echo=False  # 本番環境ではFalse
)

# 非同期エンジン（必要に応じて）
async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
async_engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,  # プールサイズを拡張
    max_overflow=20,  # オーバーフローを拡張
    echo=False
)

# セッションメーカーを作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ベースクラスを作成
Base = declarative_base()


# データベースセッションの依存関数（同期版）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 非同期データベースセッションの依存関数
async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session