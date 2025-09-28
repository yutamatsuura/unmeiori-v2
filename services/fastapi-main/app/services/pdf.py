from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.colors import black, blue, red, green, gray
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
import os
import io
import urllib.request
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
from .font_manager import font_manager

# 日本語フォント設定（改良版）
def setup_japanese_fonts():
    """日本語フォントを設定（Noto Sans CJK JP使用）"""
    try:
        # フォントマネージャーから日本語フォントを取得
        font_path = font_manager.get_font_path("NotoSansCJK-Regular")

        if font_path and os.path.exists(font_path):
            try:
                # Noto Sans CJK JPフォントを登録
                if font_path.endswith('.ttc'):
                    pdfmetrics.registerFont(TTFont('Japanese', font_path, subfontIndex=0))
                else:
                    pdfmetrics.registerFont(TTFont('Japanese', font_path))

                # ボールドフォントも試行（利用可能な場合）
                bold_font_path = font_manager.get_font_path("NotoSansCJK-Bold")
                if bold_font_path and os.path.exists(bold_font_path):
                    if bold_font_path.endswith('.ttc'):
                        pdfmetrics.registerFont(TTFont('Japanese-Bold', bold_font_path, subfontIndex=0))
                    else:
                        pdfmetrics.registerFont(TTFont('Japanese-Bold', bold_font_path))

                logging.info(f"Japanese font registered successfully: {font_path}")
                return True

            except Exception as e:
                logging.error(f"Failed to register Noto Sans CJK JP font: {e}")

        # フォールバック: ReportLab互換のシステムフォントを試行
        fallback_paths = [
            '/System/Library/Fonts/ArialHB.ttc',  # macOS Arial Unicode（優先）
            '/System/Library/Fonts/HelveticaNeue.ttc',  # macOS
            '/System/Library/Fonts/Times.ttc',  # macOS
            '/System/Library/Fonts/Helvetica.ttc',  # macOS
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',  # Linux
            'C:\\Windows\\Fonts\\arial.ttf',  # Windows
            'C:\\Windows\\Fonts\\meiryo.ttc',  # Windows
        ]

        for font_path in fallback_paths:
            if os.path.exists(font_path):
                try:
                    # TTCファイルの場合
                    if font_path.endswith('.ttc'):
                        # 複数のsubfontIndexを試行
                        for subfont_index in [0, 1, 2]:
                            try:
                                pdfmetrics.registerFont(TTFont('Japanese', font_path, subfontIndex=subfont_index))
                                logging.warning(f"Using fallback font: {font_path} (subfontIndex={subfont_index})")
                                return True
                            except Exception as e:
                                logging.debug(f"subfontIndex {subfont_index} failed for {font_path}: {e}")
                                continue
                    else:
                        # TTF/OTFファイルの場合
                        pdfmetrics.registerFont(TTFont('Japanese', font_path))
                        logging.warning(f"Using fallback font: {font_path}")
                        return True
                except Exception as e:
                    logging.error(f"Failed to register fallback font {font_path}: {e}")
                    continue

        # 最終フォールバック: フォントなしでもエラーにしない
        logging.warning("No Japanese font could be registered, using default font")
        return False

    except Exception as e:
        logging.error(f"Font setup error: {e}")
        return False

class PDFGeneratorService:
    """PDF生成サービス（日本語対応版）"""

    def __init__(self):
        self.output_dir = "generated_pdfs"
        self.ensure_output_dir()

        # 日本語フォント準備確認
        if not font_manager.ensure_fonts_ready():
            logging.warning("Failed to prepare Japanese fonts")

        # 日本語フォントセットアップ
        self.font_available = setup_japanese_fonts()
        self.font_name = 'Japanese' if self.font_available else 'Helvetica'
        # ボールドフォントも同じフォントファミリーを使用（ReportLabの制限対応）
        self.bold_font_name = 'Japanese' if self.font_available else 'Helvetica-Bold'

        # カラーテーマ定義
        self.color_themes = {
            'blue': {'primary': blue, 'secondary': gray},
            'green': {'primary': green, 'secondary': gray},
            'red': {'primary': red, 'secondary': gray},
            'black': {'primary': black, 'secondary': gray}
        }

        # フォント状態をログ出力
        logging.info(f"PDF service initialized - Font available: {self.font_available}, Font name: {self.font_name}")

    def ensure_output_dir(self):
        """出力ディレクトリを作成"""
        os.makedirs(self.output_dir, exist_ok=True)

    def create_styles(self, color_theme: str = "blue") -> Dict[str, ParagraphStyle]:
        """スタイルシートを作成"""
        styles = getSampleStyleSheet()
        theme_colors = self.color_themes.get(color_theme, self.color_themes['blue'])

        custom_styles = {
            'title': ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontName=self.bold_font_name,
                fontSize=24,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=theme_colors['primary']
            ),
            'subtitle': ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Heading2'],
                fontName=self.bold_font_name,
                fontSize=16,
                spaceAfter=12,
                alignment=TA_LEFT,
                textColor=theme_colors['primary']
            ),
            'content': ParagraphStyle(
                'CustomContent',
                parent=styles['Normal'],
                fontName=self.font_name,
                fontSize=11,
                spaceAfter=8,
                alignment=TA_LEFT,
                leading=16
            ),
            'small': ParagraphStyle(
                'CustomSmall',
                parent=styles['Normal'],
                fontName=self.font_name,
                fontSize=9,
                spaceAfter=6,
                alignment=TA_LEFT,
                textColor=theme_colors['secondary']
            ),
            'center': ParagraphStyle(
                'CustomCenter',
                parent=styles['Normal'],
                fontName=self.font_name,
                fontSize=11,
                spaceAfter=8,
                alignment=TA_CENTER
            )
        }

        return custom_styles

    def generate_kantei_report(
        self,
        kantei_data: Dict[str, Any],
        template_settings: Dict[str, Any]
    ) -> io.BytesIO:
        """鑑定書PDFを生成（新版）"""

        buffer = io.BytesIO()

        # PDF設定
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )

        # スタイル取得
        color_theme = template_settings.get('color_theme', 'blue')
        styles = self.create_styles(color_theme)

        # コンテンツ構築
        story = []

        # ヘッダー（ロゴ・会社情報）
        story.extend(self._create_header(template_settings, styles))

        # タイトル
        story.append(Paragraph("鑑定書", styles['title']))
        story.append(Spacer(1, 20))

        # クライアント情報
        story.extend(self._create_client_info(kantei_data, styles))

        # 九星気学結果
        if kantei_data.get('kyusei_kigaku'):
            story.extend(self._create_kyusei_section(kantei_data['kyusei_kigaku'], styles))

        # 姓名判断結果
        if kantei_data.get('seimei_handan'):
            story.extend(self._create_seimei_section(kantei_data['seimei_handan'], styles))

        # 吉方位情報
        if kantei_data.get('kichihoui'):
            story.extend(self._create_kichihoui_section(kantei_data['kichihoui'], styles))

        # カスタムメッセージ
        if template_settings.get('custom_message'):
            story.extend(self._create_custom_message(template_settings['custom_message'], styles))

        # 鑑定士コメント
        if kantei_data.get('kantei_comment'):
            story.extend(self._create_kantei_comment(kantei_data['kantei_comment'], styles))

        # フッター
        story.extend(self._create_footer(template_settings, styles))

        # PDF生成
        doc.build(story)
        buffer.seek(0)
        return buffer

    def _create_header(self, template_settings: Dict[str, Any], styles: Dict[str, ParagraphStyle]) -> List:
        """ヘッダー部分を作成"""
        header_elements = []

        # ロゴ画像
        if template_settings.get('include_logo') and template_settings.get('logo_url'):
            try:
                # ロゴ画像の処理（実装を簡略化）
                logo_text = f"ロゴ: {template_settings.get('business_name', '鑑定所')}"
                header_elements.append(Paragraph(logo_text, styles['center']))
                header_elements.append(Spacer(1, 10))
            except Exception as e:
                print(f"Logo processing error: {e}")

        # 事業者名
        business_name = template_settings.get('business_name', '開運鑑定所')
        header_elements.append(Paragraph(business_name, styles['center']))
        header_elements.append(Spacer(1, 20))

        return header_elements

    def _create_client_info(self, kantei_data: Dict[str, Any], styles: Dict[str, ParagraphStyle]) -> List:
        """クライアント情報セクションを作成"""
        elements = []

        elements.append(Paragraph("■ お客様情報", styles['subtitle']))

        client_info = kantei_data.get('client_info', {})
        info_data = [
            ['お名前', client_info.get('name', '')],
            ['生年月日', client_info.get('birth_date', '')],
            ['生年月時', client_info.get('birth_time', '') or '不明'],
            ['性別', client_info.get('gender', '') or '不明'],
            ['出生地', client_info.get('birth_place', '') or '不明']
        ]

        # テーブル作成
        table = Table(info_data, colWidths=[40*mm, 120*mm])
        table.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), self.font_name, 10),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 20))

        return elements

    def _create_kyusei_section(self, kyusei_data: Dict[str, Any], styles: Dict[str, ParagraphStyle]) -> List:
        """九星気学セクションを作成"""
        elements = []

        elements.append(Paragraph("■ 九星気学鑑定結果", styles['subtitle']))

        # 年盤情報
        if kyusei_data.get('nenban'):
            nenban = kyusei_data['nenban']
            elements.append(Paragraph(f"本命星: {nenban.get('name', '')} ({nenban.get('element', '')})", styles['content']))
            elements.append(Paragraph(f"特徴: {nenban.get('characteristics', '')}", styles['content']))

        # 月盤情報
        if kyusei_data.get('getsuban'):
            getsuban = kyusei_data['getsuban']
            elements.append(Paragraph(f"月命星: {getsuban.get('name', '')} ({getsuban.get('element', '')})", styles['content']))

        # 日盤情報
        if kyusei_data.get('nippan'):
            nippan = kyusei_data['nippan']
            elements.append(Paragraph(f"日命星: {nippan.get('name', '')} ({nippan.get('element', '')})", styles['content']))

        elements.append(Spacer(1, 15))
        return elements

    def _create_seimei_section(self, seimei_data: Dict[str, Any], styles: Dict[str, ParagraphStyle]) -> List:
        """姓名判断セクションを作成"""
        elements = []

        elements.append(Paragraph("■ 姓名判断鑑定結果", styles['subtitle']))

        # 文字情報
        if seimei_data.get('characters'):
            elements.append(Paragraph("文字構成:", styles['content']))
            for char_info in seimei_data['characters']:
                char_text = f"「{char_info.get('character', '')}」 {char_info.get('strokeCount', '')}画 {char_info.get('gogyou', '')}行 {char_info.get('youin', '')}"
                elements.append(Paragraph(char_text, styles['small']))

        # 画数情報
        if seimei_data.get('kakusu'):
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("画数構成:", styles['content']))
            kakusu = seimei_data['kakusu']
            kakusu_data = [
                ['天格', f"{kakusu.get('tenkaku', 0)}画"],
                ['人格', f"{kakusu.get('jinkaku', 0)}画"],
                ['地格', f"{kakusu.get('chikaku', 0)}画"],
                ['総格', f"{kakusu.get('soukaku', 0)}画"],
                ['外格', f"{kakusu.get('gaikaku', 0)}画"]
            ]

            kakusu_table = Table(kakusu_data, colWidths=[30*mm, 30*mm])
            kakusu_table.setStyle(TableStyle([
                ('FONT', (0, 0), (-1, -1), self.font_name, 9),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 1, black),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(kakusu_table)

        # 鑑定結果
        if seimei_data.get('kantei_results'):
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("鑑定結果:", styles['content']))
            for result in seimei_data['kantei_results']:
                score_text = f"{result.get('category', '')}: {result.get('score', 0)}点"
                elements.append(Paragraph(score_text, styles['content']))
                elements.append(Paragraph(result.get('message', ''), styles['small']))

        # 総合評価
        if seimei_data.get('overall_score'):
            elements.append(Spacer(1, 10))
            overall_text = f"総合評価: {seimei_data['overall_score']}点 (グレード: {seimei_data.get('grade', '')})"
            elements.append(Paragraph(overall_text, styles['content']))

        elements.append(Spacer(1, 15))
        return elements

    def _create_kichihoui_section(self, kichihoui_data: Dict[str, Any], styles: Dict[str, ParagraphStyle]) -> List:
        """吉方位セクションを作成"""
        elements = []

        elements.append(Paragraph("■ 吉方位情報", styles['subtitle']))

        for year, directions in kichihoui_data.items():
            if isinstance(directions, dict):
                elements.append(Paragraph(f"{year}年:", styles['content']))

                if directions.get('kichi'):
                    kichi_text = f"吉方位: {', '.join(directions['kichi'])}"
                    elements.append(Paragraph(kichi_text, styles['small']))

                if directions.get('kyo'):
                    kyo_text = f"凶方位: {', '.join(directions['kyo'])}"
                    elements.append(Paragraph(kyo_text, styles['small']))

        elements.append(Spacer(1, 15))
        return elements

    def _create_custom_message(self, message: str, styles: Dict[str, ParagraphStyle]) -> List:
        """カスタムメッセージセクションを作成"""
        elements = []

        elements.append(Paragraph("■ 鑑定士からのメッセージ", styles['subtitle']))
        elements.append(Paragraph(message, styles['content']))
        elements.append(Spacer(1, 15))

        return elements

    def _create_kantei_comment(self, comment: str, styles: Dict[str, ParagraphStyle]) -> List:
        """鑑定士コメントセクションを作成"""
        elements = []

        elements.append(Paragraph("■ 鑑定士からのコメント", styles['subtitle']))

        # 改行を考慮してコメントを処理
        comment_lines = comment.split('\n')
        for line in comment_lines:
            if line.strip():  # 空行でない場合
                elements.append(Paragraph(line, styles['content']))
            else:  # 空行の場合
                elements.append(Spacer(1, 6))

        elements.append(Spacer(1, 15))

        return elements

    def _create_footer(self, template_settings: Dict[str, Any], styles: Dict[str, ParagraphStyle]) -> List:
        """フッターを作成"""
        elements = []

        elements.append(Spacer(1, 30))

        # 作成日
        created_date = datetime.now().strftime('%Y年%m月%d日')
        elements.append(Paragraph(f"作成日: {created_date}", styles['small']))

        # 鑑定士署名
        if template_settings.get('include_signature'):
            operator_name = template_settings.get('operator_name', '鑑定士')
            business_name = template_settings.get('business_name', '開運鑑定所')

            elements.append(Spacer(1, 20))
            elements.append(Paragraph(f"{business_name}", styles['center']))
            elements.append(Paragraph(f"{operator_name}", styles['center']))

        return elements

    def generate_kantei_pdf(
        self,
        kantei_data: Dict[str, Any],
        template_settings: Optional[Dict[str, Any]] = None
    ) -> str:
        """互換性のためのラッパーメソッド"""

        # デフォルトテンプレート設定
        default_settings = {
            'business_name': '開運鑑定所',
            'operator_name': '鑑定士',
            'color_theme': 'blue',
            'font_family': 'mincho',
            'include_logo': True,
            'include_signature': True
        }

        if template_settings:
            default_settings.update(template_settings)

        # ファイル名生成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        client_name = kantei_data.get("client_info", {}).get("name", "unknown")
        filename = f"kantei_{client_name}_{timestamp}.pdf"
        filepath = os.path.join(self.output_dir, filename)

        # PDF生成
        pdf_buffer = self.generate_kantei_report(kantei_data, default_settings)

        # ファイルに保存
        with open(filepath, 'wb') as f:
            f.write(pdf_buffer.getvalue())

        return filepath

    def get_pdf_path(self, filename: str) -> str:
        """PDFファイルのフルパスを取得"""
        return os.path.join(self.output_dir, filename)

    def pdf_exists(self, filepath: str) -> bool:
        """PDFファイルが存在するかチェック"""
        return os.path.exists(filepath)

    def get_pdf_info(self, filepath: str) -> Dict[str, Any]:
        """PDFファイルの情報を取得"""
        if not os.path.exists(filepath):
            return {"exists": False}

        try:
            file_stat = os.stat(filepath)
            return {
                "exists": True,
                "size": file_stat.st_size,
                "created_at": datetime.fromtimestamp(file_stat.st_ctime),
                "modified_at": datetime.fromtimestamp(file_stat.st_mtime),
                "expires_at": datetime.fromtimestamp(file_stat.st_ctime) + timedelta(days=365)
            }
        except Exception as e:
            return {"exists": False, "error": str(e)}

    def delete_pdf(self, filepath: str) -> bool:
        """PDFファイルを削除"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception as e:
            print(f"PDF deletion error: {e}")
            return False

    def cleanup_old_pdfs(self, days_old: int = 30) -> int:
        """古いPDFファイルをクリーンアップ"""
        if not os.path.exists(self.output_dir):
            return 0

        deleted_count = 0
        cutoff_time = datetime.now() - timedelta(days=days_old)

        try:
            for filename in os.listdir(self.output_dir):
                if filename.endswith('.pdf'):
                    filepath = os.path.join(self.output_dir, filename)
                    file_stat = os.stat(filepath)
                    file_time = datetime.fromtimestamp(file_stat.st_mtime)

                    if file_time < cutoff_time:
                        if self.delete_pdf(filepath):
                            deleted_count += 1

        except Exception as e:
            print(f"PDF cleanup error: {e}")

        return deleted_count


    async def generate_pdf_from_print_preview(self, kantei_id: int, preview_url: str) -> str:
        """印刷プレビューからPDF生成 - シンプルアプローチ"""
        import subprocess
        import tempfile
        from datetime import datetime

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"kantei_{kantei_id}_{timestamp}_preview.pdf"
        pdf_path = os.path.join(self.output_dir, pdf_filename)

        try:
            # macOSのwkhtmltopdfを使用してHTML→PDF変換
            # インストール: brew install wkhtmltopdf
            cmd = [
                'wkhtmltopdf',
                '--page-size', 'A4',
                '--margin-top', '5mm',
                '--margin-bottom', '15mm',
                '--margin-left', '15mm',
                '--margin-right', '15mm',
                '--print-media-type',
                preview_url,
                pdf_path
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0 and os.path.exists(pdf_path):
                logging.info(f"PDF generated successfully from print preview: {pdf_path}")
                return pdf_path
            else:
                raise Exception(f"wkhtmltopdf failed: {result.stderr}")

        except FileNotFoundError:
            # wkhtmltopdfが見つからない場合のフォールバック
            logging.warning("wkhtmltopdf not found, falling back to ReportLab PDF generation")
            return self.generate_simple_fallback_pdf(kantei_id)
        except Exception as e:
            logging.error(f"Error generating PDF from print preview: {e}")
            return self.generate_simple_fallback_pdf(kantei_id)

    def generate_simple_fallback_pdf(self, kantei_id: int) -> str:
        """フォールバック用の簡単なPDF生成（日本語フォント対応）"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"kantei_{kantei_id}_{timestamp}_fallback.pdf"
        pdf_path = os.path.join(self.output_dir, pdf_filename)

        # 日本語フォントをセットアップ
        setup_japanese_fonts()

        # 最小限のPDF生成
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)

        # 日本語対応スタイルを作成
        styles = getSampleStyleSheet()

        # 日本語対応スタイルを定義
        japanese_style = ParagraphStyle(
            'Japanese',
            parent=styles['Normal'],
            fontName='Japanese',
            fontSize=12,
            encoding='utf-8'
        )

        japanese_title_style = ParagraphStyle(
            'JapaneseTitle',
            parent=styles['Title'],
            fontName='Japanese',
            fontSize=16,
            encoding='utf-8'
        )

        story = [
            Paragraph("鑑定書", japanese_title_style),
            Spacer(1, 12),
            Paragraph(f"鑑定ID: {kantei_id}", japanese_style),
            Spacer(1, 12),
            Paragraph("印刷プレビューからのPDF生成に失敗したため、フォールバックPDFを生成しました。", japanese_style),
            Spacer(1, 6),
            Paragraph("ブラウザの印刷機能をご利用ください。", japanese_style),
            Spacer(1, 12),
            Paragraph("手順:", japanese_style),
            Paragraph("1. 印刷プレビューを開く", japanese_style),
            Paragraph("2. ブラウザの「印刷」ボタンをクリック", japanese_style),
            Paragraph("3. 印刷ダイアログで「PDFとして保存」を選択", japanese_style)
        ]

        try:
            doc.build(story)
            logging.info(f"Fallback PDF generated with Japanese fonts: {pdf_path}")
        except Exception as e:
            logging.error(f"Error generating fallback PDF: {e}")
            # 最後の手段：英語のみでPDF生成
            story_fallback = [
                Paragraph("Kantei Report", styles['Title']),
                Spacer(1, 12),
                Paragraph(f"Kantei ID: {kantei_id}", styles['Normal']),
                Paragraph("PDF generation from print preview failed.", styles['Normal']),
                Paragraph("Please use browser print function.", styles['Normal'])
            ]
            doc.build(story_fallback)

        return pdf_path


# シングルトンインスタンス
pdf_service = PDFGeneratorService()