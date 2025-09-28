/**
 * 読み下し判定システム 使用例
 */

import { YomikudashiKantei, YomikudashiType } from './index';
import type { YomikudashiInput } from './types';

/**
 * 基本的な使用例
 */
export function basicUsageExample() {
  const input: YomikudashiInput = {
    seiCharacters: [
      { char: '田', strokeCount: 5 },
      { char: '中', strokeCount: 4 }
    ],
    meiCharacters: [
      { char: '一', strokeCount: 1 },
      { char: '郎', strokeCount: 9 }
    ],
    gender: 'male'
  };

  console.log('=== 読み下し判定システム 使用例 ===');
  console.log(`対象名前: ${input.seiCharacters.map(c => c.char).join('')}${input.meiCharacters.map(c => c.char).join('')}`);
  console.log('');

  const result = YomikudashiKantei.performKantei(input);

  console.log('【判定結果】');
  console.log(`問題の有無: ${result.hasIssue ? 'あり' : 'なし'}`);
  console.log(`総合スコア: ${result.totalScore}点`);
  console.log(`総合評価: ${result.overallEvaluation}`);
  console.log('');

  if (result.hasIssue) {
    console.log('【検出された問題】');
    result.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${getJapaneseTypeName(issue.type)}`);
      console.log(`   重要度: ${getSeverityInJapanese(issue.severity)}`);
      console.log(`   該当文字: ${issue.problematicCharacters.join('、')}`);
      console.log(`   減点: ${issue.penaltyScore}点`);
      console.log(`   説明: ${issue.description}`);
      console.log(`   改善提案: ${issue.suggestion}`);
      console.log('');
    });
  }

  console.log('【要約】');
  console.log(result.summary);
  console.log('');

  console.log('【全体的なアドバイス】');
  console.log(result.generalAdvice);
  console.log('');

  return result;
}

/**
 * 設定をカスタマイズした使用例
 */
export function customConfigExample() {
  const input: YomikudashiInput = {
    seiCharacters: [
      { char: '山', strokeCount: 3 },
      { char: '田', strokeCount: 5 }
    ],
    meiCharacters: [
      { char: '虎', strokeCount: 8 },
      { char: '太', strokeCount: 4 }
    ]
  };

  // 重要な判定のみに絞る設定
  const config = {
    enabledTypes: [
      YomikudashiType.BUNRI_NAME,
      YomikudashiType.SINGLE_CHARACTER,
      YomikudashiType.CHIKAKU_9_19,
      YomikudashiType.JINKAKU_9_19,
      YomikudashiType.VULGAR_CHARACTER,
      YomikudashiType.CONTEMPTUOUS
    ],
    minimumScoreThreshold: 60,
    generateDetailedReport: true
  };

  console.log('=== カスタム設定での判定例 ===');
  console.log('重要な判定のみを実行');
  console.log('');

  const result = YomikudashiKantei.performKantei(input, config);

  console.log(`総合スコア: ${result.totalScore}点`);
  console.log(`検出された問題数: ${result.issues.length}件`);
  console.log('');

  return result;
}

/**
 * 複数の問題を持つ名前の判定例
 */
export function multipleIssuesExample() {
  const input: YomikudashiInput = {
    seiCharacters: [
      { char: '一', strokeCount: 1 } // 分離系文字
    ],
    meiCharacters: [
      { char: '王', strokeCount: 4 } // 一文字名 + 尊貴すぎる字
    ]
  };

  console.log('=== 複数問題のある名前の判定例 ===');
  console.log('');

  const result = YomikudashiKantei.performKantei(input);

  console.log(`検出された問題: ${result.issues.length}件`);
  console.log(`最終スコア: ${result.totalScore}点`);
  console.log(`評価: ${result.overallEvaluation}`);
  console.log('');

  // 重要度別に問題を分類
  const criticalIssues = result.issues.filter(i => i.severity === 'critical');
  const highIssues = result.issues.filter(i => i.severity === 'high');
  const mediumIssues = result.issues.filter(i => i.severity === 'medium');
  const lowIssues = result.issues.filter(i => i.severity === 'low');

  if (criticalIssues.length > 0) {
    console.log(`重大な問題: ${criticalIssues.length}件`);
  }
  if (highIssues.length > 0) {
    console.log(`重要な問題: ${highIssues.length}件`);
  }
  if (mediumIssues.length > 0) {
    console.log(`中程度の問題: ${mediumIssues.length}件`);
  }
  if (lowIssues.length > 0) {
    console.log(`軽微な問題: ${lowIssues.length}件`);
  }

  return result;
}

/**
 * 判定タイプの日本語名を取得
 */
function getJapaneseTypeName(type: YomikudashiType): string {
  const typeNames: Record<YomikudashiType, string> = {
    [YomikudashiType.BUNRI_NAME]: '分離名判定',
    [YomikudashiType.SINGLE_CHARACTER]: '一文字名判定',
    [YomikudashiType.CHIKAKU_9_19]: '地格9画・19画判定',
    [YomikudashiType.JINKAKU_9_19]: '人格9画・19画判定',
    [YomikudashiType.ANIMAL_CHARACTER]: '動物の字判定',
    [YomikudashiType.FISH_CHARACTER]: '魚の字判定',
    [YomikudashiType.PLANT_CHARACTER]: '植物の字判定',
    [YomikudashiType.MINERAL_CHARACTER]: '鉱物の字判定',
    [YomikudashiType.TENYUU_CHARACTER]: '天佑の字判定',
    [YomikudashiType.OVERLY_HAPPY]: '幸福すぎる字判定',
    [YomikudashiType.OVERLY_NOBLE]: '尊貴すぎる字判定',
    [YomikudashiType.VULGAR_CHARACTER]: '品格を損なう字判定',
    [YomikudashiType.JIKKAN_JUNISHI]: '十干十二支の字判定',
    [YomikudashiType.CONTEMPTUOUS]: '軽蔑の字判定',
    [YomikudashiType.WEATHER_CHARACTER]: '気候の字判定',
    [YomikudashiType.GENDER_NEUTRAL]: '性別不明の字判定'
  };

  return typeNames[type] || type;
}

/**
 * 重要度の日本語表現を取得
 */
function getSeverityInJapanese(severity: string): string {
  switch (severity) {
    case 'critical':
      return '重大';
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return severity;
  }
}

/**
 * メイン実行関数（テスト用）
 */
export function runAllExamples() {
  console.log('読み下し判定システム 全使用例実行');
  console.log('=====================================');
  console.log('');

  console.log('1. 基本的な使用例');
  console.log('-------------------');
  basicUsageExample();

  console.log('2. カスタム設定例');
  console.log('-------------------');
  customConfigExample();

  console.log('3. 複数問題の判定例');
  console.log('---------------------');
  multipleIssuesExample();

  console.log('全ての使用例が完了しました。');
}

// 直接実行時の処理
if (require.main === module) {
  runAllExamples();
}