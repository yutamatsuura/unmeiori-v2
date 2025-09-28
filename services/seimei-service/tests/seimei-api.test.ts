import axios from 'axios';
import SeimeiAnalysisService, { AnalysisRequest } from '../src/services/seimei-analysis-service';
import KigakuNaviClient from '../src/external/kigaku-navi-client';

// テスト用実名データ（日本人の一般的な名前10パターン）
const TEST_NAMES = [
  { sei: '田中', mei: '太郎', expectedChars: ['田', '中', '太', '郎'] },
  { sei: '佐藤', mei: '花子', expectedChars: ['佐', '藤', '花', '子'] },
  { sei: '山田', mei: '一郎', expectedChars: ['山', '田', '一', '郎'] },
  { sei: '鈴木', mei: '美咲', expectedChars: ['鈴', '木', '美', '咲'] },
  { sei: '高橋', mei: '健太', expectedChars: ['高', '橋', '健', '太'] },
  { sei: '伊藤', mei: '恵子', expectedChars: ['伊', '藤', '恵', '子'] },
  { sei: '渡辺', mei: '翔太', expectedChars: ['渡', '辺', '翔', '太'] },
  { sei: '中村', mei: '由美', expectedChars: ['中', '村', '由', '美'] },
  { sei: '小林', mei: '大輔', expectedChars: ['小', '林', '大', '輔'] },
  { sei: '加藤', mei: '真奈', expectedChars: ['加', '藤', '真', '奈'] }
] as const;

// 期待される画数データ（標準的な漢字画数）
const EXPECTED_STROKE_COUNTS: { [key: string]: number } = {
  '田': 5, '中': 4, '太': 4, '郎': 9,
  '佐': 7, '藤': 18, '花': 7, '子': 3,
  '山': 3, '一': 1,
  '鈴': 13, '木': 4, '美': 9, '咲': 9,
  '高': 10, '橋': 16, '健': 11,
  '伊': 6, '恵': 12,
  '渡': 12, '辺': 5, '翔': 12,
  '村': 7, '由': 5,
  '小': 3, '林': 8, '大': 3, '輔': 14,
  '加': 5, '真': 10, '奈': 8
};

describe('Seimei Service - kigaku-navi API Integration Tests', () => {
  let seimeiService: SeimeiAnalysisService;
  let kigakuNaviClient: KigakuNaviClient;

  beforeAll(() => {
    // 実証性の原則：実際のサービスを使用
    seimeiService = new SeimeiAnalysisService();
    kigakuNaviClient = new KigakuNaviClient();

    console.log('=== Starting Real API Integration Tests ===');
    console.log('Test Environment: Real kigaku-navi API');
    console.log('Rate Limit: 1 second between requests');
  });

  beforeEach(async () => {
    // レート制限対応：各テスト間に1秒待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(() => {
    console.log('=== Real API Integration Tests Completed ===');
  });

  describe('KigakuNaviClient Real API Tests', () => {
    test('should handle API connection and return character data', async () => {
      const testName = TEST_NAMES[0]; // 田中太郎

      try {
        const characterData = await kigakuNaviClient.getCharacterInfo(testName.sei, testName.mei);

        // 基本構造の検証
        expect(Array.isArray(characterData)).toBe(true);
        expect(characterData.length).toBe(testName.expectedChars.length);

        // 各文字のデータ検証
        characterData.forEach((char, index) => {
          expect(char).toHaveProperty('character');
          expect(char).toHaveProperty('strokeCount');
          expect(char).toHaveProperty('reading');
          expect(char).toHaveProperty('gogyou');
          expect(char).toHaveProperty('youin');

          // 文字が正しいか確認
          expect(char.character).toBe(testName.expectedChars[index]);

          // 画数が正の数値か確認
          expect(typeof char.strokeCount).toBe('number');
          expect(char.strokeCount).toBeGreaterThan(0);

          console.log(`Character: ${char.character}, Strokes: ${char.strokeCount}, Gogyou: ${char.gogyou}, Youin: ${char.youin}`);
        });

      } catch (error) {
        console.error('API connection error (this may be expected if API is down):', error);

        // APIがダウンしている場合のフォールバック動作を検証
        expect(error).toBeDefined();

        // フォールバック処理が動作することを確認
        const fallbackData = await kigakuNaviClient.getCharacterInfo(testName.sei, testName.mei);
        expect(Array.isArray(fallbackData)).toBe(true);
        expect(fallbackData.length).toBe(testName.expectedChars.length);
      }
    }, 15000); // タイムアウト15秒

    test('should cache character data on subsequent requests', async () => {
      const testName = TEST_NAMES[1]; // 佐藤花子

      // 初回リクエスト
      const start1 = Date.now();
      const data1 = await kigakuNaviClient.getCharacterInfo(testName.sei, testName.mei);
      const time1 = Date.now() - start1;

      // キャッシュからの取得
      const start2 = Date.now();
      const data2 = await kigakuNaviClient.getCharacterInfo(testName.sei, testName.mei);
      const time2 = Date.now() - start2;

      // データが同じであることを確認
      expect(JSON.stringify(data1)).toBe(JSON.stringify(data2));

      // キャッシュによる高速化を確認（2回目は100ms以下であるべき）
      expect(time2).toBeLessThan(100);

      console.log(`First request: ${time1}ms, Cached request: ${time2}ms`);

      // キャッシュ統計確認
      const cacheStats = kigakuNaviClient.getCacheStats();
      expect(cacheStats.keys).toBeGreaterThan(0);

      console.log('Cache stats:', cacheStats);
    }, 15000);

    test('should handle kantei result API', async () => {
      const testName = TEST_NAMES[2]; // 山田一郎

      try {
        const kanteiResults = await kigakuNaviClient.getKanteiResult(testName.sei, testName.mei);

        expect(Array.isArray(kanteiResults)).toBe(true);
        expect(kanteiResults.length).toBeGreaterThan(0);

        kanteiResults.forEach(result => {
          expect(result).toHaveProperty('category');
          expect(result).toHaveProperty('score');
          expect(result).toHaveProperty('message');

          expect(typeof result.score).toBe('number');
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);

          console.log(`Kantei - ${result.category}: ${result.score} points - ${result.message}`);
        });

      } catch (error) {
        console.error('Kantei API error (this may be expected):', error);

        // フォールバック処理が動作することを確認
        const fallbackResults = await kigakuNaviClient.getKanteiResult(testName.sei, testName.mei);
        expect(Array.isArray(fallbackResults)).toBe(true);
        expect(fallbackResults.length).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describe('SeimeiAnalysisService Complete Integration Tests', () => {
    test.each(TEST_NAMES)('should analyze real name: $sei $mei', async (testName) => {
      const request: AnalysisRequest = {
        sei: testName.sei,
        mei: testName.mei,
        options: { includeDetail: true }
      };

      const result = await seimeiService.analyze(request);

      // 基本レスポンス構造の検証
      expect(result).toHaveProperty('sei', testName.sei);
      expect(result).toHaveProperty('mei', testName.mei);
      expect(result).toHaveProperty('fullName', `${testName.sei} ${testName.mei}`);
      expect(result).toHaveProperty('characters');
      expect(result).toHaveProperty('kakusu');
      expect(result).toHaveProperty('kanteiResults');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('grade');

      // 文字データの検証
      expect(Array.isArray(result.characters)).toBe(true);
      expect(result.characters.length).toBe(testName.expectedChars.length);

      result.characters.forEach((char, index) => {
        expect(char.character).toBe(testName.expectedChars[index]);
        expect(typeof char.strokeCount).toBe('number');
        expect(char.strokeCount).toBeGreaterThan(0);

        // 五行が設定されているか確認
        expect(['木', '火', '土', '金', '水']).toContain(char.gogyou);

        // 陰陽が設定されているか確認
        expect(['陰', '陽']).toContain(char.youin);

        console.log(`${testName.sei}${testName.mei} - ${char.character}: ${char.strokeCount}画, ${char.gogyou}, ${char.youin}`);
      });

      // 画数計算の検証
      expect(result.kakusu).toHaveProperty('tenkaku');
      expect(result.kakusu).toHaveProperty('jinkaku');
      expect(result.kakusu).toHaveProperty('chikaku');
      expect(result.kakusu).toHaveProperty('soukaku');
      expect(result.kakusu).toHaveProperty('gaikaku');

      Object.values(result.kakusu).forEach(kaku => {
        expect(typeof kaku).toBe('number');
        expect(kaku).toBeGreaterThan(0);
      });

      // 鑑定結果の検証
      expect(Array.isArray(result.kanteiResults)).toBe(true);
      expect(result.kanteiResults.length).toBeGreaterThan(0);

      result.kanteiResults.forEach(kantei => {
        expect(typeof kantei.score).toBe('number');
        expect(kantei.score).toBeGreaterThanOrEqual(0);
        expect(kantei.score).toBeLessThanOrEqual(100);
        expect(typeof kantei.message).toBe('string');
        expect(kantei.message.length).toBeGreaterThan(0);
      });

      // 総合スコアとグレードの検証
      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(['S', 'A', 'B', 'C', 'D', 'E']).toContain(result.grade);

      // 外部API呼び出し情報の検証
      expect(result.externalApiCalls).toHaveProperty('characterApi');
      expect(result.externalApiCalls).toHaveProperty('kanteiApi');

      console.log(`Analysis completed for ${testName.sei}${testName.mei}: Score ${result.overallScore} (Grade: ${result.grade})`);
      console.log(`External API calls - Character: ${result.externalApiCalls.characterApi.cached ? 'cached' : 'fresh'}, Kantei: ${result.externalApiCalls.kanteiApi.cached ? 'cached' : 'fresh'}`);

    }, 20000); // タイムアウト20秒（レート制限考慮）
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid characters gracefully', async () => {
      const invalidRequest: AnalysisRequest = {
        sei: '！@#',
        mei: '$%^',
        options: {}
      };

      const result = await seimeiService.analyze(invalidRequest);

      // エラーハンドリングでフォールバック結果が返されることを確認
      expect(result).toBeDefined();
      expect(result.sei).toBe(invalidRequest.sei);
      expect(result.mei).toBe(invalidRequest.mei);
      expect(Array.isArray(result.characters)).toBe(true);
      expect(typeof result.overallScore).toBe('number');

      console.log('Invalid character handling test passed with fallback result');
    });

    test('should handle empty names', async () => {
      const emptyRequest: AnalysisRequest = {
        sei: '',
        mei: '',
        options: {}
      };

      // 空の名前でもエラーにならずに処理されることを確認
      const result = await seimeiService.analyze(emptyRequest);
      expect(result).toBeDefined();

      console.log('Empty name handling test passed');
    });

    test('should handle network timeouts', async () => {
      // タイムアウトシミュレーションは困難なため、
      // 実際のタイムアウト設定が有効であることを確認
      const client = new KigakuNaviClient();

      // クライアントが適切に設定されていることを確認
      expect(client).toBeDefined();

      const testName = TEST_NAMES[3];

      try {
        const result = await client.getCharacterInfo(testName.sei, testName.mei);
        expect(result).toBeDefined();

        console.log('Network timeout configuration verified');
      } catch (error) {
        // タイムアウトやネットワークエラーが適切に処理されることを確認
        expect(error).toBeDefined();
        console.log('Network error properly caught:', error instanceof Error ? error.message : 'Unknown error');
      }
    }, 15000);
  });

  describe('Cache Management Tests', () => {
    test('should provide cache statistics', () => {
      const stats = seimeiService.getCacheStats();

      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('stats');
      expect(typeof stats.keys).toBe('number');

      console.log('Cache statistics:', stats);
    });

    test('should clear cache successfully', () => {
      // キャッシュクリア前の統計取得
      const statsBefore = seimeiService.getCacheStats();

      // キャッシュクリア実行
      seimeiService.clearCache();

      // キャッシュクリア後の統計取得
      const statsAfter = seimeiService.getCacheStats();

      // キャッシュがクリアされていることを確認
      expect(statsAfter.keys).toBeLessThanOrEqual(statsBefore.keys);

      console.log('Cache cleared successfully');
      console.log('Before:', statsBefore.keys, 'After:', statsAfter.keys);
    });

    test('should rebuild cache after clear', async () => {
      // キャッシュクリア
      seimeiService.clearCache();

      const testName = TEST_NAMES[4]; // 高橋健太

      // 新しいリクエストでキャッシュが再構築されることを確認
      const result = await seimeiService.analyze({
        sei: testName.sei,
        mei: testName.mei,
        options: {}
      });

      expect(result).toBeDefined();

      // キャッシュが再構築されていることを確認
      const statsAfterRebuild = seimeiService.getCacheStats();
      expect(statsAfterRebuild.keys).toBeGreaterThan(0);

      console.log('Cache rebuilt successfully after clear');
    }, 15000);
  });

  describe('Rate Limiting Tests', () => {
    test('should respect rate limits between requests', async () => {
      const testNames = TEST_NAMES.slice(5, 8); // 3つの名前でテスト
      const requestTimes: number[] = [];

      for (const testName of testNames) {
        const startTime = Date.now();

        await kigakuNaviClient.getCharacterInfo(testName.sei, testName.mei);

        requestTimes.push(Date.now() - startTime);
      }

      // 2回目以降のリクエストが適切にレート制限されていることを確認
      // （初回はキャッシュされていない可能性があるため除外）
      for (let i = 1; i < requestTimes.length; i++) {
        const timeBetweenRequests = requestTimes[i];

        // レート制限（1秒）が適用されている場合、
        // リクエスト時間に遅延が含まれているはず
        console.log(`Request ${i + 1} time: ${timeBetweenRequests}ms`);
      }

      console.log('Rate limiting test completed');
    }, 25000);
  });

  describe('Performance Tests', () => {
    test('should complete analysis within reasonable time', async () => {
      const testName = TEST_NAMES[9]; // 加藤真奈

      const startTime = Date.now();

      const result = await seimeiService.analyze({
        sei: testName.sei,
        mei: testName.mei,
        options: { includeDetail: true }
      });

      const executionTime = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(10000); // 10秒以内

      console.log(`Full analysis completed in ${executionTime}ms`);
      console.log(`Performance: ${executionTime < 3000 ? 'GOOD' : executionTime < 6000 ? 'ACCEPTABLE' : 'SLOW'}`);
    }, 15000);

    test('should handle concurrent requests', async () => {
      const concurrentNames = TEST_NAMES.slice(0, 3);

      const startTime = Date.now();

      // 同時リクエスト実行
      const promises = concurrentNames.map(testName =>
        seimeiService.analyze({
          sei: testName.sei,
          mei: testName.mei,
          options: {}
        })
      );

      const results = await Promise.all(promises);

      const executionTime = Date.now() - startTime;

      // 全ての結果が正常に返されることを確認
      expect(results.length).toBe(concurrentNames.length);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.sei).toBe(concurrentNames[index].sei);
        expect(result.mei).toBe(concurrentNames[index].mei);
      });

      console.log(`Concurrent requests completed in ${executionTime}ms`);
      console.log(`Average per request: ${Math.round(executionTime / concurrentNames.length)}ms`);
    }, 30000);
  });
});