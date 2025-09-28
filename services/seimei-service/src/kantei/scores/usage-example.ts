/**
 * 高度スコア計算システム 使用例
 *
 * 統合スコア計算システムの基本的な使用方法を示すサンプルコード
 */

import {
  ScoreCalculator,
  ScoreCalculatorInput,
  ScoreCalculatorResult,
  ScoreCategory,
  NameClassification,
  OverallEvaluationLevel,
  DEFAULT_CONFIG
} from './index';

/**
 * 基本的な使用例
 */
function basicUsageExample() {
  console.log('=== 高度スコア計算システム 基本使用例 ===\n');

  // 入力データの準備
  const input: ScoreCalculatorInput = {
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

  // スコア計算を実行
  const result: ScoreCalculatorResult = ScoreCalculator.calculate(input);

  // 結果を表示
  console.log(`お名前: ${result.fullName}`);
  console.log(`総合スコア: ${result.totalScore}点`);
  console.log(`分類: ${getClassificationDisplayName(result.classification)}`);
  console.log(`評価レベル: ${getEvaluationDisplayName(result.evaluationLevel)}`);
  console.log();

  // カテゴリ別詳細を表示
  console.log('=== カテゴリ別詳細 ===');
  result.categoryScores.forEach(score => {
    console.log(`${getCategoryDisplayName(score.category)}: ${score.normalizedScore}点 (重み: ${Math.round(score.weight * 100)}%)`);
    console.log(`  詳細: ${score.details}`);
    if (score.strengths && score.strengths.length > 0) {
      console.log(`  良い点: ${score.strengths.join(', ')}`);
    }
    if (score.issues && score.issues.length > 0) {
      console.log(`  注意点: ${score.issues.join(', ')}`);
    }
    console.log();
  });

  // 特別判定結果を表示
  console.log('=== 特別判定 ===');
  if (result.specialJudgments.isPerfectScore) {
    console.log('🌟 満点名！完璧なお名前です！');
  }
  if (result.specialJudgments.isExcellentName) {
    console.log('✨ 優秀名！非常に良いお名前です！');
  }
  if (result.specialJudgments.isGoodName) {
    console.log('✅ 正名！良いお名前です！');
  }
  if (result.specialJudgments.hasRecommendedChanges) {
    console.log('⚠️ 改善が推奨されるお名前です');
  }
  console.log();

  // 総合評価を表示
  console.log('=== 総合評価 ===');
  console.log(result.overallAssessment.summary);
  console.log();

  if (result.overallAssessment.strengths.length > 0) {
    console.log('【強み】');
    result.overallAssessment.strengths.forEach(strength => {
      console.log(`• ${strength}`);
    });
    console.log();
  }

  if (result.overallAssessment.weaknesses.length > 0) {
    console.log('【弱み】');
    result.overallAssessment.weaknesses.forEach(weakness => {
      console.log(`• ${weakness}`);
    });
    console.log();
  }

  if (result.overallAssessment.recommendations.length > 0) {
    console.log('【推奨事項】');
    result.overallAssessment.recommendations.forEach(recommendation => {
      console.log(`• ${recommendation}`);
    });
    console.log();
  }
}

/**
 * カスタム設定使用例
 */
function customConfigExample() {
  console.log('=== カスタム設定使用例 ===\n');

  const input: ScoreCalculatorInput = {
    seiCharacters: [{ char: '田', strokeCount: 5 }],
    meiCharacters: [{ char: '中', strokeCount: 4 }],
    tenkakuKakusu: 5,
    jinkakuKakusu: 9,
    chikakuKakusu: 4,
    sougakuKakusu: 9
  };

  // カスタム重み付け設定
  const customConfig = {
    weights: {
      [ScoreCategory.YOUIN]: 0.3,      // 陰陽の重みを高く
      [ScoreCategory.GOGYOU]: 0.3,     // 五行の重みを高く
      [ScoreCategory.KAKUSU]: 0.2,     // 画数の重みを下げる
      [ScoreCategory.TENCHI]: 0.1,     // 天地の重みを下げる
      [ScoreCategory.YOMIKUDASHI]: 0.1  // 読み下しの重みを下げる
    },
    normalization: {
      minScore: 10,      // 最低点を10点に
      maxScore: 95,      // 最高点を95点に
      baseScore: 55,     // 基準点を55点に
      strictMode: true   // 厳格モード
    },
    enableDetailedLogging: true,
    generateTechnicalReport: true
  };

  // カスタム設定でスコア計算を実行
  const result = ScoreCalculator.calculate(input, customConfig);

  console.log(`お名前: ${result.fullName}`);
  console.log(`総合スコア: ${result.totalScore}点 (カスタム範囲: 10-95点)`);
  console.log();

  // 重み付けの確認
  console.log('=== カスタム重み付け ===');
  result.categoryScores.forEach(score => {
    console.log(`${getCategoryDisplayName(score.category)}: ${Math.round(score.weight * 100)}%`);
  });
  console.log();

  // 計算メタデータを表示
  console.log('=== 計算メタデータ ===');
  console.log(`バージョン: ${result.calculationMetadata.version}`);
  console.log(`計算時刻: ${result.calculationMetadata.timestamp.toISOString()}`);
  console.log(`処理時間: ${result.calculationMetadata.processingTimeMs}ms`);
  console.log();
}

/**
 * 複数名前の比較例
 */
function comparisonExample() {
  console.log('=== 複数名前の比較例 ===\n');

  const names = [
    {
      name: '山田花子',
      input: {
        seiCharacters: [{ char: '山', strokeCount: 3 }, { char: '田', strokeCount: 5 }],
        meiCharacters: [{ char: '花', strokeCount: 7 }, { char: '子', strokeCount: 3 }],
        tenkakuKakusu: 8, jinkakuKakusu: 12, chikakuKakusu: 10, sougakuKakusu: 18
      }
    },
    {
      name: '佐藤太郎',
      input: {
        seiCharacters: [{ char: '佐', strokeCount: 7 }, { char: '藤', strokeCount: 18 }],
        meiCharacters: [{ char: '太', strokeCount: 4 }, { char: '郎', strokeCount: 9 }],
        tenkakuKakusu: 25, jinkakuKakusu: 22, chikakuKakusu: 13, sougakuKakusu: 38
      }
    },
    {
      name: '田中一郎',
      input: {
        seiCharacters: [{ char: '田', strokeCount: 5 }, { char: '中', strokeCount: 4 }],
        meiCharacters: [{ char: '一', strokeCount: 1 }, { char: '郎', strokeCount: 9 }],
        tenkakuKakusu: 9, jinkakuKakusu: 5, chikakuKakusu: 10, sougakuKakusu: 19
      }
    }
  ];

  const results = names.map(nameData => ({
    name: nameData.name,
    result: ScoreCalculator.calculate(nameData.input)
  }));

  // スコア順にソート
  results.sort((a, b) => b.result.totalScore - a.result.totalScore);

  console.log('=== スコア比較結果（高い順） ===');
  results.forEach((item, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';

    console.log(`${medal} ${rank}位: ${item.name} - ${item.result.totalScore}点`);
    console.log(`    分類: ${getClassificationDisplayName(item.result.classification)}`);
    console.log(`    評価: ${getEvaluationDisplayName(item.result.evaluationLevel)}`);

    // 各カテゴリでの強みを表示
    const topCategory = item.result.categoryScores
      .sort((a, b) => b.normalizedScore - a.normalizedScore)[0];
    console.log(`    最高カテゴリ: ${getCategoryDisplayName(topCategory.category)} (${topCategory.normalizedScore}点)`);
    console.log();
  });
}

/**
 * ディスプレイ名を取得するヘルパー関数
 */
function getCategoryDisplayName(category: ScoreCategory): string {
  const displayNames = {
    [ScoreCategory.YOUIN]: '陰陽パターン',
    [ScoreCategory.GOGYOU]: '五行関係',
    [ScoreCategory.KAKUSU]: '画数メッセージ',
    [ScoreCategory.TENCHI]: '天地特殊',
    [ScoreCategory.YOMIKUDASHI]: '読み下し'
  };
  return displayNames[category];
}

function getClassificationDisplayName(classification: NameClassification): string {
  const displayNames = {
    [NameClassification.EXCELLENT_NAME]: '優秀名',
    [NameClassification.GOOD_NAME]: '正名',
    [NameClassification.AVERAGE_NAME]: '普通名',
    [NameClassification.PROBLEMATIC_NAME]: '問題名'
  };
  return displayNames[classification];
}

function getEvaluationDisplayName(evaluation: OverallEvaluationLevel): string {
  const displayNames = {
    [OverallEvaluationLevel.EXCELLENT]: '秀',
    [OverallEvaluationLevel.VERY_GOOD]: '優',
    [OverallEvaluationLevel.GOOD]: '良',
    [OverallEvaluationLevel.FAIR]: '可',
    [OverallEvaluationLevel.POOR]: '不可',
    [OverallEvaluationLevel.VERY_POOR]: '劣'
  };
  return displayNames[evaluation];
}

/**
 * メイン実行関数
 */
function main() {
  try {
    basicUsageExample();
    console.log('\n'.repeat(3));

    customConfigExample();
    console.log('\n'.repeat(3));

    comparisonExample();
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行例（このファイルが直接実行された場合）
if (require.main === module) {
  main();
}

export {
  basicUsageExample,
  customConfigExample,
  comparisonExample,
  getCategoryDisplayName,
  getClassificationDisplayName,
  getEvaluationDisplayName
};