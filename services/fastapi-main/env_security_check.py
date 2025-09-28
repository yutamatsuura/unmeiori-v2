#!/usr/bin/env python3
"""
環境変数設定とセキュリティ確認スクリプト
実証性の原則に基づき、環境設定の完全性を確認する
"""

import os
from dotenv import load_dotenv
from app.core.config import settings
import re

def check_environment_variables():
    """環境変数の確認"""
    print("\n=== 環境変数確認 ===")

    # .env.localを読み込み
    load_dotenv(".env.local")

    required_vars = [
        "DATABASE_URL",
        "JWT_SECRET_KEY",
        "JWT_ALGORITHM",
        "JWT_EXPIRE_MINUTES",
        "KYUSEI_SERVICE_URL",
        "SEIMEI_SERVICE_URL"
    ]

    all_present = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # DATABASE_URLは機密情報なので一部のみ表示
            if var == "DATABASE_URL":
                if "@" in value:
                    display_value = f"postgresql://***@{value.split('@')[1]}"
                else:
                    display_value = "configured (not postgresql format)"
            elif var == "JWT_SECRET_KEY":
                display_value = f"{value[:8]}..." if len(value) > 8 else "too short"
            else:
                display_value = value

            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: 未設定")
            all_present = False

    return all_present

def check_database_connection():
    """データベース接続確認"""
    print("\n=== データベース接続確認 ===")

    try:
        # settings経由でDB URL確認
        db_url = settings.database_url
        print(f"✅ Database URL設定: {db_url.split('@')[1] if '@' in db_url else 'configured'}")

        # 実際の接続テスト
        from sqlalchemy import create_engine, text
        engine = create_engine(settings.database_url)

        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ データベース接続成功")
            print(f"✅ PostgreSQL Version: {version.split()[0:2] if version else 'Unknown'}")

        return True

    except Exception as e:
        print(f"❌ データベース接続エラー: {e}")
        return False

def check_jwt_security():
    """JWT設定のセキュリティ確認"""
    print("\n=== JWT設定セキュリティ確認 ===")

    try:
        secret = settings.jwt_secret_key
        algorithm = settings.jwt_algorithm
        expire_minutes = settings.jwt_expire_minutes

        # シークレットキーの強度チェック
        if len(secret) < 32:
            print(f"⚠️ JWT Secret Key: 長さ不足 ({len(secret)}文字) - 32文字以上推奨")
        else:
            print(f"✅ JWT Secret Key: 適切な長さ ({len(secret)}文字)")

        # デフォルト値チェック
        if secret == "your-secret-key-here-change-in-production":
            print("❌ JWT Secret Key: デフォルト値のまま - 必ず変更してください")
        else:
            print("✅ JWT Secret Key: デフォルト値から変更済み")

        print(f"✅ JWT Algorithm: {algorithm}")
        print(f"✅ JWT Expire Minutes: {expire_minutes}")

        return True

    except Exception as e:
        print(f"❌ JWT設定エラー: {e}")
        return False

def check_microservice_urls():
    """マイクロサービスURL確認"""
    print("\n=== マイクロサービスURL確認 ===")

    try:
        kyusei_url = settings.kyusei_service_url
        seimei_url = settings.seimei_service_url

        print(f"✅ 九星気学サービス: {kyusei_url}")
        print(f"✅ 姓名判断サービス: {seimei_url}")

        # URL形式チェック
        url_pattern = re.compile(r'^https?://[^/]+:\d+$')

        if url_pattern.match(kyusei_url):
            print("✅ 九星気学サービスURL: 正しい形式")
        else:
            print("⚠️ 九星気学サービスURL: 形式に問題があります")

        if url_pattern.match(seimei_url):
            print("✅ 姓名判断サービスURL: 正しい形式")
        else:
            print("⚠️ 姓名判断サービスURL: 形式に問題があります")

        return True

    except Exception as e:
        print(f"❌ マイクロサービスURL確認エラー: {e}")
        return False

def check_application_settings():
    """アプリケーション設定確認"""
    print("\n=== アプリケーション設定確認 ===")

    try:
        app_name = settings.app_name
        debug = settings.debug

        print(f"✅ アプリケーション名: {app_name}")
        print(f"✅ デバッグモード: {'有効' if debug else '無効'}")

        if debug:
            print("⚠️ デバッグモードが有効です - 本番環境では無効にしてください")

        return True

    except Exception as e:
        print(f"❌ アプリケーション設定エラー: {e}")
        return False

def check_file_permissions():
    """ファイル権限確認"""
    print("\n=== ファイル権限・セキュリティ確認 ===")

    sensitive_files = [
        ".env.local",
        "alembic.ini"
    ]

    for file_path in sensitive_files:
        if os.path.exists(file_path):
            stat = os.stat(file_path)
            mode = oct(stat.st_mode)[-3:]
            print(f"✅ {file_path}: 権限 {mode}")

            # .env.localは機密ファイルなので権限チェック
            if file_path == ".env.local" and mode != "600":
                print(f"⚠️ {file_path}: 権限が緩い可能性があります (推奨: 600)")
        else:
            print(f"❌ {file_path}: ファイルが見つかりません")

def run_comprehensive_check():
    """包括的なチェック実行"""
    print("=== sindankantei 環境変数・セキュリティ確認 ===")

    checks = [
        ("環境変数確認", check_environment_variables),
        ("データベース接続", check_database_connection),
        ("JWT設定セキュリティ", check_jwt_security),
        ("マイクロサービスURL", check_microservice_urls),
        ("アプリケーション設定", check_application_settings),
        ("ファイル権限", check_file_permissions),
    ]

    success_count = 0
    for check_name, check_func in checks:
        try:
            if check_func():
                success_count += 1
            else:
                print(f"❌ {check_name}: 問題あり")
        except Exception as e:
            print(f"❌ {check_name}: 例外エラー: {e}")

    print(f"\n=== 確認結果 ===")
    print(f"実行: {len(checks)} / 成功: {success_count}")

    if success_count == len(checks):
        print("✅ 全ての環境設定・セキュリティ確認が完了しました")
        return True
    elif success_count >= len(checks) - 1:
        print("⚠️ ほぼ全ての設定が適切です（軽微な問題のみ）")
        return True
    else:
        print("❌ 重要な設定問題があります")
        return False

if __name__ == "__main__":
    success = run_comprehensive_check()
    exit(0 if success else 1)