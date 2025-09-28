#!/usr/bin/env python3
"""
CRUD操作テストスクリプト
実証性の原則に基づき、全てのデータベース操作を実際に実行して確認する
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User, KanteiRecord, TemplateSettings, EmailHistory
from app.core.security import get_password_hash
import json
from datetime import datetime

def setup_tables():
    """テーブル作成"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ テーブル作成/確認完了")
        return True
    except Exception as e:
        print(f"❌ テーブル作成エラー: {e}")
        return False

def test_user_crud():
    """ユーザーCRUDテスト"""
    print("\n=== User CRUD テスト ===")
    db: Session = SessionLocal()

    try:
        # CREATE - テストユーザー2作成
        test_email = "crud_test@example.com"
        existing = db.query(User).filter(User.email == test_email).first()

        if existing:
            print(f"既存ユーザーを削除: {existing.email}")
            db.delete(existing)
            db.commit()

        # シンプルなパスワードでハッシュ化
        password = "crud123"
        hashed_password = get_password_hash(password)
        new_user = User(
            email=test_email,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=False
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ CREATE: ユーザー作成完了 (ID: {new_user.id})")

        # READ - ユーザー取得
        user = db.query(User).filter(User.email == test_email).first()
        print(f"✅ READ: ユーザー取得完了 (ID: {user.id}, Email: {user.email})")

        # UPDATE - ユーザー更新
        user.is_admin = True
        db.commit()
        db.refresh(user)
        print(f"✅ UPDATE: ユーザー更新完了 (is_admin: {user.is_admin})")

        # DELETE - ユーザー削除
        user_id = user.id
        db.delete(user)
        db.commit()

        deleted_user = db.query(User).filter(User.id == user_id).first()
        if deleted_user is None:
            print(f"✅ DELETE: ユーザー削除完了 (ID: {user_id})")
        else:
            print(f"❌ DELETE: 削除失敗")

        return True

    except Exception as e:
        print(f"❌ User CRUDエラー: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def test_kantei_record_crud():
    """鑑定記録CRUDテスト"""
    print("\n=== KanteiRecord CRUD テスト ===")
    db: Session = SessionLocal()

    try:
        # テストユーザーを取得（test@example.comを使用）
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            print("❌ テストユーザーが見つかりません")
            return False

        # CREATE - 鑑定記録作成
        kantei_data = {
            "name": "テスト太郎",
            "birthdate": "1990-05-15",
            "gender": "男",
            "birth_time": "10:30"
        }

        new_record = KanteiRecord(
            user_id=test_user.id,
            client_name=kantei_data["name"],
            client_birth_date=kantei_data["birthdate"],
            kyusei_result=json.dumps({"star": 5, "direction": "北"})
        )

        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        print(f"✅ CREATE: 鑑定記録作成完了 (ID: {new_record.id})")

        # READ - 鑑定記録取得
        record = db.query(KanteiRecord).filter(KanteiRecord.id == new_record.id).first()
        print(f"✅ READ: 鑑定記録取得完了 (名前: {record.client_name}, 生年月日: {record.client_birth_date})")

        # UPDATE - 鑑定記録更新
        record.seimei_result = json.dumps({"total_score": 85, "luck": "大吉"})
        db.commit()
        db.refresh(record)
        print(f"✅ UPDATE: 鑑定記録更新完了 (姓名判断結果追加)")

        # DELETE - 鑑定記録削除
        record_id = record.id
        db.delete(record)
        db.commit()

        deleted_record = db.query(KanteiRecord).filter(KanteiRecord.id == record_id).first()
        if deleted_record is None:
            print(f"✅ DELETE: 鑑定記録削除完了 (ID: {record_id})")
        else:
            print(f"❌ DELETE: 削除失敗")

        return True

    except Exception as e:
        print(f"❌ KanteiRecord CRUDエラー: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def test_template_settings_crud():
    """テンプレート設定CRUDテスト"""
    print("\n=== TemplateSettings CRUD テスト ===")
    db: Session = SessionLocal()

    try:
        # テストユーザーを取得
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            print("❌ テストユーザーが見つかりません")
            return False

        # CREATE - テンプレート設定作成
        template_settings = TemplateSettings(
            user_id=test_user.id,
            company_name="テスト鑑定事務所",
            company_logo_path="/path/to/logo.png",
            primary_color="#0066cc",
            secondary_color="#cccccc"
        )

        db.add(template_settings)
        db.commit()
        db.refresh(template_settings)
        print(f"✅ CREATE: テンプレート設定作成完了 (ID: {template_settings.id})")

        # READ - テンプレート設定取得
        settings = db.query(TemplateSettings).filter(TemplateSettings.user_id == test_user.id).first()
        print(f"✅ READ: テンプレート設定取得完了 (会社名: {settings.company_name})")

        # UPDATE - テンプレート設定更新
        settings.company_name = "更新テスト鑑定事務所"
        settings.primary_color = "#00cc66"
        db.commit()
        db.refresh(settings)
        print(f"✅ UPDATE: テンプレート設定更新完了 (新会社名: {settings.company_name})")

        # DELETE - テンプレート設定削除
        settings_id = settings.id
        db.delete(settings)
        db.commit()

        deleted_settings = db.query(TemplateSettings).filter(TemplateSettings.id == settings_id).first()
        if deleted_settings is None:
            print(f"✅ DELETE: テンプレート設定削除完了 (ID: {settings_id})")
        else:
            print(f"❌ DELETE: 削除失敗")

        return True

    except Exception as e:
        print(f"❌ TemplateSettings CRUDエラー: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def test_relationships():
    """リレーション関係テスト"""
    print("\n=== リレーション関係テスト ===")
    db: Session = SessionLocal()

    try:
        # テストユーザー取得
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("❌ テストユーザーが見つかりません")
            return False

        print(f"✅ ユーザー取得: {user.email}")

        # ユーザーの鑑定記録を取得（リレーション経由）
        kantei_records = db.query(KanteiRecord).filter(KanteiRecord.user_id == user.id).all()
        print(f"✅ ユーザーの鑑定記録数: {len(kantei_records)}")

        # ユーザーのテンプレート設定を取得（リレーション経由）
        template_settings = db.query(TemplateSettings).filter(TemplateSettings.user_id == user.id).all()
        print(f"✅ ユーザーのテンプレート設定数: {len(template_settings)}")

        return True

    except Exception as e:
        print(f"❌ リレーション関係テストエラー: {e}")
        return False
    finally:
        db.close()

def main():
    print("=== sindankantei データベースCRUDテスト ===")

    # テーブル作成
    if not setup_tables():
        exit(1)

    # CRUDテスト実行
    tests = [
        ("User CRUD", test_user_crud),
        ("KanteiRecord CRUD", test_kantei_record_crud),
        ("TemplateSettings CRUD", test_template_settings_crud),
        ("リレーション関係", test_relationships),
    ]

    success_count = 0
    for test_name, test_func in tests:
        try:
            if test_func():
                success_count += 1
            else:
                print(f"❌ {test_name} 失敗")
        except Exception as e:
            print(f"❌ {test_name} 例外エラー: {e}")

    print(f"\n=== テスト結果 ===")
    print(f"実行: {len(tests)} / 成功: {success_count}")

    if success_count == len(tests):
        print("✅ 全てのCRUDテストが成功しました")
        return True
    else:
        print("❌ 一部のテストが失敗しました")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)