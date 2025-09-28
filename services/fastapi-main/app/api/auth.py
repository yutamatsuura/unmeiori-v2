from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.models import User
from app.schemas import UserCreate, User as UserSchema, Token, ThemeSettingsUpdate, ThemeSettingsResponse
from typing import Optional

router = APIRouter()
security = HTTPBearer()


# 依存関数: 現在のユーザーを取得
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """JWTトークンから現在のユーザーを取得"""
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


@router.post("/register", response_model=UserSchema)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """ユーザー登録"""
    # 既存ユーザーチェック
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # ユーザー作成
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=False
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(user_data: UserCreate, db: Session = Depends(get_db)):
    """ログイン"""
    # ユーザー認証
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # トークン作成
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify", response_model=UserSchema)
async def verify_token_endpoint(current_user: User = Depends(get_current_user)):
    """トークン検証"""
    return current_user


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    """現在のユーザー情報取得"""
    return current_user


@router.post("/logout")
async def logout():
    """ログアウト（クライアント側でトークンを削除）"""
    return {"message": "Successfully logged out"}


@router.get("/theme", response_model=ThemeSettingsResponse)
async def get_user_theme(current_user: User = Depends(get_current_user)):
    """ユーザーのテーマ設定取得"""
    return ThemeSettingsResponse(
        theme_id=current_user.preferred_theme or 'classic-blue',
        message="Theme retrieved successfully"
    )


@router.put("/theme", response_model=ThemeSettingsResponse)
async def update_user_theme(
    theme_data: ThemeSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーのテーマ設定更新"""
    current_user.preferred_theme = theme_data.theme_id
    db.commit()
    db.refresh(current_user)

    return ThemeSettingsResponse(
        theme_id=current_user.preferred_theme,
        message="Theme updated successfully"
    )