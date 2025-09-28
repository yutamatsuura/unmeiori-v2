import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HoibanChart from './HoibanChart';
import KyuseiDetails from './KyuseiDetails';

const HoibanContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  minHeight: '420px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${theme.palette.primary.light}20 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    background: `radial-gradient(circle, ${theme.palette.secondary.light}15 0%, transparent 70%)`,
    borderRadius: '50%',
  }
}));



interface KyuseiHoibanData {
  nenban?: {
    centerQsei: { index: number; name: string; rubi: string };
    kiban8: number[];
  };
  getsuban?: {
    centerQsei: { index: number; name: string; rubi: string };
    kiban8: number[];
  };
  nippan?: {
    centerQsei: { index: number; name: string; rubi: string };
    kiban8: number[];
  };
  kichihoui?: {
    houiDetails: Array<{
      houi: string;
      nenbanStar: number;
      getsubanStar: number;
      nippanStar: number | null;
      kichiType: string | null;
      kyouType: string | null;
    }>;
  };
  birth?: {
    year: { name: string; rubi: string };
    month: {
      name: string;
      rubi: string;
      eto60?: { name: string; jikan: string; eto: string };
    };
    day: {
      name: string;
      rubi: string;
      eto60?: { name: string; jikan: string; eto: string };
    };
    eto60: {
      name: string;
      jikan: string;
      eto: string;
      nattin?: string;
    };
    keisha: string | null;
    keishaRubi: string | null;
  };
}

interface KyuseiHoibanProps {
  birthDate: string;
  targetDate?: string;
  formData?: {
    name: string;
    birthDate: string;
    birthTime?: string;
    gender: string;
  };
}

const KyuseiHoiban: React.FC<KyuseiHoibanProps> = ({
  birthDate,
  targetDate = new Date().toISOString().split('T')[0],
  formData
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kyuseiData, setKyuseiData] = useState<KyuseiHoibanData>({});

  const KYUSEI_SERVICE_URL = import.meta.env.VITE_KYUSEI_SERVICE_URL || 'http://localhost:5002';

  useEffect(() => {
    if (birthDate && birthDate.trim() && targetDate && targetDate.trim()) {
      fetchKyuseiData();
    } else {
      setLoading(false);
      setError('生年月日と対象日が必要です。');
    }
  }, [birthDate, targetDate]);

  const fetchKyuseiData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 並行してAPIを呼び出し
      const [nenbanRes, getsubanRes, nippanRes, kichikouiRes, birthRes] = await Promise.all([
        fetch(`${KYUSEI_SERVICE_URL}/kyusei/nenban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: targetDate })
        }),
        fetch(`${KYUSEI_SERVICE_URL}/kyusei/getsuban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: targetDate })
        }),
        fetch(`${KYUSEI_SERVICE_URL}/kyusei/nippan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: targetDate })
        }),
        fetch(`${KYUSEI_SERVICE_URL}/kyusei/kichihoui`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, targetDate })
        }),
        fetch(`${KYUSEI_SERVICE_URL}/kyusei/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthDate, currentDate: targetDate })
        })
      ]);

      const [nenban, getsuban, nippan, kichihoui, birth] = await Promise.all([
        nenbanRes.ok ? nenbanRes.json() : null,
        getsubanRes.ok ? getsubanRes.json() : null,
        nippanRes.ok ? nippanRes.json() : null,
        kichikouiRes.ok ? kichikouiRes.json() : null,
        birthRes.ok ? birthRes.json() : null
      ]);


      setKyuseiData({
        nenban,
        getsuban,
        nippan,
        kichihoui,
        birth: birth?.birth
      });

    } catch (err) {
      console.error('九星気学データ取得エラー:', err);
      setError('九星気学データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <HoibanContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </HoibanContainer>
    );
  }

  if (error) {
    return (
      <HoibanContainer>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </HoibanContainer>
    );
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <h2 className="certificate-section-title">
          九星気学 方位盤
        </h2>

        <HoibanContainer>
          {/* 上段：年盤と月盤を横並び */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-evenly', mb: 1 }}>
            <Box sx={{
              width: '380px',
              transform: 'scale(0.85)',
              transformOrigin: 'center top',
              margin: '-10px 0'
            }}>
              <HoibanChart
                title="年盤"
                centerQsei={kyuseiData.nenban?.centerQsei}
                kiban8={kyuseiData.nenban?.kiban8}
                houiDetails={kyuseiData.kichihoui?.houiDetails}
                targetDate={targetDate}
              />
            </Box>
            <Box sx={{
              width: '380px',
              transform: 'scale(0.85)',
              transformOrigin: 'center top',
              margin: '-10px 0'
            }}>
              <HoibanChart
                title="月盤"
                centerQsei={kyuseiData.getsuban?.centerQsei}
                kiban8={kyuseiData.getsuban?.kiban8}
                houiDetails={kyuseiData.kichihoui?.houiDetails}
                targetDate={targetDate}
              />
            </Box>
          </Box>

          {/* 下段：日盤を中央に配置 */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{
              width: '280px',
              transform: 'scale(0.65)',
              transformOrigin: 'center top',
              margin: '-20px 0 -120px 0'
            }}>
              <HoibanChart
                title="日盤"
                centerQsei={kyuseiData.nippan?.centerQsei}
                kiban8={kyuseiData.nippan?.kiban8}
                houiDetails={kyuseiData.kichihoui?.houiDetails}
                targetDate={targetDate}
                textScale={1.3}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 0 }}>
            <KyuseiDetails
              birthData={kyuseiData.birth}
              formData={formData}
              targetDate={targetDate}
              houiDetails={kyuseiData.kichihoui?.houiDetails}
            />
          </Box>
        </HoibanContainer>
      </CardContent>
    </Card>
  );
};

export default KyuseiHoiban;