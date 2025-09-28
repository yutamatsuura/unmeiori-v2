import httpx
import asyncio
import os
import datetime
from typing import Dict, Any, Optional
from app.core.config import settings

# ログファイル設定
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

def write_debug_log(message: str, service: str = "seimei"):
    """デバッグログをファイルに出力"""
    timestamp = datetime.datetime.now().isoformat()
    log_file = os.path.join(LOG_DIR, f"{service}_service.log")
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {message}\n")
    except Exception as e:
        print(f"ログ書き込みエラー: {e}")


class SeimeiService:
    """姓名判断サービス連携クラス"""

    def __init__(self):
        self.base_url = settings.seimei_service_url
        self.timeout = 30.0

    async def analyze_name(self, name: str) -> Optional[Dict[str, Any]]:
        """姓名判断分析を実行"""
        try:
            # 名前を姓と名に分割（簡単な実装）
            name_parts = name.strip().split()
            if len(name_parts) >= 2:
                sei = name_parts[0]
                mei = ' '.join(name_parts[1:])
            else:
                # スペースがない場合、文字数で分割（仮）
                if len(name) >= 2:
                    sei = name[0]
                    mei = name[1:]
                else:
                    sei = name
                    mei = ""

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # 詳細解説付き分析APIを呼び出し
                response = await client.post(
                    f"{self.base_url}/seimei/analyze",
                    json={
                        "sei": sei,
                        "mei": mei,
                        "options": {
                            "includeDetail": True
                        }
                    }
                )
                response.raise_for_status()
                result = response.json()
                print(f"姓名判断サービスレスポンス: {result}")
                write_debug_log(f"姓名判断分析成功 - {name} ({sei}, {mei}) -> {result}")

                # フロントエンドが期待する形式に変換
                data = result.get("data", {})
                kakusu = data.get("kakusu", {})
                converted_result = {
                    "total": kakusu.get("soukaku", 0),
                    "heaven": kakusu.get("tenkaku", 0),
                    "earth": kakusu.get("chikaku", 0),
                    "personality": kakusu.get("jinkaku", 0),
                    "original_response": result  # 詳細解説データを含む完全なレスポンス
                }
                return converted_result

        except httpx.HTTPError as e:
            error_msg = f"姓名判断サービスへのリクエストエラー: {e}"
            print(error_msg)
            write_debug_log(f"HTTPエラー - {name} ({sei}, {mei}) - {error_msg}")
            if hasattr(e, 'response') and e.response is not None:
                response_text = e.response.text
                print(f"レスポンス詳細: {response_text}")
                write_debug_log(f"レスポンス詳細: {response_text}")
            return None
        except Exception as e:
            error_msg = f"姓名判断分析エラー: {e}"
            print(error_msg)
            write_debug_log(f"例外エラー - {name} ({sei}, {mei}) - {error_msg}")
            return None

    async def analyze_name_separated(self, surname: str, given_name: str) -> Optional[Dict[str, Any]]:
        """姓名判断分析を実行（姓・名分離版）"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # 詳細解説付き分析APIを呼び出し（姓・名分離）
                response = await client.post(
                    f"{self.base_url}/seimei/analyze",
                    json={
                        "sei": surname,
                        "mei": given_name,
                        "options": {
                            "includeDetail": True
                        }
                    }
                )
                response.raise_for_status()
                result = response.json()
                print(f"姓名判断サービスレスポンス（分離版）: {result}")
                write_debug_log(f"姓名判断分析成功（分離版） - 姓: {surname}, 名: {given_name} -> {result}")

                # フロントエンドが期待する形式に変換
                data = result.get("data", {})
                kakusu = data.get("kakusu", {})
                converted_result = {
                    "total": kakusu.get("soukaku", 0),
                    "heaven": kakusu.get("tenkaku", 0),
                    "earth": kakusu.get("chikaku", 0),
                    "personality": kakusu.get("jinkaku", 0),
                    "original_response": result  # 詳細解説データを含む完全なレスポンス
                }
                return converted_result

        except httpx.HTTPError as e:
            error_msg = f"姓名判断サービスへのリクエストエラー（分離版）: {e}"
            print(error_msg)
            write_debug_log(f"HTTPエラー（分離版） - 姓: {surname}, 名: {given_name} - {error_msg}")
            if hasattr(e, 'response') and e.response is not None:
                response_text = e.response.text
                print(f"レスポンス詳細: {response_text}")
                write_debug_log(f"レスポンス詳細: {response_text}")
            return None
        except Exception as e:
            error_msg = f"姓名判断分析エラー（分離版）: {e}"
            print(error_msg)
            write_debug_log(f"例外エラー（分離版） - 姓: {surname}, 名: {given_name} - {error_msg}")
            return None

    async def get_name_fortune(self, name: str) -> Optional[Dict[str, Any]]:
        """名前の運勢を取得"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/fortune",
                    params={"name": name}
                )
                response.raise_for_status()
                return response.json()

        except httpx.HTTPError as e:
            print(f"姓名判断運勢取得エラー: {e}")
            return None
        except Exception as e:
            print(f"姓名判断運勢取得エラー: {e}")
            return None

    async def health_check(self) -> bool:
        """姓名判断サービスのヘルスチェック"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except:
            return False


# シングルトンインスタンス
seimei_service = SeimeiService()