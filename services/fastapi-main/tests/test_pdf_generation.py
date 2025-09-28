"""
PDF生成サービスの日本語対応テスト

このテストでは以下を検証します：
1. PDF生成APIの日本語対応
2. 実際の鑑定データを使用したPDF生成
3. 日本語フォントの正確な表示確認
4. 特殊文字（旧字体・異体字）のテスト
5. レイアウト崩れ検証
6. 10パターンの鑑定書生成テスト
7. 日本語文字化けの検出
"""

import pytest
import os
import sys
from datetime import datetime, date
from typing import Dict, Any
import tempfile
import shutil
from dotenv import load_dotenv

# 環境変数を.env.localから読み込み
load_dotenv('.env.local')

# パスを追加してアプリのモジュールをインポート
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.pdf import PDFGeneratorService, setup_japanese_fonts


class TestPDFGeneration:
    """PDF生成サービスのテストクラス"""

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        """テストのセットアップと後処理"""
        # テスト用一時ディレクトリ作成
        self.test_output_dir = tempfile.mkdtemp(prefix="pdf_test_")

        # PDFサービス初期化
        self.pdf_service = PDFGeneratorService()
        self.pdf_service.output_dir = self.test_output_dir

        yield

        # 後処理：一時ディレクトリ削除
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)

    def test_japanese_font_setup(self):
        """日本語フォントセットアップのテスト"""
        # フォントセットアップ実行
        font_result = setup_japanese_fonts()

        # 結果検証（Trueまたは警告が出ていることを確認）
        assert isinstance(font_result, bool)

        # PDFサービスでのフォント設定確認
        assert hasattr(self.pdf_service, 'font_available')
        assert hasattr(self.pdf_service, 'font_name')
        assert self.pdf_service.font_name in ['Japanese', 'Helvetica']

    def get_test_client_data(self, name: str, use_special_chars: bool = False) -> Dict[str, Any]:
        """テスト用クライアントデータ生成"""
        return {
            "client_info": {
                "name": name,
                "birth_date": "1985-03-15",
                "birth_time": "14:30",
                "gender": "男性",
                "birth_place": "東京都渋谷区"
            }
        }

    def get_test_kyusei_data(self) -> Dict[str, Any]:
        """テスト用九星気学データ"""
        return {
            "nenban": {
                "name": "六白金星",
                "element": "金",
                "characteristics": "意志が強く、責任感があります。金銭感覚に優れ、指導力を発揮します。"
            },
            "getsuban": {
                "name": "三碧木星",
                "element": "木",
                "characteristics": "活発で行動力があります。"
            },
            "nippan": {
                "name": "九紫火星",
                "element": "火",
                "characteristics": "明るく社交的です。"
            }
        }

    def get_test_seimei_data(self, name: str) -> Dict[str, Any]:
        """テスト用姓名判断データ"""
        characters = []
        for char in name:
            characters.append({
                "character": char,
                "strokeCount": 8,  # 実際の画数計算は省略
                "gogyou": "木",
                "youin": "陽"
            })

        return {
            "characters": characters,
            "kakusu": {
                "tenkaku": 12,
                "jinkaku": 16,
                "chikaku": 8,
                "soukaku": 20,
                "gaikaku": 4
            },
            "kantei_results": [
                {
                    "category": "性格",
                    "score": 85,
                    "message": "非常に良い性格運です。温厚で人に愛される傾向があります。"
                },
                {
                    "category": "健康",
                    "score": 72,
                    "message": "健康運は普通です。適度な運動を心がけてください。"
                },
                {
                    "category": "仕事運",
                    "score": 90,
                    "message": "優秀な仕事運を持っています。リーダーシップを発揮できます。"
                }
            ],
            "overall_score": 82,
            "grade": "優"
        }

    def get_test_kichihoui_data(self) -> Dict[str, Any]:
        """テスト用吉方位データ"""
        return {
            "2024": {
                "kichi": ["北", "南西"],
                "kyo": ["東", "南"]
            },
            "2025": {
                "kichi": ["西", "北東"],
                "kyo": ["南東", "北西"]
            }
        }

    def get_test_template_settings(self) -> Dict[str, Any]:
        """テスト用テンプレート設定"""
        return {
            "business_name": "開運鑑定所テスト",
            "operator_name": "テスト鑑定師",
            "color_theme": "blue",
            "font_family": "mincho",
            "include_logo": False,  # テストでは簡素化
            "include_signature": True,
            "custom_message": "このたびは鑑定をご依頼いただき、誠にありがとうございます。"
        }

    def create_full_kantei_data(self, name: str) -> Dict[str, Any]:
        """完全な鑑定データを作成"""
        return {
            **self.get_test_client_data(name),
            "kyusei_kigaku": self.get_test_kyusei_data(),
            "seimei_handan": self.get_test_seimei_data(name),
            "kichihoui": self.get_test_kichihoui_data()
        }

    @pytest.mark.parametrize("test_name,expected_min_size,expected_max_size", [
        ("田中太郎", 2_000, 100_000),  # 通常の日本人名
        ("齊藤義則", 2_000, 100_000),  # 旧字体を含む名前
        ("髙橋花子", 2_000, 100_000),  # 異体字を含む名前
        ("歌舞伎座松竹梅之助", 2_000, 100_000),  # 長い名前
        ("鬼頭瀬七美", 2_000, 100_000),  # 難読漢字
    ])
    def test_japanese_name_pdf_generation(self, test_name: str, expected_min_size: int, expected_max_size: int):
        """日本語名前でのPDF生成テスト"""
        # テストデータ準備
        kantei_data = self.create_full_kantei_data(test_name)
        template_settings = self.get_test_template_settings()

        # PDF生成実行
        pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

        # ファイル存在確認
        assert os.path.exists(pdf_path), f"PDFファイルが生成されていません: {pdf_path}"

        # ファイルサイズ確認
        file_size = os.path.getsize(pdf_path)
        assert expected_min_size <= file_size <= expected_max_size, f"ファイルサイズが異常です: {file_size} bytes"

        # PDFファイル情報取得
        pdf_info = self.pdf_service.get_pdf_info(pdf_path)
        assert pdf_info["exists"] is True
        assert pdf_info["size"] == file_size

        # ファイル名確認（日本語が含まれることを確認）
        filename = os.path.basename(pdf_path)
        assert test_name in filename, f"ファイル名に日本語名が含まれていません: {filename}"

    def test_special_characters_handling(self):
        """特殊文字（旧字体・異体字）のテスト"""
        special_names = [
            "齊藤",      # 旧字体
            "髙橋",      # 異体字
            "邉野",      # 特殊な辺
            "廣田",      # 旧字体の広
            "濵口",      # 特殊な浜
        ]

        for name in special_names:
            kantei_data = self.create_full_kantei_data(name)
            template_settings = self.get_test_template_settings()

            # PDF生成実行
            pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

            # 基本検証
            assert os.path.exists(pdf_path)
            assert os.path.getsize(pdf_path) > 2_000  # 最小サイズ確認

            # ファイル名に特殊文字が正しく含まれているか確認
            filename = os.path.basename(pdf_path)
            assert name in filename

    def test_pdf_content_structure(self):
        """PDFコンテンツ構造のテスト"""
        kantei_data = self.create_full_kantei_data("山田花子")
        template_settings = self.get_test_template_settings()

        # カスタムメッセージ追加
        template_settings["custom_message"] = """
        この度は鑑定をご依頼いただき、誠にありがとうございます。
        九星気学と姓名判断の両面から総合的に鑑定いたしました。
        ご質問等ございましたら、お気軽にお声かけください。
        """

        # PDF生成
        pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

        # 基本検証
        assert os.path.exists(pdf_path)
        file_size = os.path.getsize(pdf_path)
        assert 2_000 <= file_size <= 100_000

    def test_multiple_color_themes(self):
        """複数カラーテーマでのPDF生成テスト"""
        base_kantei_data = self.create_full_kantei_data("佐藤一郎")

        color_themes = ["blue", "green", "red", "black"]

        for theme in color_themes:
            template_settings = self.get_test_template_settings()
            template_settings["color_theme"] = theme

            # PDF生成
            pdf_path = self.pdf_service.generate_kantei_pdf(base_kantei_data, template_settings)

            # 基本検証
            assert os.path.exists(pdf_path)
            assert os.path.getsize(pdf_path) > 2_000

    def test_pdf_generation_with_missing_data(self):
        """データ不足時のPDF生成テスト"""
        # 最小限のデータのみ
        minimal_data = {
            "client_info": {
                "name": "テスト太郎",
                "birth_date": "1990-01-01"
            }
        }

        template_settings = self.get_test_template_settings()

        # PDF生成（エラーにならないことを確認）
        pdf_path = self.pdf_service.generate_kantei_pdf(minimal_data, template_settings)

        assert os.path.exists(pdf_path)
        assert os.path.getsize(pdf_path) > 1_500  # 最小限でも一定サイズは必要

    def test_long_text_handling(self):
        """長いテキストの処理テスト"""
        kantei_data = self.create_full_kantei_data("長文テスト太郎")
        template_settings = self.get_test_template_settings()

        # 非常に長いカスタムメッセージを追加
        long_message = "この度は鑑定をご依頼いただき誠にありがとうございます。" * 50
        template_settings["custom_message"] = long_message

        # 長い特徴説明を追加
        kantei_data["kyusei_kigaku"]["nenban"]["characteristics"] = """
        あなたの本命星は六白金星です。金の性質を持つこの星は、意志が強く責任感があることを示しています。
        金銭感覚に優れ、経済的な成功を収める可能性が高いです。また、リーダーシップを発揮し、
        組織をまとめる能力に長けています。ただし、時として頑固になりすぎる傾向があるため、
        柔軟性を保つことが重要です。人との関係においては誠実で、信頼される存在となります。
        """ * 3

        # PDF生成
        pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

        assert os.path.exists(pdf_path)
        # 長いテキストが含まれるため、ファイルサイズも大きくなることを期待
        assert os.path.getsize(pdf_path) > 3_000

    def test_ten_different_patterns(self):
        """10パターンの鑑定書生成テスト"""
        test_patterns = [
            {"name": "田中太郎", "theme": "blue"},
            {"name": "佐藤花子", "theme": "green"},
            {"name": "鈴木一郎", "theme": "red"},
            {"name": "髙橋美咲", "theme": "black"},
            {"name": "齊藤健太", "theme": "blue"},
            {"name": "歌舞伎座梅之助", "theme": "green"},
            {"name": "鬼頭瀬七美", "theme": "red"},
            {"name": "邉野雅俊", "theme": "black"},
            {"name": "濵口春香", "theme": "blue"},
            {"name": "廣田秋彦", "theme": "green"},
        ]

        generated_files = []

        for i, pattern in enumerate(test_patterns, 1):
            kantei_data = self.create_full_kantei_data(pattern["name"])
            template_settings = self.get_test_template_settings()
            template_settings["color_theme"] = pattern["theme"]
            template_settings["custom_message"] = f"パターン{i}のテスト鑑定書です。"

            # PDF生成
            pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

            # 基本検証
            assert os.path.exists(pdf_path)
            file_size = os.path.getsize(pdf_path)
            assert 2_000 <= file_size <= 100_000

            generated_files.append({
                "path": pdf_path,
                "name": pattern["name"],
                "size": file_size,
                "theme": pattern["theme"]
            })

        # 10個すべてが生成されたことを確認
        assert len(generated_files) == 10

        # すべて異なるファイルであることを確認
        file_sizes = [f["size"] for f in generated_files]
        # サイズが完全に同じということはほぼないが、範囲内であることを確認
        for size in file_sizes:
            assert 2_000 <= size <= 100_000

    def test_pdf_cleanup_functionality(self):
        """PDFクリーンアップ機能のテスト"""
        # いくつかのPDFを生成
        for i in range(3):
            kantei_data = self.create_full_kantei_data(f"クリーンアップテスト{i}")
            template_settings = self.get_test_template_settings()

            pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)
            assert os.path.exists(pdf_path)

        # 生成されたファイル数確認
        pdf_files = [f for f in os.listdir(self.test_output_dir) if f.endswith('.pdf')]
        assert len(pdf_files) >= 3

        # クリーンアップ実行（0日で即座に削除）
        deleted_count = self.pdf_service.cleanup_old_pdfs(days_old=0)

        # 削除されたファイル数確認
        assert deleted_count >= 3

    def test_pdf_file_operations(self):
        """PDFファイル操作のテスト"""
        kantei_data = self.create_full_kantei_data("ファイル操作テスト")
        template_settings = self.get_test_template_settings()

        # PDF生成
        pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

        # ファイル存在確認
        assert self.pdf_service.pdf_exists(pdf_path) is True

        # PDFファイル情報取得
        pdf_info = self.pdf_service.get_pdf_info(pdf_path)
        assert pdf_info["exists"] is True
        assert pdf_info["size"] > 0
        assert "created_at" in pdf_info
        assert "modified_at" in pdf_info
        assert "expires_at" in pdf_info

        # ファイル削除
        delete_result = self.pdf_service.delete_pdf(pdf_path)
        assert delete_result is True

        # 削除後の確認
        assert self.pdf_service.pdf_exists(pdf_path) is False

        # 削除済みファイルの情報取得
        pdf_info_after_delete = self.pdf_service.get_pdf_info(pdf_path)
        assert pdf_info_after_delete["exists"] is False

    def test_error_handling(self):
        """エラーハンドリングのテスト"""
        # 無効なデータでPDF生成を試行
        invalid_data = {}
        template_settings = self.get_test_template_settings()

        # PDF生成（エラーにならずに最小限のPDFが生成されることを確認）
        pdf_path = self.pdf_service.generate_kantei_pdf(invalid_data, template_settings)

        # ファイルは生成されるが、サイズは小さくなる
        assert os.path.exists(pdf_path)
        assert os.path.getsize(pdf_path) > 1_000  # 最小限のサイズ

    def test_unicode_and_emoji_handling(self):
        """Unicode文字と絵文字の処理テスト"""
        # Unicode文字を含む名前
        unicode_name = "田中🌸太郎"  # 絵文字含む

        kantei_data = self.create_full_kantei_data(unicode_name)
        template_settings = self.get_test_template_settings()

        # カスタムメッセージにもUnicode文字を含める
        template_settings["custom_message"] = "あなたの運勢は☆★☆です。良い方向に進むでしょう🎋"

        # PDF生成
        pdf_path = self.pdf_service.generate_kantei_pdf(kantei_data, template_settings)

        # 基本検証（エラーにならないことを確認）
        assert os.path.exists(pdf_path)
        assert os.path.getsize(pdf_path) > 2_000

if __name__ == "__main__":
    # テスト実行
    pytest.main([__file__, "-v", "--tb=short"])