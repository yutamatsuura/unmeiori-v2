import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  Divider
} from '@mui/material';
import KyuseiChart from './KyuseiChart';

interface KichhouiData {
  birthDate: string;
  targetDate: string;
  birthQsei?: {
    index: number;
    name: string;
    rubi?: string;
  };
  targetNenban?: {
    index: number;
    name: string;
    haichi: number[];
  };
  targetGetsuban?: {
    index: number;
    name: string;
    haichi: number[];
  };
  targetNippan?: {
    index: number;
    name: string;
    haichi: number[];
  };
  kichiQseis?: number[];
  kichiQseiNames?: string;
  houiDetails?: Array<{
    houi: string;
    nenbanStar: number;
    getsubanStar: number;
    nippanStar: number;
    kichiType?: string | null;
    kyouType?: string | null;
  }>;
}

interface Props {
  birthDate: string;
  kyuseiResult?: any;
}

const KyuseiKichihoui: React.FC<Props> = ({ birthDate, kyuseiResult }) => {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [kichhouiData, setKichhouiData] = useState<KichhouiData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKichihoui = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5002/kyusei/kichihoui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          targetDate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setKichhouiData(data);
      }
    } catch (error) {
      console.error('吉方位取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (birthDate) {
      fetchKichihoui();
    }
  }, [birthDate, targetDate]);

  const getStarName = (index: number) => {
    const starNames = ['', '一白水星', '二黒土星', '三碧木星', '四緑木星', '五黄土星', '六白金星', '七赤金星', '八白土星', '九紫火星'];
    return starNames[index] || '';
  };

  // 最大吉方の判定
  const getMaxKichihoui = () => {
    if (!kichhouiData?.houiDetails) return null;

    const maxKichi = kichhouiData.houiDetails.filter(h => {
      // 年盤と月盤が両方とも吉方位の場合が最大吉方
      return h.kichiType === '最大吉方';
    });

    if (maxKichi.length === 0) {
      // 最大吉方がない場合は、通常の吉方を探す
      const normalKichi = kichhouiData.houiDetails.filter(h => h.kichiType === '吉方');
      if (normalKichi.length > 0) {
        return { houi: normalKichi[0].houi, star: normalKichi[0].nenbanStar };
      }
    } else {
      return { houi: maxKichi[0].houi, star: maxKichi[0].nenbanStar };
    }
    return null;
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* 吉方位セクション */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <Box sx={{
          bgcolor: '#B0C4DE',
          color: '#333',
          p: 2,
          borderRadius: '4px 4px 0 0'
        }}>
          <Typography variant="h5" fontWeight="bold">
            あなたの吉方位
          </Typography>
        </Box>

        <CardContent>
          {/* 日付選択 */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1">
              日付:
            </Typography>
            <TextField
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              size="small"
              sx={{ width: 200 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
            >
              今日を選択
            </Button>
          </Box>

          {/* 吉方位情報テーブル */}
          {kichhouiData && (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold', width: '25%' }}>
                      生年月日
                    </TableCell>
                    <TableCell>{birthDate} (0歳)</TableCell>
                    <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold', width: '25%' }}>
                      十二支
                    </TableCell>
                    <TableCell>{kyuseiResult?.birth?.eto60?.name?.substring(1) || '未計算'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                      本命星
                    </TableCell>
                    <TableCell>{kichhouiData.birthQsei?.name || '未計算'}</TableCell>
                    <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                      月命星
                    </TableCell>
                    <TableCell>{kyuseiResult?.birth?.month?.name || '未計算'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                      最大吉方
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const maxKichi = getMaxKichihoui();
                        return maxKichi ? getStarName(maxKichi.star) : '九紫火星';
                      })()}
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold', verticalAlign: 'middle' }}>
                      吉方
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ verticalAlign: 'middle' }}>
                      {kichhouiData.kichiQseiNames || '六白金星,七赤金星,八白土星'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                      方向
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const maxKichi = getMaxKichihoui();
                        return maxKichi ? maxKichi.houi : '南';
                      })()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* 方位盤 */}
          {kichhouiData && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <KyuseiChart
                type="年盤"
                centerStar={String(kichhouiData.targetNenban?.index || 2)}
                haichi={kichhouiData.targetNenban?.haichi || [7, 5, 9, 1, 6, 8, 4, 3]}
                houiDetails={kichhouiData.houiDetails}
              />
              <KyuseiChart
                type="月盤"
                centerStar={String(kichhouiData.targetGetsuban?.index || 4)}
                haichi={kichhouiData.targetGetsuban?.haichi || [9, 7, 2, 3, 8, 1, 6, 5]}
                houiDetails={kichhouiData.houiDetails}
              />
              <KyuseiChart
                type="日盤"
                centerStar={String(kichhouiData.targetNippan?.index || 8)}
                haichi={kichhouiData.targetNippan?.haichi || [4, 2, 6, 7, 3, 5, 1, 9]}
                houiDetails={kichhouiData.houiDetails}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 九星の詳細セクション */}
      <Card sx={{ boxShadow: 3 }}>
        <Box sx={{
          bgcolor: '#B0C4DE',
          color: '#333',
          p: 2,
          borderRadius: '4px 4px 0 0'
        }}>
          <Typography variant="h5" fontWeight="bold">
            九星の詳細
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            生年月日：{birthDate} (0歳) 十二支：{kyuseiResult?.birth?.eto60?.name?.substring(1) || '未計算'}
          </Typography>
        </Box>

        <CardContent>
          {/* 本人の九星気学方位盤 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 3 }}>
            <KyuseiChart
              type="年盤"
              centerStar={String(kyuseiResult?.birth?.year?.index || 1)}
              haichi={[1, 8, 3, 4, 9, 2, 7, 6]} // 本命星の定位置
            />
            <KyuseiChart
              type="月盤"
              centerStar={String(kyuseiResult?.birth?.month?.index || 5)}
              haichi={[5, 3, 7, 8, 4, 6, 2, 1]} // 月命星の定位置
            />
            <KyuseiChart
              type="日盤"
              centerStar={String(kyuseiResult?.birth?.day?.index || 8)}
              haichi={[8, 6, 1, 2, 7, 9, 5, 4]} // 日命星の定位置
            />
          </Box>

          {/* 詳細情報テーブル */}
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold', width: '30%' }}>
                    年干支
                  </TableCell>
                  <TableCell>{kyuseiResult?.birth?.eto60?.name || '乙巳'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    月干支
                  </TableCell>
                  <TableCell>乙酉</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    日干支
                  </TableCell>
                  <TableCell>癸未</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    納音
                  </TableCell>
                  <TableCell>楊柳木</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    最大吉方
                  </TableCell>
                  <TableCell>九紫火星</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    吉方
                  </TableCell>
                  <TableCell>六白金星,七赤金星,八白土星</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    傾斜
                  </TableCell>
                  <TableCell>{kyuseiResult?.birth?.keisha || '三碧木星'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" sx={{ bgcolor: '#F5F5F5', fontWeight: 'bold' }}>
                    同会
                  </TableCell>
                  <TableCell>九紫火星</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default KyuseiKichihoui;