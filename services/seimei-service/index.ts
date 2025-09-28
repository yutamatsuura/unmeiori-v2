import express from 'express';
import cors from 'cors';
import SeimeiAnalysisService, { AnalysisRequest } from './src/services/seimei-analysis-service';

const app = express();
const PORT = process.env.PORT || 5003;
const HOST = process.env.HOST || '0.0.0.0';

// サービスインスタンス
const seimeiAnalysisService = new SeimeiAnalysisService();

// ミドルウェア
app.use(cors());
app.use(express.json());

// エラーハンドリングミドルウェア
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Unknown error occurred'
  });
});

// ルート
app.get('/', (req, res) => {
  res.json({
    message: 'Seimei Service with kigaku-navi API integration',
    service: 'seimei-service',
    port: 5003,
    version: '2.0.0',
    features: [
      'kigaku-navi API integration',
      'Character analysis with caching',
      'Kantei calculation with 81 patterns',
      'Gogyou balance analysis',
      'Youin pattern analysis'
    ]
  });
});

app.get('/health', (req, res) => {
  const cacheStats = seimeiAnalysisService.getCacheStats();
  res.json({
    status: 'healthy',
    service: 'seimei-service',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: cacheStats
  });
});

// 姓名分析API（メインエンドポイント）
app.post('/seimei/analyze', async (req, res) => {
  try {
    const { sei, mei, options } = req.body;

    // バリデーション
    if (!sei || !mei) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'sei and mei are required',
        received: { sei, mei }
      });
    }

    if (typeof sei !== 'string' || typeof mei !== 'string') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'sei and mei must be strings'
      });
    }

    if (sei.length > 10 || mei.length > 10) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'sei and mei must be 10 characters or less'
      });
    }

    const analysisRequest: AnalysisRequest = {
      sei: sei.trim(),
      mei: mei.trim(),
      options: options || {}
    };

    console.log(`Processing seimei analysis request:`, analysisRequest);

    // 姓名分析実行
    const result = await seimeiAnalysisService.analyze(analysisRequest);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Seimei analyze error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// 文字情報取得API（単体）
app.post('/seimei/characters', async (req, res) => {
  try {
    const { sei, mei } = req.body;

    if (!sei || !mei) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'sei and mei are required'
      });
    }

    // 文字情報のみを取得
    const analysisRequest: AnalysisRequest = {
      sei: sei.trim(),
      mei: mei.trim(),
      options: { includeDetail: false }
    };

    const result = await seimeiAnalysisService.analyze(analysisRequest);

    res.json({
      success: true,
      data: {
        characters: result.characters,
        fullName: result.fullName,
        externalApiCalls: result.externalApiCalls
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Characters error:', error);
    res.status(500).json({
      error: 'Character analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// 画数計算API
app.post('/seimei/kakusu', async (req, res) => {
  try {
    const { sei, mei } = req.body;

    if (!sei || !mei) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'sei and mei are required'
      });
    }

    const analysisRequest: AnalysisRequest = {
      sei: sei.trim(),
      mei: mei.trim(),
      options: { includeDetail: false }
    };

    const result = await seimeiAnalysisService.analyze(analysisRequest);

    res.json({
      success: true,
      data: {
        sei: result.sei,
        mei: result.mei,
        kakusu: result.kakusu,
        characters: result.characters.map(char => ({
          character: char.character,
          strokeCount: char.strokeCount
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kakusu calculation error:', error);
    res.status(500).json({
      error: 'Kakusu calculation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// 鑑定実行API
app.post('/seimei/kantei', async (req, res) => {
  try {
    const { sei, mei, options } = req.body;

    if (!sei || !mei) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'sei and mei are required'
      });
    }

    const analysisRequest: AnalysisRequest = {
      sei: sei.trim(),
      mei: mei.trim(),
      options: options || { includeDetail: true }
    };

    const result = await seimeiAnalysisService.analyze(analysisRequest);

    res.json({
      success: true,
      data: {
        sei: result.sei,
        mei: result.mei,
        overallScore: result.overallScore,
        grade: result.grade,
        kanteiResults: result.kanteiResults,
        gogyouBalance: result.gogyouBalance,
        youinPattern: result.youinPattern,
        templateIds: result.templateIds
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kantei analysis error:', error);
    res.status(500).json({
      error: 'Kantei analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// キャッシュ管理API
app.get('/seimei/cache/stats', (req, res) => {
  try {
    const stats = seimeiAnalysisService.getCacheStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get cache stats',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.delete('/seimei/cache', (req, res) => {
  try {
    seimeiAnalysisService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Seimei Service running on ${HOST}:${PORT}`);
});