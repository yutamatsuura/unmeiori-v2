import httpx
import asyncio
import os
import datetime
from typing import Dict, Any, Optional
from app.core.config import settings

# ログファイル設定
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

def write_debug_log(message: str, service: str = "kyusei"):
    """デバッグログをファイルに出力"""
    timestamp = datetime.datetime.now().isoformat()
    log_file = os.path.join(LOG_DIR, f"{service}_service.log")
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {message}\n")
    except Exception as e:
        print(f"ログ書き込みエラー: {e}")


class KyuseiService:
    """九星気学サービス連携クラス"""

    def __init__(self):
        self.base_url = settings.kyusei_service_url
        self.timeout = 30.0

    async def calculate_kyusei(self, name: str, birth_date: str) -> Optional[Dict[str, Any]]:
        """九星気学計算を実行"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/kyusei/calculate",
                    json={
                        "birthDate": birth_date
                    }
                )
                response.raise_for_status()
                result = response.json()
                print(f"九星気学サービスレスポンス: {result}")
                write_debug_log(f"九星気学計算成功 - {name}, {birth_date} -> {result}")
                return result

        except httpx.HTTPError as e:
            error_msg = f"九星気学サービスへのリクエストエラー: {e}"
            print(error_msg)
            write_debug_log(f"HTTPエラー - {name}, {birth_date} - {error_msg}")
            if hasattr(e, 'response') and e.response is not None:
                response_text = e.response.text
                print(f"レスポンス詳細: {response_text}")
                write_debug_log(f"レスポンス詳細: {response_text}")
            return None
        except Exception as e:
            error_msg = f"九星気学計算エラー: {e}"
            print(error_msg)
            write_debug_log(f"例外エラー - {name}, {birth_date} - {error_msg}")
            return None

    async def get_detailed_analysis(self, birth_date: str) -> Optional[Dict[str, Any]]:
        """詳細分析を取得"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/detailed",
                    params={"birth_date": birth_date}
                )
                response.raise_for_status()
                return response.json()

        except httpx.HTTPError as e:
            print(f"九星気学詳細分析エラー: {e}")
            return None
        except Exception as e:
            print(f"九星気学詳細分析エラー: {e}")
            return None

    async def health_check(self) -> bool:
        """九星気学サービスのヘルスチェック"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except:
            return False


# シングルトンインスタンス
kyusei_service = KyuseiService()