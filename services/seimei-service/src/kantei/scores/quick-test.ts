/**
 * 高度スコア計算システム 簡易動作テスト
 */

import { ScoreCalculator, ScoreCalculatorInput } from './index';

// テストデータ
const testInput: ScoreCalculatorInput = {
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

function runQuickTest() {
  console.log('=== 高度スコア計算システム 簡易動作テスト ===\n');

  try {
    // スコア計算を実行
    const result = ScoreCalculator.calculate(testInput);

    console.log(`お名前: ${result.fullName}`);
    console.log(`総合スコア: ${result.totalScore}点`);
    console.log(`分類: ${result.classification}`);
    console.log(`評価レベル: ${result.evaluationLevel}`);
    console.log();

    console.log('=== カテゴリ別スコア ===');
    result.categoryScores.forEach(score => {
      console.log(`${score.category}: ${score.normalizedScore}点 (重み: ${Math.round(score.weight * 100)}%)`);
    });
    console.log();

    console.log('=== 特別判定 ===');
    if (result.specialJudgments.isPerfectScore) {
      console.log('✅ 満点名');
    }
    if (result.specialJudgments.isExcellentName) {
      console.log('✅ 優秀名');
    }
    if (result.specialJudgments.isGoodName) {
      console.log('✅ 正名');
    }
    if (result.specialJudgments.hasRecommendedChanges) {
      console.log('⚠️ 改名推奨');
    }
    console.log();

    console.log('=== 総合評価 ===');
    console.log(result.overallAssessment.summary);
    console.log();

    console.log('✅ テスト完了: システムは正常に動作しています');

  } catch (error) {
    console.error('❌ テスト失敗:', error);
    console.error((error as Error).stack);
  }
}

// テスト実行
if (require.main === module) {
  runQuickTest();
}

export { runQuickTest };