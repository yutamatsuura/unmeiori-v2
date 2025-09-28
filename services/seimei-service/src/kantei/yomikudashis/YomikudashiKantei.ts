/**
 * 読み下し判定システム
 *
 * 16種類の読み下し判定を実行し、姓名の問題点を詳細に分析
 * 各判定の重要度に応じてスコアを算出し、改善提案を生成
 */

import {
  YomikudashiType,
  SeverityLevel,
  YOMIKUDASHI_SEVERITY,
  CHARACTER_SETS,
  BUNRI_CHARACTERS
} from './special-characters';

import {
  YomikudashiInput,
  YomikudashiResult,
  YomikudashiIssue,
  YomikudashiCheckResult,
  StrokeCountCheckResult,
  YomikudashiConfig
} from './types';

export class YomikudashiKantei {
  private config: YomikudashiConfig;

  constructor(config?: Partial<YomikudashiConfig>) {
    this.config = {
      enabledTypes: Object.values(YomikudashiType),
      minimumScoreThreshold: 50,
      generateDetailedReport: true,
      ...config
    };
  }

  /**
   * 読み下し判定を実行
   */
  public static performKantei(
    input: YomikudashiInput,
    config?: Partial<YomikudashiConfig>
  ): YomikudashiResult {
    const kantei = new YomikudashiKantei(config);
    return kantei.analyze(input);
  }

  /**
   * 詳細分析を実行
   */
  private analyze(input: YomikudashiInput): YomikudashiResult {
    const issues: YomikudashiIssue[] = [];

    // 1. 分離名判定
    if (this.isEnabled(YomikudashiType.BUNRI_NAME)) {
      const result = this.checkBunriName(input);
      if (result.isApplicable) {
        issues.push(this.createIssue(YomikudashiType.BUNRI_NAME, result.applicableCharacters, result.details));
      }
    }

    // 2. 一文字名判定
    if (this.isEnabled(YomikudashiType.SINGLE_CHARACTER)) {
      const result = this.checkSingleCharacterName(input);
      if (result.isApplicable) {
        issues.push(this.createIssue(YomikudashiType.SINGLE_CHARACTER, result.applicableCharacters, result.details));
      }
    }

    // 3. 地格9画・19画判定
    if (this.isEnabled(YomikudashiType.CHIKAKU_9_19)) {
      const result = this.checkChikakuSpecialStrokes(input);
      if (result.isApplicable) {
        issues.push(this.createStrokeIssue(YomikudashiType.CHIKAKU_9_19, result));
      }
    }

    // 4. 人格9画・19画判定
    if (this.isEnabled(YomikudashiType.JINKAKU_9_19)) {
      const result = this.checkJinkakuSpecialStrokes(input);
      if (result.isApplicable) {
        issues.push(this.createStrokeIssue(YomikudashiType.JINKAKU_9_19, result));
      }
    }

    // 5-16. 文字種別判定
    const characterTypeChecks = [
      YomikudashiType.ANIMAL_CHARACTER,
      YomikudashiType.FISH_CHARACTER,
      YomikudashiType.PLANT_CHARACTER,
      YomikudashiType.MINERAL_CHARACTER,
      YomikudashiType.TENYUU_CHARACTER,
      YomikudashiType.OVERLY_HAPPY,
      YomikudashiType.OVERLY_NOBLE,
      YomikudashiType.VULGAR_CHARACTER,
      YomikudashiType.JIKKAN_JUNISHI,
      YomikudashiType.CONTEMPTUOUS,
      YomikudashiType.WEATHER_CHARACTER,
      YomikudashiType.GENDER_NEUTRAL
    ];

    for (const type of characterTypeChecks) {
      if (this.isEnabled(type)) {
        const result = this.checkCharacterType(input, type);
        if (result.isApplicable) {
          issues.push(this.createIssue(type, result.applicableCharacters, result.details));
        }
      }
    }

    // 総合評価を算出
    const totalScore = this.calculateTotalScore(issues);
    const overallEvaluation = this.getOverallEvaluation(totalScore);
    const summary = this.generateSummary(issues, totalScore);
    const generalAdvice = this.generateGeneralAdvice(issues, overallEvaluation);

    return {
      hasIssue: issues.length > 0,
      issues,
      totalScore,
      overallEvaluation,
      summary,
      generalAdvice
    };
  }

  /**
   * 判定タイプが有効かどうかチェック
   */
  private isEnabled(type: YomikudashiType): boolean {
    return this.config.enabledTypes.includes(type);
  }

  /**
   * 分離名判定（全文字が分離系文字）
   */
  private checkBunriName(input: YomikudashiInput): YomikudashiCheckResult {
    const allCharacters = [
      ...input.seiCharacters.map(c => c.char),
      ...input.meiCharacters.map(c => c.char)
    ];

    const bunriChars = allCharacters.filter(char => BUNRI_CHARACTERS.includes(char));
    const isAllBunri = bunriChars.length === allCharacters.length;

    return {
      isApplicable: isAllBunri,
      applicableCharacters: isAllBunri ? bunriChars : [],
      details: isAllBunri
        ? `全ての文字（${allCharacters.join('、')}）が分離系文字です。運勢が分散しやすく、安定性に欠ける可能性があります。`
        : ''
    };
  }

  /**
   * 一文字名判定
   */
  private checkSingleCharacterName(input: YomikudashiInput): YomikudashiCheckResult {
    const isSingleChar = input.meiCharacters.length === 1;
    const nameChar = isSingleChar ? input.meiCharacters[0].char : '';

    return {
      isApplicable: isSingleChar,
      applicableCharacters: isSingleChar ? [nameChar] : [],
      details: isSingleChar
        ? `名前が一文字（${nameChar}）です。運勢の基盤が薄く、人生で波乱が多い可能性があります。`
        : ''
    };
  }

  /**
   * 地格9画・19画判定
   */
  private checkChikakuSpecialStrokes(input: YomikudashiInput): StrokeCountCheckResult {
    const strokeCount = input.meiCharacters.reduce((sum, char) => sum + char.strokeCount, 0);
    const isSpecial = strokeCount === 9 || strokeCount === 19;

    return {
      isApplicable: isSpecial,
      strokeCount,
      kakuType: 'chikaku',
      details: isSpecial
        ? `地格が${strokeCount}画です。${strokeCount}画は運勢に波乱をもたらす可能性があります。`
        : ''
    };
  }

  /**
   * 人格9画・19画判定
   */
  private checkJinkakuSpecialStrokes(input: YomikudashiInput): StrokeCountCheckResult {
    if (input.seiCharacters.length === 0 || input.meiCharacters.length === 0) {
      return { isApplicable: false, strokeCount: 0, kakuType: 'jinkaku', details: '' };
    }

    const seiLastChar = input.seiCharacters[input.seiCharacters.length - 1];
    const meiFirstChar = input.meiCharacters[0];
    const strokeCount = seiLastChar.strokeCount + meiFirstChar.strokeCount;
    const isSpecial = strokeCount === 9 || strokeCount === 19;

    return {
      isApplicable: isSpecial,
      strokeCount,
      kakuType: 'jinkaku',
      details: isSpecial
        ? `人格（${seiLastChar.char}${meiFirstChar.char}）が${strokeCount}画です。${strokeCount}画は人間関係で困難を経験する可能性があります。`
        : ''
    };
  }

  /**
   * 文字種別判定
   */
  private checkCharacterType(input: YomikudashiInput, type: YomikudashiType): YomikudashiCheckResult {
    const allCharacters = [
      ...input.seiCharacters.map(c => c.char),
      ...input.meiCharacters.map(c => c.char)
    ];

    const targetChars = CHARACTER_SETS[type];
    const foundChars = allCharacters.filter(char => targetChars.includes(char));

    if (foundChars.length === 0) {
      return { isApplicable: false, applicableCharacters: [], details: '' };
    }

    const description = this.getTypeDescription(type, foundChars);

    return {
      isApplicable: true,
      applicableCharacters: foundChars,
      details: description
    };
  }

  /**
   * 判定タイプごとの説明を生成
   */
  private getTypeDescription(type: YomikudashiType, chars: string[]): string {
    const charList = chars.join('、');

    switch (type) {
      case YomikudashiType.ANIMAL_CHARACTER:
        return `動物を表す文字（${charList}）が含まれています。本能的で野性的な面が強調される可能性があります。`;
      case YomikudashiType.FISH_CHARACTER:
        return `魚を表す文字（${charList}）が含まれています。流動性が高く、環境に左右されやすい傾向があります。`;
      case YomikudashiType.PLANT_CHARACTER:
        return `植物を表す文字（${charList}）が含まれています。穏やかで成長志向ですが、環境への依存性があります。`;
      case YomikudashiType.MINERAL_CHARACTER:
        return `鉱物を表す文字（${charList}）が含まれています。堅実ですが、冷たい印象を与える場合があります。`;
      case YomikudashiType.TENYUU_CHARACTER:
        return `天佑を表す文字（${charList}）が含まれています。理想的すぎて現実離れした印象を与える可能性があります。`;
      case YomikudashiType.OVERLY_HAPPY:
        return `幸福を強調する文字（${charList}）が含まれています。過度に楽観的で深みに欠ける印象を与える場合があります。`;
      case YomikudashiType.OVERLY_NOBLE:
        return `尊貴すぎる文字（${charList}）が含まれています。高慢な印象を与え、人間関係で摩擦が生じる可能性があります。`;
      case YomikudashiType.VULGAR_CHARACTER:
        return `品格を損なう文字（${charList}）が含まれています。上品さに欠け、社会的地位に影響する場合があります。`;
      case YomikudashiType.JIKKAN_JUNISHI:
        return `十干十二支の文字（${charList}）が含まれています。伝統的すぎて現代的な印象に欠ける可能性があります。`;
      case YomikudashiType.CONTEMPTUOUS:
        return `軽蔑的な意味の文字（${charList}）が含まれています。ネガティブな印象を与える危険性があります。`;
      case YomikudashiType.WEATHER_CHARACTER:
        return `気候を表す文字（${charList}）が含まれています。変化しやすく、情緒不安定な印象を与える場合があります。`;
      case YomikudashiType.GENDER_NEUTRAL:
        return `性別が曖昧な文字（${charList}）が含まれています。性別の判別が困難な場合があります。`;
      default:
        return `特殊な文字（${charList}）が含まれています。`;
    }
  }

  /**
   * 問題を作成
   */
  private createIssue(type: YomikudashiType, chars: string[], details: string): YomikudashiIssue {
    const severity = YOMIKUDASHI_SEVERITY[type];
    const penaltyScore = this.calculatePenaltyScore(severity, chars.length);
    const suggestion = this.generateSuggestion(type);

    return {
      type,
      problematicCharacters: chars,
      severity,
      penaltyScore,
      description: details,
      suggestion
    };
  }

  /**
   * 画数関連の問題を作成
   */
  private createStrokeIssue(type: YomikudashiType, result: StrokeCountCheckResult): YomikudashiIssue {
    const severity = YOMIKUDASHI_SEVERITY[type];
    const penaltyScore = this.calculatePenaltyScore(severity, 1);
    const suggestion = this.generateSuggestion(type);

    return {
      type,
      problematicCharacters: [`${result.strokeCount}画`],
      severity,
      penaltyScore,
      description: result.details,
      suggestion
    };
  }

  /**
   * 減点スコアを計算
   */
  private calculatePenaltyScore(severity: SeverityLevel, charCount: number): number {
    let baseScore: number;

    switch (severity) {
      case SeverityLevel.CRITICAL:
        baseScore = 25;
        break;
      case SeverityLevel.HIGH:
        baseScore = 20;
        break;
      case SeverityLevel.MEDIUM:
        baseScore = 15;
        break;
      case SeverityLevel.LOW:
        baseScore = 10;
        break;
      default:
        baseScore = 10;
    }

    // 該当文字数に応じて調整（最大2倍まで）
    const multiplier = Math.min(1 + (charCount - 1) * 0.3, 2);
    return Math.round(baseScore * multiplier);
  }

  /**
   * 改善提案を生成
   */
  private generateSuggestion(type: YomikudashiType): string {
    switch (type) {
      case YomikudashiType.BUNRI_NAME:
        return '分離しにくい文字（口、田、回など）を含む名前を検討することで、運勢の安定性が向上します。';
      case YomikudashiType.SINGLE_CHARACTER:
        return '二文字以上の名前にすることで、運勢の基盤がより安定します。';
      case YomikudashiType.CHIKAKU_9_19:
      case YomikudashiType.JINKAKU_9_19:
        return '画数を調整することで、より安定した運勢を期待できます。';
      case YomikudashiType.ANIMAL_CHARACTER:
        return '動物の字を避け、より穏やかな印象の文字を選ぶことをお勧めします。';
      case YomikudashiType.VULGAR_CHARACTER:
        return '品格のある文字に変更することで、社会的印象が向上します。';
      case YomikudashiType.OVERLY_NOBLE:
        return '謙虚さを表現する文字を選ぶことで、人間関係がより円滑になります。';
      default:
        return '文字の選択を再検討することで、より良い印象を与えることができます。';
    }
  }

  /**
   * 総合スコアを計算
   */
  private calculateTotalScore(issues: YomikudashiIssue[]): number {
    const totalPenalty = issues.reduce((sum, issue) => sum + issue.penaltyScore, 0);
    const score = Math.max(0, 100 - totalPenalty);
    return score;
  }

  /**
   * 総合評価を判定
   */
  private getOverallEvaluation(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= this.config.minimumScoreThreshold) return 'fair';
    return 'poor';
  }

  /**
   * 要約を生成
   */
  private generateSummary(issues: YomikudashiIssue[], score: number): string {
    if (issues.length === 0) {
      return `読み下し判定において問題は検出されませんでした。スコア：${score}点。非常に良好な名前です。`;
    }

    const criticalIssues = issues.filter(i => i.severity === SeverityLevel.CRITICAL);
    const highIssues = issues.filter(i => i.severity === SeverityLevel.HIGH);

    let summary = `読み下し判定で${issues.length}件の問題が検出されました。スコア：${score}点。`;

    if (criticalIssues.length > 0) {
      summary += `重大な問題が${criticalIssues.length}件あります。`;
    }
    if (highIssues.length > 0) {
      summary += `重要な問題が${highIssues.length}件あります。`;
    }

    return summary;
  }

  /**
   * 全体的なアドバイスを生成
   */
  private generateGeneralAdvice(issues: YomikudashiIssue[], evaluation: string): string {
    if (issues.length === 0) {
      return '読み下し判定では問題が見つかりませんでした。現在の名前は良好な運勢を示しています。';
    }

    let advice = '';

    const criticalIssues = issues.filter(i => i.severity === SeverityLevel.CRITICAL);
    if (criticalIssues.length > 0) {
      advice += '重大な問題があります。文字の選択を根本的に見直すことをお勧めします。';
    }

    const highIssues = issues.filter(i => i.severity === SeverityLevel.HIGH);
    if (highIssues.length > 0) {
      advice += '重要な問題があります。該当する文字の変更を検討してください。';
    }

    if (evaluation === 'poor') {
      advice += '総合的に改善の余地が大きいため、専門家との相談をお勧めします。';
    } else if (evaluation === 'fair') {
      advice += '一部改善することで、より良い運勢を期待できます。';
    }

    return advice || '検出された問題を参考に、より良い名前を検討してください。';
  }
}