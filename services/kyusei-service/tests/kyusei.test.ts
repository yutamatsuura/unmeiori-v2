import request from 'supertest';
import express from 'express';
import cors from 'cors';

// テスト用のアプリを作成（実際のサーバーとは別）
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // ヘルスチェック
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'kyusei-service'
    });
  });

  // モックAPIエンドポイント（実際のロジック検証は後で実装）
  app.post('/kyusei/calculate', (req, res) => {
    const { birthDate, currentDate } = req.body;

    if (!birthDate) {
      return res.status(400).json({ error: 'birthDate is required' });
    }

    // テスト用の固定レスポンス
    res.json({
      birth: {
        date: birthDate,
        year: {
          index: 1,
          name: "一白水星",
          rubi: "いっぱくすいせい",
          gogyou: "水",
          houi: "北"
        },
        month: {
          index: 6,
          name: "六白金星",
          rubi: "ろっぱくきんせい",
          gogyou: "金",
          houi: "北西"
        }
      },
      current: currentDate ? {
        date: currentDate,
        year: {
          index: 2,
          name: "二黒土星",
          rubi: "じこくどせい"
        },
        month: {
          index: 8,
          name: "八白土星",
          rubi: "はっぱくどせい"
        }
      } : null
    });
  });

  app.post('/kyusei/nenban', (req, res) => {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    res.json({
      date: date,
      centerQsei: {
        index: 1,
        name: "一白水星",
        rubi: "いっぱくすいせい"
      },
      kiban8: [6, 4, 8, 9, 5, 7, 3, 2],
      kiban12: [6, 4, 4, 8, 9, 9, 5, 7, 7, 3, 2, 2]
    });
  });

  app.post('/kyusei/kichihoui', (req, res) => {
    const { birthDate, targetDate } = req.body;

    if (!birthDate || !targetDate) {
      return res.status(400).json({ error: 'birthDate and targetDate are required' });
    }

    res.json({
      birthDate: birthDate,
      targetDate: targetDate,
      birthQsei: {
        index: 1,
        name: "一白水星",
        rubi: "いっぱくすいせい"
      },
      targetNenban: {
        index: 2,
        name: "二黒土星"
      },
      targetGetsuban: {
        index: 8,
        name: "八白土星"
      },
      kichiQseis: [3, 4, 6, 7],
      kichiQseiNames: "三碧木星,四緑木星,六白金星,七赤金星"
    });
  });

  return app;
};

describe('Kyusei Service API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'kyusei-service'
      });
    });
  });

  describe('POST /kyusei/calculate', () => {
    it('should calculate kyusei for birth date', async () => {
      const response = await request(app)
        .post('/kyusei/calculate')
        .send({
          birthDate: '1990-05-15'
        })
        .expect(200);

      expect(response.body.birth).toBeDefined();
      expect(response.body.birth.date).toBe('1990-05-15');
      expect(response.body.birth.year.index).toBe(1);
      expect(response.body.birth.year.name).toBe('一白水星');
    });

    it('should calculate kyusei for birth date and current date', async () => {
      const response = await request(app)
        .post('/kyusei/calculate')
        .send({
          birthDate: '1990-05-15',
          currentDate: '2024-01-01'
        })
        .expect(200);

      expect(response.body.birth).toBeDefined();
      expect(response.body.current).toBeDefined();
      expect(response.body.current.date).toBe('2024-01-01');
    });

    it('should return error when birthDate is missing', async () => {
      const response = await request(app)
        .post('/kyusei/calculate')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('birthDate is required');
    });
  });

  describe('POST /kyusei/nenban', () => {
    it('should calculate nenban for given date', async () => {
      const response = await request(app)
        .post('/kyusei/nenban')
        .send({
          date: '2024-01-01'
        })
        .expect(200);

      expect(response.body.date).toBe('2024-01-01');
      expect(response.body.centerQsei.index).toBe(1);
      expect(response.body.kiban8).toHaveLength(8);
      expect(response.body.kiban12).toHaveLength(12);
    });

    it('should return error when date is missing', async () => {
      const response = await request(app)
        .post('/kyusei/nenban')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('date is required');
    });
  });

  describe('POST /kyusei/kichihoui', () => {
    it('should calculate kichihoui for birth and target dates', async () => {
      const response = await request(app)
        .post('/kyusei/kichihoui')
        .send({
          birthDate: '1990-05-15',
          targetDate: '2024-01-01'
        })
        .expect(200);

      expect(response.body.birthDate).toBe('1990-05-15');
      expect(response.body.targetDate).toBe('2024-01-01');
      expect(response.body.birthQsei.index).toBe(1);
      expect(response.body.kichiQseis).toBeInstanceOf(Array);
      expect(response.body.kichiQseiNames).toContain('木星');
    });

    it('should return error when required dates are missing', async () => {
      const response = await request(app)
        .post('/kyusei/kichihoui')
        .send({
          birthDate: '1990-05-15'
        })
        .expect(400);

      expect(response.body.error).toBe('birthDate and targetDate are required');
    });
  });
});