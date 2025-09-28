/**
 * 読み下し判定結果の型定義
 */

import { YomikudashiType, SeverityLevel } from './special-characters';

/**
 * 個別の読み下し問題
 */
export interface YomikudashiIssue {
  /** 判定の種類 */
  type: YomikudashiType;
  /** 問題がある文字 */
  problematicCharacters: string[];
  /** 重要度レベル */
  severity: SeverityLevel;
  /** 減点スコア（0-100） */
  penaltyScore: number;
  /** 詳細説明 */
  description: string;
  /** 改善提案 */
  suggestion: string;
}

/**
 * 読み下し判定の総合結果
 */
export interface YomikudashiResult {
  /** 問題があるかどうか */
  hasIssue: boolean;
  /** 検出された問題のリスト */
  issues: YomikudashiIssue[];
  /** 総合スコア（100点満点、問題があるほど低くなる） */
  totalScore: number;
  /** 総合評価 */
  overallEvaluation: 'excellent' | 'good' | 'fair' | 'poor';
  /** 総合的な要約 */
  summary: string;
  /** 全体的な改善提案 */
  generalAdvice: string;
}

/**
 * 読み下し判定の入力データ
 */
export interface YomikudashiInput {
  /** 姓の文字配列とそれぞれの画数 */
  seiCharacters: Array<{ char: string; strokeCount: number }>;
  /** 名の文字配列とそれぞれの画数 */
  meiCharacters: Array<{ char: string; strokeCount: number }>;
  /** 性別（gender_neutral判定で使用） */
  gender?: 'male' | 'female' | 'unknown';
}

/**
 * 判定処理の結果（内部使用）
 */
export interface YomikudashiCheckResult {
  /** 該当するかどうか */
  isApplicable: boolean;
  /** 該当する文字のリスト */
  applicableCharacters: string[];
  /** 判定の詳細説明 */
  details: string;
}

/**
 * 画数に基づく判定の結果（内部使用）
 */
export interface StrokeCountCheckResult {
  /** 該当するかどうか */
  isApplicable: boolean;
  /** 画数 */
  strokeCount: number;
  /** 該当する格（人格または地格） */
  kakuType: 'jinkaku' | 'chikaku';
  /** 詳細説明 */
  details: string;
}

/**
 * 読み下し判定の設定
 */
export interface YomikudashiConfig {
  /** 有効にする判定タイプのリスト */
  enabledTypes: YomikudashiType[];
  /** 最低スコア閾値（これを下回ると poor 評価） */
  minimumScoreThreshold: number;
  /** 詳細レポートを生成するかどうか */
  generateDetailedReport: boolean;
}