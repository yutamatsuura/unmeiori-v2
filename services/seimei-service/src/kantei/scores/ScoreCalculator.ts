/**
 * 姓名判断 高度スコア計算システム
 *
 * 全機能を統合した総合スコア計算システム
 * - 計算開始得点: 50点
 * - カテゴリ別重み付け: 陰陽20%, 五行25%, 画数30%, 天地15%, 読み下し10%
 * - 最高/最低得点制御: 5-100点
 * - 正名/凶名境界点: 70点
 */

import {
  ScoreCalculatorInput,
  ScoreCalculatorResult,
  ScoreCalculatorConfig,
  CategoryScore,
  ScoreCategory,
  OverallEvaluationLevel,
  NameClassification,
  JudgmentResults,
  DEFAULT_CONFIG,
  CategoryWeights,
  NormalizationOptions
} from './types';

import YouinKantei from '../youins/YouinKantei';
import { GogyouKantei } from '../gogyous/GogyouKantei';
import { YomikudashiKantei } from '../yomikudashis/YomikudashiKantei';
import { TenchiKantei } from '../tenchis/TenchiKantei';
import { getKakusuMessage } from '../../data/kakusu-messages';
import Seimei from '../../seimeis/units/Seimei';
import Chara from '../../seimeis/units/Chara';
import Gogyou from '../../seimeis/units/Gogyou';
import YouIn from '../../seimeis/units/YouIn';

export class ScoreCalculator {
  private config: ScoreCalculatorConfig;
  private startTime: Date;
  private logMessages: string[] = [];

  constructor(config?: Partial<ScoreCalculatorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = new Date();
    this.log('ScoreCalculator initialized');
  }

  /**
   * 統合スコア計算を実行（静的メソッド）
   */
  public static calculate(
    input: ScoreCalculatorInput,
    config?: Partial<ScoreCalculatorConfig>
  ): ScoreCalculatorResult {
    const calculator = new ScoreCalculator(config);
    return calculator.performCalculation(input);
  }

  /**
   * 統合スコア計算を実行（インスタンスメソッド）
   */
  public calculate(input: ScoreCalculatorInput): ScoreCalculatorResult {
    return this.performCalculation(input);
  }

  /**
   * 詳細計算を実行
   */
  private performCalculation(input: ScoreCalculatorInput): ScoreCalculatorResult {
    this.log(`Starting calculation for: ${this.getFullName(input)}`);

    try {
      // 1. 各判定システムを実行
      const judgmentResults = this.executeAllJudgments(input);

      // 2. カテゴリ別スコア計算
      const categoryScores = this.calculateCategoryScores(input, judgmentResults);

      // 3. 総合スコア算出
      const totalScore = this.calculateTotalScore(categoryScores);

      // 4. 評価レベルと分類を決定
      const evaluationLevel = this.determineEvaluationLevel(totalScore);
      const classification = this.determineNameClassification(totalScore);

      // 5. 総合評価を生成
      const overallAssessment = this.generateOverallAssessment(categoryScores, totalScore);

      // 6. 特別判定を実行
      const specialJudgments = this.performSpecialJudgments(totalScore, categoryScores);

      // 7. 詳細レポートを生成
      const detailedReport = this.generateDetailedReport(
        input,
        categoryScores,
        totalScore,
        overallAssessment
      );

      // 8. 結果を構築
      const result: ScoreCalculatorResult = {
        fullName: this.getFullName(input),
        totalScore,
        classification,
        evaluationLevel,
        categoryScores,
        overallAssessment,
        specialJudgments,
        detailedReport,
        calculationMetadata: {
          timestamp: this.startTime,
          version: '1.0.0',
          weights: this.config.weights,
          processingTimeMs: Date.now() - this.startTime.getTime()
        }
      };

      this.log(`Calculation completed. Total score: ${totalScore}`);
      return result;

    } catch (error) {
      this.log(`Error during calculation: ${error}`);
      throw new Error(`スコア計算中にエラーが発生しました: ${error}`);
    }
  }

  /**
   * 全ての判定システムを実行
   */
  private executeAllJudgments(input: ScoreCalculatorInput): JudgmentResults {
    this.log('Executing all judgment systems');

    // Seimeiオブジェクトを構築
    const seimei = this.buildSeimeiObject(input);

    const results: JudgmentResults = {};

    try {
      // 陰陽判定
      const youinKantei = new YouinKantei(seimei);
      results.youinResult = youinKantei.kantei();
      this.log('Youin judgment completed');

      // 五行判定
      const gogyouInput = {
        seiCharacters: input.seiCharacters,
        meiCharacters: input.meiCharacters
      };
      results.gogyouResult = GogyouKantei.performKantei(gogyouInput);
      this.log('Gogyou judgment completed');

      // 読み下し判定
      const yomikudashiInput = {
        seiCharacters: input.seiCharacters,
        meiCharacters: input.meiCharacters
      };
      results.yomikudashiResult = YomikudashiKantei.performKantei(yomikudashiInput);
      this.log('Yomikudashi judgment completed');

      // 天地特殊判定
      results.tenchiResult = TenchiKantei.judgeByKakusu(input.tenkakuKakusu, input.chikakuKakusu);
      this.log('Tenchi judgment completed');

      // 画数メッセージ取得
      results.kakusuMessages = {
        tenkaku: getKakusuMessage(input.tenkakuKakusu),
        jinkaku: getKakusuMessage(input.jinkakuKakusu),
        chikaku: getKakusuMessage(input.chikakuKakusu),
        sougaku: getKakusuMessage(input.sougakuKakusu),
        gaikaku: input.gaikakuKakusu ? getKakusuMessage(input.gaikakuKakusu) : undefined
      };
      this.log('Kakusu messages retrieved');

    } catch (error) {
      this.log(`Error in judgment execution: ${error}`);
      throw error;
    }

    return results;
  }

  /**
   * カテゴリ別スコア計算
   */
  private calculateCategoryScores(
    input: ScoreCalculatorInput,
    judgmentResults: JudgmentResults
  ): CategoryScore[] {
    this.log('Calculating category scores');

    const scores: CategoryScore[] = [];

    // 陰陽パターンスコア
    if (judgmentResults.youinResult) {
      scores.push(this.calculateYouinScore(judgmentResults.youinResult));
    }

    // 五行関係スコア
    if (judgmentResults.gogyouResult) {
      scores.push(this.calculateGogyouScore(judgmentResults.gogyouResult));
    }

    // 画数メッセージスコア
    if (judgmentResults.kakusuMessages) {
      scores.push(this.calculateKakusuScore(judgmentResults.kakusuMessages));
    }

    // 天地特殊スコア
    if (judgmentResults.tenchiResult) {
      scores.push(this.calculateTenchiScore(judgmentResults.tenchiResult));
    }

    // 読み下しスコア
    if (judgmentResults.yomikudashiResult) {
      scores.push(this.calculateYomikudashiScore(judgmentResults.yomikudashiResult));
    }

    return scores;
  }

  /**
   * 陰陽パターンスコア計算
   */
  private calculateYouinScore(result: any): CategoryScore {
    const rawScore = result.overall_score || 50;
    const normalizedScore = this.normalizeScore(rawScore);
    const weight = this.config.weights[ScoreCategory.YOUIN];
    const weightedScore = normalizedScore * weight;

    const issues: string[] = [];
    const strengths: string[] = [];

    result.patterns?.forEach((pattern: any) => {
      if (pattern.detected) {
        if (pattern.score < 50) {
          issues.push(`${pattern.name}パターンが検出されました`);
        } else {
          strengths.push(`${pattern.name}パターンが良好です`);
        }
      }
    });

    return {
      category: ScoreCategory.YOUIN,
      rawScore,
      normalizedScore,
      weight,
      weightedScore,
      details: `陰陽バランス: ${result.youin_sequence} (${normalizedScore}点)`,
      issues,
      strengths
    };
  }

  /**
   * 五行関係スコア計算
   */
  private calculateGogyouScore(result: any): CategoryScore {
    const rawScore = result.totalScore || 50;
    const normalizedScore = this.normalizeScore(rawScore);
    const weight = this.config.weights[ScoreCategory.GOGYOU];
    const weightedScore = normalizedScore * weight;

    const issues: string[] = [];
    const strengths: string[] = [];

    if (result.jinkakuChikakuRelation?.score < 70) {
      issues.push('人格と地格の関係に注意が必要です');
    } else {
      strengths.push('人格と地格の関係が良好です');
    }

    if (result.internalBalance?.balanceScore >= 80) {
      strengths.push('内的五行バランスが優秀です');
    } else if (result.internalBalance?.balanceScore < 60) {
      issues.push('五行バランスの偏りがあります');
    }

    return {
      category: ScoreCategory.GOGYOU,
      rawScore,
      normalizedScore,
      weight,
      weightedScore,
      details: `五行関係: ${result.jinkaku?.gogyou}-${result.chikaku?.gogyou} (${normalizedScore}点)`,
      issues,
      strengths
    };
  }

  /**
   * 画数メッセージスコア計算
   */
  private calculateKakusuScore(kakusuMessages: any): CategoryScore {
    const messages = [
      kakusuMessages.tenkaku,
      kakusuMessages.jinkaku,
      kakusuMessages.chikaku,
      kakusuMessages.sougaku,
      kakusuMessages.gaikaku
    ].filter(Boolean);

    // 吉凶による基本スコア計算
    let totalFortuneScore = 0;
    let messageCount = 0;
    const issues: string[] = [];
    const strengths: string[] = [];

    messages.forEach((msg: any) => {
      if (msg) {
        messageCount++;
        let score = 50; // 基準点

        switch (msg.fortune) {
          case '大吉': score = 95; strengths.push(`${msg.number}画(大吉)`); break;
          case '吉': score = 80; strengths.push(`${msg.number}画(吉)`); break;
          case '半吉': score = 65; break;
          case '凶': score = 30; issues.push(`${msg.number}画(凶)`); break;
          case '大凶': score = 15; issues.push(`${msg.number}画(大凶)`); break;
        }
        totalFortuneScore += score;
      }
    });

    const rawScore = messageCount > 0 ? Math.round(totalFortuneScore / messageCount) : 50;
    const normalizedScore = this.normalizeScore(rawScore);
    const weight = this.config.weights[ScoreCategory.KAKUSU];
    const weightedScore = normalizedScore * weight;

    return {
      category: ScoreCategory.KAKUSU,
      rawScore,
      normalizedScore,
      weight,
      weightedScore,
      details: `画数吉凶: ${messageCount}画数の平均評価 (${normalizedScore}点)`,
      issues,
      strengths
    };
  }

  /**
   * 天地特殊スコア計算
   */
  private calculateTenchiScore(result: any): CategoryScore {
    const rawScore = result.totalScore || 50;
    const normalizedScore = this.normalizeScore(rawScore);
    const weight = this.config.weights[ScoreCategory.TENCHI];
    const weightedScore = normalizedScore * weight;

    const issues: string[] = [];
    const strengths: string[] = [];

    if (result.applicableResults?.length > 0) {
      result.applicableResults.forEach((judgment: any) => {
        if (judgment.score >= 70) {
          strengths.push(`${judgment.type}が良好です`);
        } else {
          issues.push(`${judgment.type}に注意が必要です`);
        }
      });
    }

    return {
      category: ScoreCategory.TENCHI,
      rawScore,
      normalizedScore,
      weight,
      weightedScore,
      details: `天地特殊: ${result.applicableResults?.length || 0}件の判定 (${normalizedScore}点)`,
      issues,
      strengths
    };
  }

  /**
   * 読み下しスコア計算
   */
  private calculateYomikudashiScore(result: any): CategoryScore {
    const rawScore = result.totalScore || 50;
    const normalizedScore = this.normalizeScore(rawScore);
    const weight = this.config.weights[ScoreCategory.YOMIKUDASHI];
    const weightedScore = normalizedScore * weight;

    const issues: string[] = [];
    const strengths: string[] = [];

    if (result.hasIssue) {
      result.issues?.forEach((issue: any) => {
        if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH') {
          issues.push(`${issue.type}: ${issue.problematicCharacters.join('、')}`);
        }
      });
    } else {
      strengths.push('読み下し判定で問題は検出されませんでした');
    }

    return {
      category: ScoreCategory.YOMIKUDASHI,
      rawScore,
      normalizedScore,
      weight,
      weightedScore,
      details: `読み下し: ${result.issues?.length || 0}件の問題 (${normalizedScore}点)`,
      issues,
      strengths
    };
  }

  /**
   * 総合スコア算出
   */
  private calculateTotalScore(categoryScores: CategoryScore[]): number {
    const baseScore = this.config.normalization.baseScore;
    let weightedSum = 0;
    let totalWeight = 0;

    categoryScores.forEach(score => {
      weightedSum += score.weightedScore;
      totalWeight += score.weight;
    });

    // 重み付け合計を100点満点に正規化
    const weightedAverage = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : baseScore;

    // 最終スコアを制御範囲内に収める
    return this.constrainScore(Math.round(weightedAverage));
  }

  /**
   * スコアを正規化（0-100に収める）
   */
  private normalizeScore(score: number): number {
    const { minScore, maxScore } = this.config.normalization;
    return Math.max(minScore, Math.min(maxScore, score));
  }

  /**
   * スコアを制御範囲内に制限
   */
  private constrainScore(score: number): number {
    const { minScore, maxScore } = this.config.normalization;
    return Math.max(minScore, Math.min(maxScore, score));
  }

  /**
   * 評価レベルを決定
   */
  private determineEvaluationLevel(score: number): OverallEvaluationLevel {
    if (score >= 90) return OverallEvaluationLevel.EXCELLENT;
    if (score >= 80) return OverallEvaluationLevel.VERY_GOOD;
    if (score >= 70) return OverallEvaluationLevel.GOOD;
    if (score >= 60) return OverallEvaluationLevel.FAIR;
    if (score >= 50) return OverallEvaluationLevel.POOR;
    return OverallEvaluationLevel.VERY_POOR;
  }

  /**
   * 名前の分類を決定
   */
  private determineNameClassification(score: number): NameClassification {
    if (score >= 90) return NameClassification.EXCELLENT_NAME;
    if (score >= 70) return NameClassification.GOOD_NAME;
    if (score >= 50) return NameClassification.AVERAGE_NAME;
    return NameClassification.PROBLEMATIC_NAME;
  }

  /**
   * 総合評価を生成
   */
  private generateOverallAssessment(categoryScores: CategoryScore[], totalScore: number) {
    const allStrengths = categoryScores.flatMap(score => score.strengths || []);
    const allWeaknesses = categoryScores.flatMap(score => score.issues || []);

    let summary = '';
    if (totalScore >= 90) {
      summary = '非常に優秀な名前です。全ての要素がバランス良く整っており、人生において大きな力となるでしょう。';
    } else if (totalScore >= 70) {
      summary = '良い名前です。姓名判断の観点から見て正名と判定されます。';
    } else if (totalScore >= 50) {
      summary = '普通の名前です。特に大きな問題はありませんが、改善の余地があります。';
    } else {
      summary = '改善が必要な名前です。いくつかの要素で問題が見られるため、検討が必要です。';
    }

    const recommendations: string[] = [];
    if (allWeaknesses.length > 0) {
      recommendations.push('検出された問題点の改善を検討してください');
    }
    if (totalScore < 70) {
      recommendations.push('より良い運勢のために、名前の変更を検討することをお勧めします');
    }
    if (allStrengths.length > 0) {
      recommendations.push('良好な要素を活かし、さらなる発展を目指しましょう');
    }

    return {
      summary,
      strengths: allStrengths,
      weaknesses: allWeaknesses,
      recommendations
    };
  }

  /**
   * 特別判定を実行
   */
  private performSpecialJudgments(totalScore: number, categoryScores: CategoryScore[]) {
    return {
      isPerfectScore: totalScore === 100,
      isExcellentName: totalScore >= 90,
      isGoodName: totalScore >= 70,
      hasRecommendedChanges: totalScore < 70
    };
  }

  /**
   * 詳細レポートを生成
   */
  private generateDetailedReport(
    input: ScoreCalculatorInput,
    categoryScores: CategoryScore[],
    totalScore: number,
    overallAssessment: any
  ) {
    const executiveSummary = `
【総合評価】
お名前「${this.getFullName(input)}」の姓名判断総合スコア: ${totalScore}点

${overallAssessment.summary}
    `.trim();

    const categoryAnalysis = categoryScores.map(score => `
【${this.getCategoryDisplayName(score.category)}】(重み: ${Math.round(score.weight * 100)}%)
・スコア: ${score.normalizedScore}点
・詳細: ${score.details}
${score.strengths?.length ? '・良い点: ' + score.strengths.join(', ') : ''}
${score.issues?.length ? '・注意点: ' + score.issues.join(', ') : ''}
    `).join('\n');

    const overallAdvice = totalScore >= 70
      ? 'このお名前は姓名判断の観点から良好です。持ち前の良い要素を活かして人生を歩んでください。'
      : '改善できる要素があります。より良い運勢のために、専門家との相談をお勧めします。';

    const technicalDetails = `
【技術的詳細】
・使用した重み付け: ${JSON.stringify(this.config.weights, null, 2)}
・正規化設定: 最小${this.config.normalization.minScore}点 - 最大${this.config.normalization.maxScore}点
・計算時刻: ${this.startTime.toISOString()}
・処理時間: ${Date.now() - this.startTime.getTime()}ms
    `.trim();

    return {
      executiveSummary,
      categoryAnalysis,
      overallAdvice,
      technicalDetails
    };
  }

  /**
   * ユーティリティメソッド
   */
  private getFullName(input: ScoreCalculatorInput): string {
    const sei = input.seiCharacters.map(c => c.char).join('');
    const mei = input.meiCharacters.map(c => c.char).join('');
    return `${sei} ${mei}`;
  }

  private getCategoryDisplayName(category: ScoreCategory): string {
    const displayNames = {
      [ScoreCategory.YOUIN]: '陰陽パターン',
      [ScoreCategory.GOGYOU]: '五行関係',
      [ScoreCategory.KAKUSU]: '画数メッセージ',
      [ScoreCategory.TENCHI]: '天地特殊',
      [ScoreCategory.YOMIKUDASHI]: '読み下し'
    };
    return displayNames[category];
  }

  private buildSeimeiObject(input: ScoreCalculatorInput): Seimei {
    // Seimeiオブジェクトを構築
    const seiCharas = input.seiCharacters.map(char => {
      const gogyou = this.getGogyouFromStrokeCount(char.strokeCount);
      const youin = YouIn.of(char.strokeCount);
      return new Chara(char.char, '', char.strokeCount, gogyou, youin, false);
    });

    const meiCharas = input.meiCharacters.map(char => {
      const gogyou = this.getGogyouFromStrokeCount(char.strokeCount);
      const youin = YouIn.of(char.strokeCount);
      return new Chara(char.char, '', char.strokeCount, gogyou, youin, false);
    });

    return new Seimei(seiCharas, meiCharas, []);
  }

  private getGogyouFromStrokeCount(strokeCount: number): Gogyou {
    // 画数から五行を取得（既存のロジックを使用）
    return Gogyou.of(strokeCount);
  }

  private log(message: string): void {
    if (this.config.enableDetailedLogging) {
      this.logMessages.push(`${new Date().toISOString()}: ${message}`);
    }
  }

  /**
   * ログメッセージを取得
   */
  public getLogMessages(): string[] {
    return [...this.logMessages];
  }
}