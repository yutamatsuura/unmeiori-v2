#!/usr/bin/env python3
"""
テストユーザー作成スクリプト
実証性の原則に基づき、確実にテストユーザーをデータベースに登録する
"""

import asyncio
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User
from app.core.security import get_password_hash

def create_test_user():
    """テストユーザーを作成"""
    # テーブル作成
    Base.metadata.create_all(bind=engine)

    # セッション作成
    db: Session = SessionLocal()

    try:
        # 既存のテストユーザーを確認
        existing_user = db.query(User).filter(User.email == "test@example.com").first()

        if existing_user:
            print("テストユーザーは既に存在します")
            print(f"ユーザーID: {existing_user.id}")
            print(f"メール: {existing_user.email}")
            print(f"アクティブ: {existing_user.is_active}")
            return existing_user

        # テストユーザーを作成
        hashed_password = get_password_hash("testpass123")

        test_user = User(
            email="test@example.com",
            hashed_password=hashed_password,
            is_active=True,
            is_admin=False
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print("テストユーザーを作成しました")
        print(f"ユーザーID: {test_user.id}")
        print(f"メール: {test_user.email}")
        print(f"パスワード: testpass123")
        print(f"アクティブ: {test_user.is_active}")

        return test_user

    except Exception as e:
        print(f"エラーが発生しました: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def verify_database_connection():
    """データベース接続確認"""
    try:
        db: Session = SessionLocal()
        # シンプルなクエリでテスト
        result = db.execute(text("SELECT 1 as test")).fetchone()
        db.close()
        print(f"✅ データベース接続成功: {result[0]}")
        return True
    except Exception as e:
        print(f"❌ データベース接続失敗: {e}")
        return False

if __name__ == "__main__":
    print("=== sindankantei データベース統合テスト ===")

    # 1. データベース接続確認
    print("\n1. データベース接続確認...")
    if not verify_database_connection():
        exit(1)

    # 2. テストユーザー作成
    print("\n2. テストユーザー作成...")
    user = create_test_user()

    if user:
        print("\n✅ データベース統合完了")
    else:
        print("\n❌ データベース統合失敗")
        exit(1)