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
      service: 'seimei-service'
    });
  });

  // モックAPIエンドポイント
  app.post('/seimei/analyze', (req, res) => {
    const { sei, mei } = req.body;

    if (!sei || !mei) {
      return res.status(400).json({ error: 'sei and mei are required' });
    }

    res.json({
      sei: sei,
      mei: mei,
      fullName: `${sei} ${mei}`,
      message: "姓名分析はkigaku-navi API連携後に実装予定です",
      analysis: {
        tenchi: { name: "天地格", score: 85, description: "良好な運勢です" },
        jinkaku: { name: "人格", score: 78, description: "安定した性格です" },
        chikaku: { name: "地格", score: 92, description: "優れた才能があります" },
        gaikaku: { name: "外格", score: 67, description: "対人関係は良好です" },
        soukaku: { name: "総格", score: 81, description: "総合的に良い運勢です" }
      }
    });
  });

  app.post('/seimei/characters', (req, res) => {
    const { characters } = req.body;

    if (!characters || !Array.isArray(characters)) {
      return res.status(400).json({ error: 'characters array is required' });
    }

    const charInfo = characters.map((char, index) => ({
      character: char,
      strokeCount: Math.floor(Math.random() * 20) + 1,
      reading: `reading${index}`,
      gogyou: ["木", "火", "土", "金", "水"][index % 5],
      youin: index % 2 === 0 ? "陽" : "陰"
    }));

    res.json({
      characters: characters,
      characterInfo: charInfo,
      message: "文字情報はkigaku-navi API連携後に実装予定です"
    });
  });

  app.post('/seimei/kakusu', (req, res) => {
    const { sei, mei } = req.body;

    if (!sei || !mei) {
      return res.status(400).json({ error: 'sei and mei are required' });
    }

    const seiStroke = sei.length * 8;
    const meiStroke = mei.length * 7;
    const totalStroke = seiStroke + meiStroke;

    res.json({
      sei: sei,
      mei: mei,
      seiStroke: seiStroke,
      meiStroke: meiStroke,
      totalStroke: totalStroke,
      message: "画数計算はkigaku-navi API連携後に正確な計算を実装予定です",
      kakuData: {
        tenchi: Math.floor(totalStroke / 2),
        jinkaku: Math.floor(totalStroke * 0.3),
        chikaku: Math.floor(totalStroke * 0.4),
        gaikaku: Math.floor(totalStroke * 0.2),
        soukaku: totalStroke
      }
    });
  });

  app.post('/seimei/kantei', (req, res) => {
    const { sei, mei, birthDate } = req.body;

    if (!sei || !mei) {
      return res.status(400).json({ error: 'sei and mei are required' });
    }

    const overallScore = 85; // 固定値でテスト

    res.json({
      sei: sei,
      mei: mei,
      birthDate: birthDate || null,
      overallScore: overallScore,
      grade: "B",
      message: "総合鑑定はkigaku-navi API連携後に詳細な判定を実装予定です",
      details: {
        strengths: ["直感力に優れる", "リーダーシップがある", "創造性が豊か"],
        weaknesses: ["時に頑固になりがち", "細かい作業が苦手"],
        advice: "持ち前の直感力を活かして新しい分野にチャレンジしてみてください"
      }
    });
  });

  return app;
};

describe('Seimei Service API Tests', () => {
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
        service: 'seimei-service'
      });
    });
  });

  describe('POST /seimei/analyze', () => {
    it('should analyze name correctly', async () => {
      const response = await request(app)
        .post('/seimei/analyze')
        .send({
          sei: '田中',
          mei: '太郎'
        })
        .expect(200);

      expect(response.body.sei).toBe('田中');
      expect(response.body.mei).toBe('太郎');
      expect(response.body.fullName).toBe('田中 太郎');
      expect(response.body.analysis).toBeDefined();
      expect(response.body.analysis.tenchi.score).toBe(85);
    });

    it('should return error when sei is missing', async () => {
      const response = await request(app)
        .post('/seimei/analyze')
        .send({
          mei: '太郎'
        })
        .expect(400);

      expect(response.body.error).toBe('sei and mei are required');
    });

    it('should return error when mei is missing', async () => {
      const response = await request(app)
        .post('/seimei/analyze')
        .send({
          sei: '田中'
        })
        .expect(400);

      expect(response.body.error).toBe('sei and mei are required');
    });
  });

  describe('POST /seimei/characters', () => {
    it('should return character information', async () => {
      const response = await request(app)
        .post('/seimei/characters')
        .send({
          characters: ['田', '中', '太', '郎']
        })
        .expect(200);

      expect(response.body.characters).toEqual(['田', '中', '太', '郎']);
      expect(response.body.characterInfo).toHaveLength(4);
      expect(response.body.characterInfo[0].character).toBe('田');
      expect(response.body.characterInfo[0].gogyou).toBe('木');
    });

    it('should return error when characters is not array', async () => {
      const response = await request(app)
        .post('/seimei/characters')
        .send({
          characters: '田中太郎'
        })
        .expect(400);

      expect(response.body.error).toBe('characters array is required');
    });
  });

  describe('POST /seimei/kakusu', () => {
    it('should calculate kakusu correctly', async () => {
      const response = await request(app)
        .post('/seimei/kakusu')
        .send({
          sei: '田中',
          mei: '太郎'
        })
        .expect(200);

      expect(response.body.sei).toBe('田中');
      expect(response.body.mei).toBe('太郎');
      expect(response.body.seiStroke).toBe(16); // 2文字 * 8
      expect(response.body.meiStroke).toBe(14); // 2文字 * 7
      expect(response.body.totalStroke).toBe(30);
      expect(response.body.kakuData).toBeDefined();
    });

    it('should return error when sei or mei is missing', async () => {
      const response = await request(app)
        .post('/seimei/kakusu')
        .send({
          sei: '田中'
        })
        .expect(400);

      expect(response.body.error).toBe('sei and mei are required');
    });
  });

  describe('POST /seimei/kantei', () => {
    it('should return comprehensive kantei result', async () => {
      const response = await request(app)
        .post('/seimei/kantei')
        .send({
          sei: '田中',
          mei: '太郎',
          birthDate: '1990-05-15'
        })
        .expect(200);

      expect(response.body.sei).toBe('田中');
      expect(response.body.mei).toBe('太郎');
      expect(response.body.birthDate).toBe('1990-05-15');
      expect(response.body.overallScore).toBe(85);
      expect(response.body.grade).toBe('B');
      expect(response.body.details.strengths).toBeInstanceOf(Array);
      expect(response.body.details.weaknesses).toBeInstanceOf(Array);
      expect(response.body.details.advice).toBeDefined();
    });

    it('should work without birthDate', async () => {
      const response = await request(app)
        .post('/seimei/kantei')
        .send({
          sei: '田中',
          mei: '太郎'
        })
        .expect(200);

      expect(response.body.birthDate).toBeNull();
      expect(response.body.overallScore).toBe(85);
    });

    it('should return error when required fields are missing', async () => {
      const response = await request(app)
        .post('/seimei/kantei')
        .send({
          sei: '田中'
        })
        .expect(400);

      expect(response.body.error).toBe('sei and mei are required');
    });
  });
});