import express from 'express';
import cors from 'cors';
import Qsei from './src/bans/qseis/Qsei';
import LocalDate from './src/times/LocalDate';
import QseiDate from './src/bans/dates/QseiDate';
import Eto60 from './src/bans/units/Eto60';
import Kipou from './src/bans/units/Kipou';
import Nattin from './src/bans/units/Nattin';
import JikanEto from './src/bans/units/JikanEto';

const app = express();
const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST || '0.0.0.0';

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World from Kyusei Service',
    service: 'kyusei-service',
    port: 5002
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kyusei-service'
  });
});

// 九星計算API
app.post('/kyusei/calculate', (req, res) => {
  try {
    const { birthDate, currentDate } = req.body;

    if (!birthDate) {
      return res.status(400).json({ error: 'birthDate is required' });
    }

    // 生年月日から九星を計算
    const birth = LocalDate.parse(birthDate);
    const yearQsei = Qsei.getYear(birth);
    const monthQsei = Qsei.getMonth(birth);
    const dayQsei = Qsei.getDay(birth);

    if (!yearQsei || !monthQsei || !dayQsei) {
      return res.status(500).json({ error: 'Failed to calculate kyusei for birth date' });
    }

    // 干支計算（年・月・日）
    const yearJikanEto = JikanEto.ofYear(birth);
    const monthJikanEto = JikanEto.ofMonth(birth);
    const dayJikanEto = JikanEto.ofDay(birth);

    // 年干支から納音を取得
    const nattin = yearJikanEto.toNattin();

    // 傾斜・同会判定
    const keisha = yearQsei.hakka?.name || null;
    const keishaRubi = yearQsei.hakka?.rubi || null;

    // 現在日付が指定されている場合はその日付での九星も計算
    let currentYearQsei = null;
    let currentMonthQsei = null;
    let currentDayQsei = null;
    if (currentDate) {
      const current = LocalDate.parse(currentDate);
      currentYearQsei = Qsei.getYear(current);
      currentMonthQsei = Qsei.getMonth(current);
      currentDayQsei = Qsei.getDay(current);
    }

    res.json({
      birth: {
        date: birthDate,
        year: {
          index: yearQsei.index,
          name: yearQsei.name,
          rubi: yearQsei.rubi,
          gogyou: yearQsei.gogyou?.key || null,
          houi: yearQsei.houi?.name || null
        },
        month: {
          index: monthQsei.index,
          name: monthQsei.name,
          rubi: monthQsei.rubi,
          gogyou: monthQsei.gogyou?.key || null,
          houi: monthQsei.houi?.name || null,
          eto60: {
            name: monthJikanEto.name,
            jikan: monthJikanEto.toJikan().name,
            jikanRubi: monthJikanEto.toJikan().rubi,
            eto: monthJikanEto.toEto().name
          }
        },
        day: {
          index: dayQsei.index,
          name: dayQsei.name,
          rubi: dayQsei.rubi,
          gogyou: dayQsei.gogyou?.key || null,
          houi: dayQsei.houi?.name || null,
          eto60: {
            name: dayJikanEto.name,
            jikan: dayJikanEto.toJikan().name,
            jikanRubi: dayJikanEto.toJikan().rubi,
            eto: dayJikanEto.toEto().name
          }
        },
        eto60: {
          name: yearJikanEto.name,
          jikan: yearJikanEto.toJikan().name,
          jikanRubi: yearJikanEto.toJikan().rubi,
          eto: yearJikanEto.toEto().name,
          nattin: nattin.name
        },
        keisha: keisha,
        keishaRubi: keishaRubi
      },
      current: currentDate && currentYearQsei && currentMonthQsei && currentDayQsei ? {
        date: currentDate,
        year: {
          index: currentYearQsei.index,
          name: currentYearQsei.name,
          rubi: currentYearQsei.rubi
        },
        month: {
          index: currentMonthQsei.index,
          name: currentMonthQsei.name,
          rubi: currentMonthQsei.rubi
        },
        day: {
          index: currentDayQsei.index,
          name: currentDayQsei.name,
          rubi: currentDayQsei.rubi
        }
      } : null
    });
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
});

// 年盤計算API
app.post('/kyusei/nenban', (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const targetDate = LocalDate.parse(date);
    const yearQsei = Qsei.getYear(targetDate);

    if (!yearQsei) {
      return res.status(500).json({ error: 'Failed to calculate nenban' });
    }

    res.json({
      date: date,
      centerQsei: {
        index: yearQsei.index,
        name: yearQsei.name,
        rubi: yearQsei.rubi
      },
      kiban8: yearQsei.kiban8,
      kiban12: yearQsei.kiban12
    });
  } catch (error) {
    console.error('Nenban error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
});

// 月盤計算API
app.post('/kyusei/getsuban', (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const targetDate = LocalDate.parse(date);
    const monthQsei = Qsei.getMonth(targetDate);

    if (!monthQsei) {
      return res.status(500).json({ error: 'Failed to calculate getsuban' });
    }

    res.json({
      date: date,
      centerQsei: {
        index: monthQsei.index,
        name: monthQsei.name,
        rubi: monthQsei.rubi
      },
      kiban8: monthQsei.kiban8,
      kiban12: monthQsei.kiban12
    });
  } catch (error) {
    console.error('Getsuban error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
});

// 日盤計算API
app.post('/kyusei/nippan', (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const targetDate = LocalDate.parse(date);
    const dayQsei = Qsei.getDay(targetDate);

    if (!dayQsei) {
      return res.status(500).json({ error: 'Failed to calculate nippan' });
    }

    res.json({
      date: date,
      centerQsei: {
        index: dayQsei.index,
        name: dayQsei.name,
        rubi: dayQsei.rubi
      },
      kiban8: dayQsei.kiban8,
      kiban12: dayQsei.kiban12
    });
  } catch (error) {
    console.error('Nippan error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
});

// 吉方位計算API
app.post('/kyusei/kichihoui', (req, res) => {
  try {
    const { birthDate, targetDate } = req.body;

    if (!birthDate || !targetDate) {
      return res.status(400).json({ error: 'birthDate and targetDate are required' });
    }

    const birth = LocalDate.parse(birthDate);
    const target = LocalDate.parse(targetDate);

    const birthYearQsei = Qsei.getYear(birth);
    const targetYearQsei = Qsei.getYear(target);
    const targetMonthQsei = Qsei.getMonth(target);

    if (!birthYearQsei || !targetYearQsei || !targetMonthQsei) {
      return res.status(500).json({ error: 'Failed to calculate kichihoui' });
    }

    // 吉方位を計算（本九星の吉方位）
    const kipous = birthYearQsei.findKipous();

    // 年盤・月盤・日盤の九星配置を取得
    const targetDayQsei = Qsei.getDay(target);
    const nenbanHaichi = targetYearQsei.kiban8;
    const getsubanHaichi = targetMonthQsei.kiban8;
    const nippanHaichi = targetDayQsei ? targetDayQsei.kiban8 : null;

    // 各方位の詳細判定
    const houiDetails = [];
    const houis = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
    for (let i = 0; i < 8; i++) {
      const nenbanStar = nenbanHaichi[i];
      const getsubanStar = getsubanHaichi[i];
      const nippanStar = nippanHaichi ? nippanHaichi[i] : null;

      let kichiType = null;
      let kyouType = null;

      // 五黄殺・暗剣殺チェック
      if (nenbanStar === 5 || getsubanStar === 5) {
        kyouType = '五黄殺';
      } else if ((nenbanHaichi.indexOf(5) + 4) % 8 === i || (getsubanHaichi.indexOf(5) + 4) % 8 === i) {
        kyouType = '暗剣殺';
      }
      // 本命殺・本命的殺チェック
      else if (nenbanStar === birthYearQsei.index || getsubanStar === birthYearQsei.index) {
        kyouType = '本命殺';
      } else if ((nenbanHaichi.indexOf(birthYearQsei.index) + 4) % 8 === i ||
                 (getsubanHaichi.indexOf(birthYearQsei.index) + 4) % 8 === i) {
        kyouType = '本命的殺';
      }
      // 吉方位判定
      else if (kipous.includes(nenbanStar) && kipous.includes(getsubanStar)) {
        if (nenbanStar === getsubanStar) {
          kichiType = '最大吉方';
        } else {
          kichiType = '吉方';
        }
      }

      houiDetails.push({
        houi: houis[i],
        nenbanStar: nenbanStar,
        getsubanStar: getsubanStar,
        nippanStar: nippanStar,
        kichiType: kichiType,
        kyouType: kyouType
      });
    }

    res.json({
      birthDate: birthDate,
      targetDate: targetDate,
      birthQsei: {
        index: birthYearQsei.index,
        name: birthYearQsei.name,
        rubi: birthYearQsei.rubi
      },
      targetNenban: {
        index: targetYearQsei.index,
        name: targetYearQsei.name,
        haichi: nenbanHaichi
      },
      targetGetsuban: {
        index: targetMonthQsei.index,
        name: targetMonthQsei.name,
        haichi: getsubanHaichi
      },
      targetNippan: targetDayQsei ? {
        index: targetDayQsei.index,
        name: targetDayQsei.name,
        haichi: nippanHaichi
      } : null,
      kichiQseis: kipous,
      kichiQseiNames: Qsei.toText(kipous),
      houiDetails: houiDetails
    });
  } catch (error) {
    console.error('Kichihoui error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Kyusei Service running on ${HOST}:${PORT}`);
});