"""
SVG→PNG変換サービス
方位盤をWord文書用の画像として生成
"""

import cairosvg
from io import BytesIO
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


class SVGConverter:
    """SVG→PNG変換クラス"""

    def __init__(self):
        self.default_width = 400
        self.default_height = 400
        self.background_color = 'white'

    def svg_to_png(self, svg_content: str, width: int = None, height: int = None) -> bytes:
        """SVGをPNGに変換"""
        try:
            width = width or self.default_width
            height = height or self.default_height

            png_bytes = cairosvg.svg2png(
                bytestring=svg_content.encode('utf-8'),
                output_width=width,
                output_height=height,
                background_color=self.background_color
            )

            return png_bytes

        except Exception as e:
            logger.error(f"SVG→PNG変換エラー: {str(e)}")
            raise Exception(f"SVG変換失敗: {str(e)}")

    def generate_hoiban_svg(self, hoiban_data: Dict[str, Any]) -> str:
        """方位盤SVGを生成"""
        try:
            # 基本設定
            size = 300
            center = size // 2
            radius = 120

            # 方位と位置の対応
            directions = {
                '北': (center, center - radius),
                '北東': (center + radius * 0.7, center - radius * 0.7),
                '東': (center + radius, center),
                '南東': (center + radius * 0.7, center + radius * 0.7),
                '南': (center, center + radius),
                '南西': (center - radius * 0.7, center + radius * 0.7),
                '西': (center - radius, center),
                '北西': (center - radius * 0.7, center - radius * 0.7)
            }

            # SVG開始
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .direction-text {{ font-family: 'Yu Gothic', Arial, sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }}
            .star-text {{ font-family: 'Yu Gothic', Arial, sans-serif; font-size: 12px; text-anchor: middle; dominant-baseline: middle; fill: #1976d2; font-weight: bold; }}
            .center-text {{ font-family: 'Yu Gothic', Arial, sans-serif; font-size: 16px; text-anchor: middle; dominant-baseline: middle; fill: #dc004e; font-weight: bold; }}
        </style>
    </defs>

    <!-- 背景円 -->
    <circle cx="{center}" cy="{center}" r="{radius + 20}" fill="#f5f5f5" stroke="#1976d2" stroke-width="2"/>

    <!-- 中央円 -->
    <circle cx="{center}" cy="{center}" r="30" fill="#ffffff" stroke="#1976d2" stroke-width="2"/>
'''

            # 中央の星を追加
            center_star = self._get_center_star(hoiban_data)
            svg_content += f'''
    <!-- 中央星 -->
    <text x="{center}" y="{center}" class="center-text">{center_star}</text>
'''

            # 8方位の星を追加
            houi_details = hoiban_data.get('houiDetails', [])
            for detail in houi_details:
                direction = detail.get('houi', '')
                if direction in directions:
                    x, y = directions[direction]

                    # 年盤星
                    nenban_star = detail.get('nenbanStar', '')

                    # 方位圏
                    svg_content += f'''
    <!-- {direction} -->
    <circle cx="{x}" cy="{y}" r="25" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
    <text x="{x}" y="{y-8}" class="direction-text">{direction}</text>
    <text x="{x}" y="{y+8}" class="star-text">{nenban_star}</text>
'''

            # 方位線を追加
            svg_content += f'''
    <!-- 方位線 -->
    <line x1="{center}" y1="{center-radius-20}" x2="{center}" y2="{center+radius+20}" stroke="#e0e0e0" stroke-width="1"/>
    <line x1="{center-radius-20}" y1="{center}" x2="{center+radius+20}" y2="{center}" stroke="#e0e0e0" stroke-width="1"/>
    <line x1="{center-radius*0.7-14}" y1="{center-radius*0.7-14}" x2="{center+radius*0.7+14}" y2="{center+radius*0.7+14}" stroke="#e0e0e0" stroke-width="1"/>
    <line x1="{center+radius*0.7+14}" y1="{center-radius*0.7-14}" x2="{center-radius*0.7-14}" y2="{center+radius*0.7+14}" stroke="#e0e0e0" stroke-width="1"/>
'''

            # SVG終了
            svg_content += '''
</svg>'''

            return svg_content

        except Exception as e:
            logger.error(f"方位盤SVG生成エラー: {str(e)}")
            # フォールバック用シンプルSVG
            return self._generate_fallback_svg()

    def _get_center_star(self, hoiban_data: Dict[str, Any]) -> str:
        """中央の星を取得"""
        try:
            # nenbanから中央星を取得
            nenban = hoiban_data.get('nenban', {})
            center_qsei = nenban.get('centerQsei', {})
            return center_qsei.get('name', '五黄土星')
        except:
            return '五黄土星'

    def _generate_fallback_svg(self) -> str:
        """フォールバック用シンプル方位盤SVG"""
        size = 300
        center = size // 2

        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .fallback-text {{ font-family: 'Yu Gothic', Arial, sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; fill: #666; }}
        </style>
    </defs>

    <!-- 背景円 -->
    <circle cx="{center}" cy="{center}" r="120" fill="#f5f5f5" stroke="#1976d2" stroke-width="2"/>

    <!-- 中央円 -->
    <circle cx="{center}" cy="{center}" r="30" fill="#ffffff" stroke="#1976d2" stroke-width="2"/>

    <!-- フォールバックテキスト -->
    <text x="{center}" y="{center}" class="fallback-text">方位盤</text>

    <!-- 方位線 -->
    <line x1="{center}" y1="{center-120}" x2="{center}" y2="{center+120}" stroke="#e0e0e0" stroke-width="1"/>
    <line x1="{center-120}" y1="{center}" x2="{center+120}" y2="{center}" stroke="#e0e0e0" stroke-width="1"/>
</svg>'''

    def generate_hoiban_image(self, hoiban_data: Dict[str, Any]) -> bytes:
        """方位盤画像を生成（SVG→PNG）"""
        try:
            # SVG生成
            svg_content = self.generate_hoiban_svg(hoiban_data)

            # PNG変換
            png_bytes = self.svg_to_png(svg_content, width=400, height=400)

            return png_bytes

        except Exception as e:
            logger.error(f"方位盤画像生成エラー: {str(e)}")
            # エラー時はフォールバック画像
            fallback_svg = self._generate_fallback_svg()
            return self.svg_to_png(fallback_svg, width=400, height=400)


def generate_hoiban_image(hoiban_data: Dict[str, Any]) -> bytes:
    """方位盤画像生成関数（外部API用）"""
    converter = SVGConverter()
    return converter.generate_hoiban_image(hoiban_data)


def svg_to_png_simple(svg_content: str, width: int = 400, height: int = 400) -> bytes:
    """シンプルSVG→PNG変換関数"""
    converter = SVGConverter()
    return converter.svg_to_png(svg_content, width, height)