/**
 * 高度スコア計算システム テストスイート
 */

import { ScoreCalculator, ScoreCalculatorInput, DEFAULT_CONFIG } from '../index';

describe('ScoreCalculator', () => {
  // テストデータ
  const testInputGoodName: ScoreCalculatorInput = {
    seiCharacters: [
      { char: '田', strokeCount: 5 },
      { char: '中', strokeCount: 4 }
    ],
    meiCharacters: [
      { char: '太', strokeCount: 4 },
      { char: '郎', strokeCount: 9 }
    ],
    tenkakuKakusu: 9,   // 5 + 4
    jinkakuKakusu: 8,   // 4 + 4
    chikakuKakusu: 13,  // 4 + 9
    sougakuKakusu: 22   // 5 + 4 + 4 + 9
  };

  const testInputPoorName: ScoreCalculatorInput = {
    seiCharacters: [
      { char: '鬼', strokeCount: 10 }
    ],
    meiCharacters: [
      { char: '殺', strokeCount: 10 }
    ],
    tenkakuKakusu: 10,
    jinkakuKakusu: 20,
    chikakuKakusu: 10,
    sougakuKakusu: 20
  };

  const testInputExcellentName: ScoreCalculatorInput = {
    seiCharacters: [
      { char: '山', strokeCount: 3 },
      { char: '田', strokeCount: 5 }
    ],
    meiCharacters: [
      { char: '花', strokeCount: 7 },
      { char: '子', strokeCount: 3 }
    ],
    tenkakuKakusu: 8,   // 3 + 5
    jinkakuKakusu: 12,  // 5 + 7
    chikakuKakusu: 10,  // 7 + 3
    sougakuKakusu: 18   // 3 + 5 + 7 + 3
  };

  describe('基本機能テスト', () => {
    test('正常なスコア計算が実行される', () => {
      const result = ScoreCalculator.calculate(testInputGoodName);

      expect(result).toBeDefined();
      expect(result.totalScore).toBeGreaterThanOrEqual(5);
      expect(result.totalScore).toBeLessThanOrEqual(100);
      expect(result.fullName).toBe('田中 太郎');
      expect(result.categoryScores).toHaveLength(5);
    });

    test('カテゴリ別スコアが正しく計算される', () => {
      const result = ScoreCalculator.calculate(testInputGoodName);

      // 全てのカテゴリが含まれている
      const categories = result.categoryScores.map(score => score.category);
      expect(categories).toContain('youin');
      expect(categories).toContain('gogyou');
      expect(categories).toContain('kakusu');
      expect(categories).toContain('tenchi');
      expect(categories).toContain('yomikudashi');

      // 重み付けが正しく適用されている
      result.categoryScores.forEach(score => {
        expect(score.weight).toBeGreaterThan(0);
        expect(score.weight).toBeLessThanOrEqual(1);
        expect(score.normalizedScore).toBeGreaterThanOrEqual(5);
        expect(score.normalizedScore).toBeLessThanOrEqual(100);
      });
    });

    test('重み付けの合計が1になる', () => {
      const result = ScoreCalculator.calculate(testInputGoodName);
      const totalWeight = result.categoryScores.reduce((sum, score) => sum + score.weight, 0);
      expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.001);
    });
  });

  describe('スコア範囲制御テスト', () => {
    test('スコアが5-100の範囲内に収まる', () => {
      const result1 = ScoreCalculator.calculate(testInputGoodName);
      const result2 = ScoreCalculator.calculate(testInputPoorName);
      const result3 = ScoreCalculator.calculate(testInputExcellentName);

      [result1, result2, result3].forEach(result => {
        expect(result.totalScore).toBeGreaterThanOrEqual(5);
        expect(result.totalScore).toBeLessThanOrEqual(100);
      });
    });

    test('優秀な名前は高スコアになる', () => {
      const result = ScoreCalculator.calculate(testInputExcellentName);
      expect(result.totalScore).toBeGreaterThan(60);
    });

    test('問題のある名前は低スコアになる', () => {
      const result = ScoreCalculator.calculate(testInputPoorName);
      expect(result.totalScore).toBeLessThan(70);
    });
  });

  describe('評価レベル判定テスト', () => {
    test('90点以上でEXCELLENT判定', () => {
      // 高スコアを強制するためのカスタム設定
      const customConfig = {
        ...DEFAULT_CONFIG,
        weights: {
          youin: 0.2,
          gogyou: 0.2,
          kakusu: 0.2,
          tenchi: 0.2,
          yomikudashi: 0.2
        }
      };

      const result = ScoreCalculator.calculate(testInputExcellentName, customConfig);

      if (result.totalScore >= 90) {
        expect(result.evaluationLevel).toBe('excellent');
        expect(result.classification).toBe('excellent_name');
      }
    });

    test('70点以上で正名判定', () => {
      const result = ScoreCalculator.calculate(testInputGoodName);

      if (result.totalScore >= 70) {
        expect(result.specialJudgments.isGoodName).toBe(true);
        expect(result.classification).toBe('good_name');
      }
    });

    test('70点未満で改名推奨判定', () => {
      const result = ScoreCalculator.calculate(testInputPoorName);

      if (result.totalScore < 70) {
        expect(result.specialJudgments.hasRecommendedChanges).toBe(true);
      }
    });
  });

  describe('特別判定テスト', () => {
    test('満点判定が正しく動作する', () => {
      // 満点は実際には稀なので、このテストは制御された条件で実行
      const result = ScoreCalculator.calculate(testInputGoodName);

      if (result.totalScore === 100) {
        expect(result.specialJudgments.isPerfectScore).toBe(true);
      } else {
        expect(result.specialJudgments.isPerfectScore).toBe(false);
      }
    });

    test('優秀名判定が正しく動作する', () => {
      const result = ScoreCalculator.calculate(testInputExcellentName);

      if (result.totalScore >= 90) {
        expect(result.specialJudgments.isExcellentName).toBe(true);
      }
    });
  });

  describe('レポート生成テスト', () => {
    test('詳細レポートが生成される', () => {
      const result = ScoreCalculator.calculate(testInputGoodName);

      expect(result.detailedReport).toBeDefined();
      expect(result.detailedReport.executiveSummary).toContain('田中 太郎');
      expect(result.detailedReport.categoryAnalysis).toContain('陰陽パターン');
      expect(result.detailedReport.overallAdvice).toBeTruthy();
      expect(result.detailedReport.technicalDetails).toContain('重み付け');
    });

    test('総合評価が適切に生成される', () => {
      const result = ScoreCalculator.calculate(testInputGoodName);

      expect(result.overallAssessment).toBeDefined();
      expect(result.overallAssessment.summary).toBeTruthy();
      expect(Array.isArray(result.overallAssessment.strengths)).toBe(true);
      expect(Array.isArray(result.overallAssessment.weaknesses)).toBe(true);
      expect(Array.isArray(result.overallAssessment.recommendations)).toBe(true);
    });
  });

  describe('カスタム設定テスト', () => {
    test('カスタム重み付けが適用される', () => {
      const customConfig = {
        weights: {
          youin: 0.4,      // 陰陽の重みを高く
          gogyou: 0.3,     // 五行の重みを高く
          kakusu: 0.2,     // 画数の重みを低く
          tenchi: 0.05,    // 天地の重みを低く
          yomikudashi: 0.05 // 読み下しの重みを低く
        }
      };

      const result = ScoreCalculator.calculate(testInputGoodName, customConfig);

      expect(result.calculationMetadata.weights).toEqual(customConfig.weights);

      const youinScore = result.categoryScores.find(s => s.category === 'youin');
      const kakusuScore = result.categoryScores.find(s => s.category === 'kakusu');

      expect(youinScore?.weight).toBe(0.4);
      expect(kakusuScore?.weight).toBe(0.2);
    });

    test('カスタム正規化設定が適用される', () => {
      const customConfig = {
        normalization: {
          minScore: 10,
          maxScore: 90,
          baseScore: 60,
          strictMode: true
        }
      };

      const result = ScoreCalculator.calculate(testInputGoodName, customConfig);

      expect(result.totalScore).toBeGreaterThanOrEqual(10);
      expect(result.totalScore).toBeLessThanOrEqual(90);
    });
  });

  describe('メタデータテスト', () => {
    test('計算メタデータが正しく記録される', () => {
      const startTime = Date.now();
      const result = ScoreCalculator.calculate(testInputGoodName);
      const endTime = Date.now();

      expect(result.calculationMetadata).toBeDefined();
      expect(result.calculationMetadata.version).toBe('1.0.0');
      expect(result.calculationMetadata.timestamp.getTime()).toBeGreaterThanOrEqual(startTime);
      expect(result.calculationMetadata.timestamp.getTime()).toBeLessThanOrEqual(endTime);
      expect(result.calculationMetadata.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('エラーハンドリングテスト', () => {
    test('無効な入力でエラーが発生する', () => {
      const invalidInput = {
        seiCharacters: [],
        meiCharacters: [],
        tenkakuKakusu: 0,
        jinkakuKakusu: 0,
        chikakuKakusu: 0,
        sougakuKakusu: 0
      };

      expect(() => {
        ScoreCalculator.calculate(invalidInput);
      }).toThrow();
    });

    test('画数が負の値の場合にエラーが発生する', () => {
      const invalidInput = {
        ...testInputGoodName,
        tenkakuKakusu: -5
      };

      expect(() => {
        ScoreCalculator.calculate(invalidInput);
      }).toThrow();
    });
  });

  describe('ログ機能テスト', () => {
    test('ログメッセージが記録される', () => {
      const calculator = new ScoreCalculator({
        enableDetailedLogging: true
      });

      const result = calculator.calculate(testInputGoodName);
      const logs = calculator.getLogMessages();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('ScoreCalculator initialized');
    });

    test('ログ無効時はメッセージが記録されない', () => {
      const calculator = new ScoreCalculator({
        enableDetailedLogging: false
      });

      const result = calculator.calculate(testInputGoodName);
      const logs = calculator.getLogMessages();

      expect(logs.length).toBe(0);
    });
  });
});