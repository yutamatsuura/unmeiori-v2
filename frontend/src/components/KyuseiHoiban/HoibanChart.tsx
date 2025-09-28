import React, { useState } from 'react';
import { Box, Typography, Tooltip, Zoom } from '@mui/material';
import { styled } from '@mui/material/styles';

const ChartContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  minHeight: '200px',
  padding: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    minHeight: '180px',
    padding: theme.spacing(0.25)
  }
}));

const SVGContainer = styled('svg')(({ theme }) => ({
  maxWidth: '100%',
  height: 'auto',
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

interface HouiDetail {
  houi: string;
  nenbanStar: number;
  getsubanStar: number;
  nippanStar: number | null;
  kichiType: string | null;
  kyouType: string | null;
}

interface HoibanChartProps {
  title: string;
  centerQsei?: {
    index: number;
    name: string;
    rubi: string;
  };
  kiban8?: number[];
  houiDetails?: HouiDetail[];
  targetDate: string;
  textScale?: number;
}

// 九星の名前と色のマッピング
const QSEI_INFO = {
  1: { name: '一白水星', color: '#87CEEB', textColor: '#2F4F4F' },
  2: { name: '二黒土星', color: '#8B4513', textColor: '#2F4F4F' },
  3: { name: '三碧木星', color: '#32CD32', textColor: '#2F4F4F' },
  4: { name: '四緑木星', color: '#228B22', textColor: '#2F4F4F' },
  5: { name: '五黄土星', color: '#FFD700', textColor: '#8B4513' },
  6: { name: '六白金星', color: '#F5F5DC', textColor: '#2F4F4F' },
  7: { name: '七赤金星', color: '#DC143C', textColor: '#2F4F4F' },
  8: { name: '八白土星', color: '#FFFFFF', textColor: '#2F4F4F' },
  9: { name: '九紫火星', color: '#8B008B', textColor: '#2F4F4F' }
};

// 方位の配置（南から時計回り）
const HOUI_POSITIONS = [
  { name: '南', angle: 0, x: 200, y: 50 },      // 上
  { name: '南西', angle: 45, x: 320, y: 120 },  // 右上
  { name: '西', angle: 90, x: 350, y: 200 },    // 右
  { name: '北西', angle: 135, x: 320, y: 280 }, // 右下
  { name: '北', angle: 180, x: 200, y: 350 },   // 下
  { name: '北東', angle: 225, x: 80, y: 280 },  // 左下
  { name: '東', angle: 270, x: 50, y: 200 },    // 左
  { name: '南東', angle: 315, x: 80, y: 120 }   // 左上
];

const HoibanChart: React.FC<HoibanChartProps> = ({
  title,
  centerQsei,
  kiban8,
  houiDetails,
  targetDate,
  textScale = 1
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 方位の吉凶情報を取得
  const getHouiStatus = (houiName: string, index: number) => {
    if (!houiDetails) return { type: 'normal', color: '#FFFFFF' };

    const detail = houiDetails.find(h => h.houi === houiName);
    if (!detail) return { type: 'normal', color: '#FFFFFF' };

    if (detail.kyouType) {
      return { type: 'kyou', color: '#808080', label: detail.kyouType };
    }
    if (detail.kichiType === '最大吉方') {
      return { type: 'saikichihou', color: '#FFB6C1', label: '最大吉方' };
    }
    if (detail.kichiType === '吉方') {
      return { type: 'kichihou', color: '#FFE4E1', label: '吉方' };
    }

    return { type: 'normal', color: '#FFFFFF' };
  };

  // 八角形の座標を計算
  const generateOctagonPath = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 - 90) * Math.PI / 180; // -90度から開始（上が南）
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M${points.join('L')}Z`;
  };

  // 各セクションのパスを生成
  const generateSectionPath = (index: number, centerX: number, centerY: number, innerRadius: number, outerRadius: number) => {
    const startAngle = (index * 45 - 90 - 22.5) * Math.PI / 180;
    const endAngle = (index * 45 - 90 + 22.5) * Math.PI / 180;

    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(startAngle);
    const y2 = centerY + outerRadius * Math.sin(startAngle);
    const x3 = centerX + outerRadius * Math.cos(endAngle);
    const y3 = centerY + outerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);

    return `M${x1},${y1} L${x2},${y2} A${outerRadius},${outerRadius} 0 0,1 ${x3},${y3} L${x4},${y4} A${innerRadius},${innerRadius} 0 0,0 ${x1},${y1}Z`;
  };

  const centerX = 200;
  const centerY = 200;
  const innerRadius = 60;
  const outerRadius = 140;

  return (
    <ChartContainer>
      <Typography variant="h6" component="h3" gutterBottom sx={{
        fontWeight: 'bold',
        color: 'primary.main',
        mb: 3,
        fontSize: `${1.25 * textScale}rem`
      }}>
        {title} - {targetDate}
      </Typography>

      <SVGContainer width="400" height="400" viewBox="0 0 400 400">
        {/* 外枠の八角形 */}
        <path
          d={generateOctagonPath(centerX, centerY, outerRadius + 10)}
          fill="none"
          stroke="#1976d2"
          strokeWidth="3"
          opacity="0.8"
        />

        {/* 各方位のセクション背景 */}
        {HOUI_POSITIONS.map((pos, index) => {
          const status = getHouiStatus(pos.name, index);
          return (
            <path
              key={`bg-${pos.name}`}
              d={generateSectionPath(index, centerX, centerY, innerRadius, outerRadius)}
              fill={status.color}
              stroke="#666"
              strokeWidth="1"
              opacity={hoveredIndex === index ? 0.9 : 0.7}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transition: 'opacity 0.3s ease',
                cursor: 'pointer'
              }}
            />
          );
        })}

        {/* 各方位のテキスト（背景より上に配置） */}
        {HOUI_POSITIONS.map((pos, index) => {
          const star = kiban8 ? kiban8[index] : null;
          const status = getHouiStatus(pos.name, index);
          const qseiInfo = star ? QSEI_INFO[star as keyof typeof QSEI_INFO] : null;

          return (
            <g key={`text-${pos.name}`}>
              {/* 方位名 */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#333"
              >
                {pos.name}
              </text>

              {/* 九星 */}
              {star && qseiInfo && (
                <text
                  x={pos.x}
                  y={pos.y + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={qseiInfo.textColor}
                >
                  {qseiInfo.name}
                </text>
              )}

              {/* 吉凶表示 */}
              {status.label && (
                <>
                  {/* 白い輪郭 */}
                  <text
                    x={pos.x}
                    y={pos.y + 35}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  >
                    {status.label}
                  </text>
                  {/* メインテキスト */}
                  <text
                    x={pos.x}
                    y={pos.y + 35}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={status.type === 'kyou' ? '#FF0000' : '#FF1493'}
                  >
                    {status.label}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* 中央の九星 */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          fill={centerQsei ? QSEI_INFO[centerQsei.index as keyof typeof QSEI_INFO]?.color || '#F5F5F5' : '#F5F5F5'}
          stroke="#333"
          strokeWidth="2"
        />

        {centerQsei && (
          <>
            <text
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#FFFFFF"
            >
              中宮
            </text>
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#FFFFFF"
            >
              {centerQsei.name}
            </text>
          </>
        )}
      </SVGContainer>

      {/* 凡例 */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <span style={{ display: 'inline-block', marginRight: '12px' }}>
          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: '#FFB6C1',
            border: '1px solid #999',
            marginRight: '4px',
            verticalAlign: 'middle'
          }}></span>
          <span style={{ fontSize: `${11 * textScale}px`, verticalAlign: 'middle' }}>最大吉方</span>
        </span>
        <span style={{ display: 'inline-block', marginRight: '12px' }}>
          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: '#FFE4E1',
            border: '1px solid #999',
            marginRight: '4px',
            verticalAlign: 'middle'
          }}></span>
          <span style={{ fontSize: `${11 * textScale}px`, verticalAlign: 'middle' }}>吉方</span>
        </span>
        <span style={{ display: 'inline-block' }}>
          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: '#808080',
            border: '1px solid #999',
            marginRight: '4px',
            verticalAlign: 'middle'
          }}></span>
          <span style={{ fontSize: `${11 * textScale}px`, verticalAlign: 'middle' }}>凶方</span>
        </span>
      </Box>
    </ChartContainer>
  );
};

export default HoibanChart;