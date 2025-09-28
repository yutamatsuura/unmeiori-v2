"""
日本語フォント管理サービス
環境に依存しない確実な日本語フォント提供
"""

import os
import urllib.request
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class FontManager:
    """日本語フォント管理クラス"""

    def __init__(self, fonts_dir: str = None):
        """初期化"""
        # フォントディレクトリの設定
        if fonts_dir is None:
            current_dir = Path(__file__).parent.parent
            self.fonts_dir = current_dir / "fonts"
        else:
            self.fonts_dir = Path(fonts_dir)

        # ディレクトリ作成
        self.fonts_dir.mkdir(exist_ok=True)

        # 日本語フォント設定（Noto Sans CJK JP使用）
        self.font_config = {
            "NotoSansCJK-Regular": {
                "filename": "NotoSansCJKjp-VF.ttf",
                "url": "https://github.com/googlefonts/noto-cjk/raw/main/Sans/Variable/TTF/NotoSansCJKjp-VF.ttf",
                "description": "Noto Sans CJK JP Variable Font (Japanese)"
            },
            "NotoSansCJK-Bold": {
                "filename": "NotoSansMonoCJKjp-VF.ttf",
                "url": "https://github.com/googlefonts/noto-cjk/raw/main/Sans/Variable/TTF/Mono/NotoSansMonoCJKjp-VF.ttf",
                "description": "Noto Sans Mono CJK JP Variable Font (Japanese)"
            }
        }

    def get_font_path(self, font_name: str = "NotoSansCJK-Regular") -> Optional[str]:
        """フォントファイルのパスを取得（必要に応じてダウンロード）"""

        if font_name not in self.font_config:
            logger.error(f"Unknown font: {font_name}")
            return None

        font_info = self.font_config[font_name]
        font_path = self.fonts_dir / font_info["filename"]

        # フォントファイルが存在するかチェック
        if font_path.exists() and font_path.stat().st_size > 1000:  # 1KB以上
            logger.info(f"Font already exists: {font_path}")
            return str(font_path)

        # フォントファイルをダウンロード
        if self._download_font(font_name):
            return str(font_path)

        return None

    def _download_font(self, font_name: str) -> bool:
        """フォントファイルをダウンロード"""

        if font_name not in self.font_config:
            return False

        font_info = self.font_config[font_name]
        font_path = self.fonts_dir / font_info["filename"]

        # プライマリURLから試行
        if self._download_from_url(font_info["url"], font_path, font_info["description"]):
            return True

        # バックアップURLから試行（存在する場合）
        if "backup_url" in font_info:
            logger.warning(f"Primary URL failed, trying backup URL for {font_name}")
            if self._download_from_url(font_info["backup_url"], font_path, font_info["description"]):
                return True

        return False

    def _download_from_url(self, url: str, dest_path: Path, description: str) -> bool:
        """指定URLからフォントファイルをダウンロード"""

        try:
            logger.info(f"Downloading {description} from {url}")

            # User-Agentを設定してダウンロード
            request = urllib.request.Request(
                url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )

            with urllib.request.urlopen(request, timeout=30) as response:
                if response.status != 200:
                    logger.error(f"HTTP error {response.status} when downloading {url}")
                    return False

                # ファイルサイズチェック
                content_length = response.headers.get('Content-Length')
                if content_length and int(content_length) < 1000:
                    logger.error(f"Downloaded file too small: {content_length} bytes")
                    return False

                # ファイル保存
                with open(dest_path, 'wb') as f:
                    while True:
                        chunk = response.read(8192)  # 8KB chunks
                        if not chunk:
                            break
                        f.write(chunk)

            # ダウンロード成功確認
            if dest_path.exists() and dest_path.stat().st_size > 1000:
                logger.info(f"Successfully downloaded {description} ({dest_path.stat().st_size} bytes)")
                return True
            else:
                logger.error(f"Download failed: file size {dest_path.stat().st_size} bytes")
                if dest_path.exists():
                    dest_path.unlink()  # 不完全なファイルを削除
                return False

        except Exception as e:
            logger.error(f"Download error for {url}: {e}")
            if dest_path.exists():
                dest_path.unlink()  # エラー時は不完全なファイルを削除
            return False

    def list_available_fonts(self) -> Dict[str, Any]:
        """利用可能なフォントの一覧を取得"""

        result = {}
        for font_name, font_info in self.font_config.items():
            font_path = self.fonts_dir / font_info["filename"]
            result[font_name] = {
                "description": font_info["description"],
                "filename": font_info["filename"],
                "exists": font_path.exists(),
                "size": font_path.stat().st_size if font_path.exists() else 0,
                "path": str(font_path) if font_path.exists() else None
            }

        return result

    def cleanup_fonts(self) -> int:
        """不完全または古いフォントファイルをクリーンアップ"""

        cleaned_count = 0

        try:
            for font_file in self.fonts_dir.glob("*"):
                if font_file.is_file():
                    # 1KB未満のファイルは不完全とみなして削除
                    if font_file.stat().st_size < 1000:
                        logger.info(f"Removing incomplete font file: {font_file}")
                        font_file.unlink()
                        cleaned_count += 1

        except Exception as e:
            logger.error(f"Font cleanup error: {e}")

        return cleaned_count

    def ensure_fonts_ready(self) -> bool:
        """必要なフォントが準備されていることを確認"""

        # 最低限必要なフォント
        required_fonts = ["NotoSansCJK-Regular"]

        for font_name in required_fonts:
            font_path = self.get_font_path(font_name)
            if not font_path:
                logger.warning(f"Could not prepare font: {font_name}, but system fonts may be available")
                # フォントダウンロードに失敗してもシステムフォントが利用可能な場合は続行
                return True

        logger.info("All required fonts are ready")
        return True


# シングルトンインスタンス
font_manager = FontManager()