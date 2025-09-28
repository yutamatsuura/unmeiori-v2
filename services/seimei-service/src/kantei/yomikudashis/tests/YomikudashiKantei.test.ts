/**
 * 読み下し判定システム テストファイル
 */

import { YomikudashiKantei, YomikudashiType, SeverityLevel } from '../index';
import type { YomikudashiInput } from '../types';

describe('YomikudashiKantei', () => {
  describe('基本判定テスト', () => {
    test('分離名判定 - 全文字が分離系の場合', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '一', strokeCount: 1 },
          { char: '二', strokeCount: 2 }
        ],
        meiCharacters: [
          { char: '三', strokeCount: 3 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);

      const bunriIssue = result.issues.find(issue => issue.type === YomikudashiType.BUNRI_NAME);
      expect(bunriIssue).toBeDefined();
      expect(bunriIssue?.severity).toBe(SeverityLevel.CRITICAL);
    });

    test('一文字名判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '田', strokeCount: 5 },
          { char: '中', strokeCount: 4 }
        ],
        meiCharacters: [
          { char: '太', strokeCount: 4 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const singleCharIssue = result.issues.find(issue => issue.type === YomikudashiType.SINGLE_CHARACTER);
      expect(singleCharIssue).toBeDefined();
      expect(singleCharIssue?.severity).toBe(SeverityLevel.HIGH);
      expect(singleCharIssue?.problematicCharacters).toEqual(['太']);
    });

    test('地格9画判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '佐', strokeCount: 7 },
          { char: '藤', strokeCount: 18 }
        ],
        meiCharacters: [
          { char: '四', strokeCount: 5 },
          { char: '四', strokeCount: 4 } // 合計9画
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const chikakuIssue = result.issues.find(issue => issue.type === YomikudashiType.CHIKAKU_9_19);
      expect(chikakuIssue).toBeDefined();
      expect(chikakuIssue?.severity).toBe(SeverityLevel.HIGH);
    });

    test('人格19画判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '山', strokeCount: 3 },
          { char: '田', strokeCount: 10 } // 姓の最後
        ],
        meiCharacters: [
          { char: '九', strokeCount: 9 }, // 名の最初（10+9=19画）
          { char: '郎', strokeCount: 9 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const jinkakuIssue = result.issues.find(issue => issue.type === YomikudashiType.JINKAKU_9_19);
      expect(jinkakuIssue).toBeDefined();
      expect(jinkakuIssue?.severity).toBe(SeverityLevel.HIGH);
    });
  });

  describe('文字種別判定テスト', () => {
    test('動物の字判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '田', strokeCount: 5 },
          { char: '中', strokeCount: 4 }
        ],
        meiCharacters: [
          { char: '虎', strokeCount: 8 },
          { char: '雄', strokeCount: 12 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const animalIssue = result.issues.find(issue => issue.type === YomikudashiType.ANIMAL_CHARACTER);
      expect(animalIssue).toBeDefined();
      expect(animalIssue?.problematicCharacters).toContain('虎');
      expect(animalIssue?.severity).toBe(SeverityLevel.MEDIUM);
    });

    test('魚の字判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '佐', strokeCount: 7 },
          { char: '藤', strokeCount: 18 }
        ],
        meiCharacters: [
          { char: '鯉', strokeCount: 18 },
          { char: '太', strokeCount: 4 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const fishIssue = result.issues.find(issue => issue.type === YomikudashiType.FISH_CHARACTER);
      expect(fishIssue).toBeDefined();
      expect(fishIssue?.problematicCharacters).toContain('鯉');
    });

    test('尊貴すぎる字判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '田', strokeCount: 5 },
          { char: '中', strokeCount: 4 }
        ],
        meiCharacters: [
          { char: '王', strokeCount: 4 },
          { char: '子', strokeCount: 3 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const nobleIssue = result.issues.find(issue => issue.type === YomikudashiType.OVERLY_NOBLE);
      expect(nobleIssue).toBeDefined();
      expect(nobleIssue?.problematicCharacters).toContain('王');
    });

    test('品格を損なう字判定', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '山', strokeCount: 3 },
          { char: '田', strokeCount: 5 }
        ],
        meiCharacters: [
          { char: '肉', strokeCount: 6 },
          { char: '郎', strokeCount: 9 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);

      const vulgarIssue = result.issues.find(issue => issue.type === YomikudashiType.VULGAR_CHARACTER);
      expect(vulgarIssue).toBeDefined();
      expect(vulgarIssue?.problematicCharacters).toContain('肉');
      expect(vulgarIssue?.severity).toBe(SeverityLevel.HIGH);
    });
  });

  describe('スコア計算テスト', () => {
    test('問題がない場合は100点', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '佐', strokeCount: 7 },
          { char: '々', strokeCount: 3 }
        ],
        meiCharacters: [
          { char: '健', strokeCount: 11 },
          { char: '太', strokeCount: 4 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(false);
      expect(result.totalScore).toBe(100);
      expect(result.overallEvaluation).toBe('excellent');
    });

    test('重大な問題がある場合は大幅減点', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '一', strokeCount: 1 }
        ],
        meiCharacters: [
          { char: '二', strokeCount: 2 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);
      expect(result.totalScore).toBeLessThan(80);
      expect(result.overallEvaluation).toBe('poor');
    });
  });

  describe('設定による動作テスト', () => {
    test('特定の判定を無効化', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '田', strokeCount: 5 },
          { char: '中', strokeCount: 4 }
        ],
        meiCharacters: [
          { char: '虎', strokeCount: 8 }
        ]
      };

      // 動物判定と一文字名判定を無効化
      const config = {
        enabledTypes: [
          YomikudashiType.BUNRI_NAME,
          YomikudashiType.CHIKAKU_9_19,
          YomikudashiType.JINKAKU_9_19
        ]
      };

      const result = YomikudashiKantei.performKantei(input, config);

      // 一文字名の問題は検出されるはずだが、無効化されているので検出されない
      const animalIssue = result.issues.find(issue => issue.type === YomikudashiType.ANIMAL_CHARACTER);
      expect(animalIssue).toBeUndefined();

      // 一文字名は無効化されているので検出されない
      const singleCharIssue = result.issues.find(issue => issue.type === YomikudashiType.SINGLE_CHARACTER);
      expect(singleCharIssue).toBeUndefined();
    });
  });

  describe('総合評価テスト', () => {
    test('優秀な名前の評価', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '田', strokeCount: 5 },
          { char: '中', strokeCount: 4 }
        ],
        meiCharacters: [
          { char: '真', strokeCount: 10 },
          { char: '理', strokeCount: 11 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.overallEvaluation).toBe('excellent');
      expect(result.summary).toContain('問題は検出されませんでした');
    });

    test('複数の問題がある名前の評価', () => {
      const input: YomikudashiInput = {
        seiCharacters: [
          { char: '一', strokeCount: 1 }
        ],
        meiCharacters: [
          { char: '虎', strokeCount: 8 }
        ]
      };

      const result = YomikudashiKantei.performKantei(input);

      expect(result.hasIssue).toBe(true);
      expect(result.issues.length).toBeGreaterThan(1);
      expect(result.overallEvaluation).toBe('poor');
      expect(result.summary).toContain('問題が検出されました');
    });
  });
});