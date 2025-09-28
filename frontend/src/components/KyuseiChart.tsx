import React from 'react';
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';

interface KyuseiChartProps {
  type: '年盤' | '月盤' | '日盤';
  centerStar: string;
  haichi: number[];
  kichihoui?: number[];
  kyouhoui?: string[];
  houiDetails?: Array<{
    houi: string;
    nenbanStar?: number;
    getsubanStar?: number;
    nippanStar?: number;
    kichiType?: string | null;
    kyouType?: string | null;
  }>;
}

const KyuseiChart: React.FC<KyuseiChartProps> = ({ type, centerStar, haichi, kichihoui = [], kyouhoui = [], houiDetails }) => {
  const starNames = ['', '一白', '二黒', '三碧', '四緑', '五黄', '六白', '七赤', '八白', '九紫'];
  const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  const directionAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  // デフォルトの後天定位盤配置（五黄中宮時）
  const actualHaichi = haichi.length === 8 ? haichi : [1, 8, 3, 4, 9, 2, 7, 6];

  // 吉方位と凶方位の判定
  const getDirectionColor = (starIndex: number, dirIndex: number) => {
    if (kichihoui.includes(starIndex)) {
      return '#FFE4E1'; // 薄いピンク（吉方位）
    }
    if (kyouhoui && kyouhoui[dirIndex]) {
      return '#D3D3D3'; // グレー（凶方位）
    }
    return '#F0F0F0'; // デフォルトの薄いグレー
  };

  return (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
      {/* ヘッダー */}
      <Box sx={{
        bgcolor: '#6B89B7',
        color: 'white',
        p: 1,
        borderRadius: '4px 4px 0 0',
        display: 'flex',
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{
          bgcolor: '#FFD700',
          color: 'black',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontWeight: 'bold',
          mr: 2
        }}>
          {type}
        </Box>
        <Typography variant="subtitle1" sx={{ color: 'white' }}>
          {type === '年盤' ? '年命星' : type === '月盤' ? '月命星' : '日命星'}
        </Typography>
      </Box>

      {/* 八角形の方位盤 */}
      <Box sx={{
        width: 280,
        height: 280,
        margin: '0 auto',
        position: 'relative',
        mb: 2
      }}>
        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* 八角形の外枠 */}
          <polygon
            points="140,30 220,60 250,140 220,220 140,250 60,220 30,140 60,60"
            fill="none"
            stroke="#333"
            strokeWidth="2"
          />

          {/* 中心の円 */}
          <circle cx="140" cy="140" r="40" fill="white" stroke="#333" strokeWidth="2" />
          <text x="140" y="145" textAnchor="middle" fontSize="16" fontWeight="bold">
            {starNames[parseInt(centerStar) || 5]}
          </text>

          {/* 8方位のセクション */}
          {actualHaichi.map((star, index) => {
            const angle = directionAngles[index];
            const radian = (angle - 90) * Math.PI / 180;
            const x = 140 + 90 * Math.cos(radian);
            const y = 140 + 90 * Math.sin(radian);
            const color = getDirectionColor(star, index);

            return (
              <g key={index}>
                {/* セクションの塗りつぶし */}
                <path
                  d={`M 140 140 L ${140 + 100 * Math.cos((angle - 22.5 - 90) * Math.PI / 180)} ${140 + 100 * Math.sin((angle - 22.5 - 90) * Math.PI / 180)}
                      A 100 100 0 0 1 ${140 + 100 * Math.cos((angle + 22.5 - 90) * Math.PI / 180)} ${140 + 100 * Math.sin((angle + 22.5 - 90) * Math.PI / 180)} Z`}
                  fill={color}
                  stroke="#333"
                  strokeWidth="1"
                  opacity="0.7"
                />

                {/* 九星の数字 */}
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="bold">
                  {starNames[star]}
                </text>

                {/* 方位名 */}
                <text
                  x={140 + 120 * Math.cos(radian)}
                  y={140 + 120 * Math.sin(radian) + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {directions[index]}
                </text>

                {/* 吉凶表示 */}
                {kichihoui.includes(star) && (
                  <text
                    x={140 + 70 * Math.cos(radian)}
                    y={140 + 70 * Math.sin(radian) + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="red"
                    fontWeight="bold"
                  >
                    吉方
                  </text>
                )}
                {kyouhoui && kyouhoui[index] && (
                  <text
                    x={140 + 70 * Math.cos(radian)}
                    y={140 + 70 * Math.sin(radian) + 15}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#666"
                  >
                    {kyouhoui[index]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </Box>
    </Card>
  );
};

interface KyuseiDetailTableProps {
  data: {
    yearEto?: string;
    monthEto?: string;
    dayEto?: string;
    nattin?: string;
    maxKichi?: string;
    kichi?: string;
    keisha?: string;
    doukai?: string;
  };
}

export const KyuseiDetailTable: React.FC<KyuseiDetailTableProps> = ({ data }) => {
  const rows = [
    { label: '年干支', value: data.yearEto || '未計算', key: 'yearEto' },
    { label: '月干支', value: data.monthEto || '未計算', key: 'monthEto' },
    { label: '日干支', value: data.dayEto || '未計算', key: 'dayEto' },
    { label: '納音', value: data.nattin || '未計算', key: 'nattin' },
    { label: '最大吉方', value: data.maxKichi || '未計算', key: 'maxKichi' },
    { label: '吉方', value: data.kichi || '未計算', key: 'kichi' },
    { label: '傾斜', value: data.keisha || '未計算', key: 'keisha' },
    { label: '同会', value: data.doukai || '未計算', key: 'doukai' },
  ];

  return (
    <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{
        bgcolor: '#B0C4DE',
        color: '#333',
        p: 1.5,
        borderRadius: '4px 4px 0 0'
      }}>
        <Typography variant="subtitle1" fontWeight="bold">
          その他の詳細
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    bgcolor: '#F5F5F5',
                    fontWeight: 'bold',
                    width: '40%',
                    borderRight: '1px solid #E0E0E0'
                  }}
                >
                  {row.label}
                </TableCell>
                <TableCell sx={{ bgcolor: 'white' }}>
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default KyuseiChart;