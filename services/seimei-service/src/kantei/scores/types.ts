/**
 * 姓名判断 高度スコア計算システム 型定義
 *
 * 全ての判定システムを統合し、重み付けによる総合評価を行う
 */

import { YouinKanteiResult } from '../youins/YouinKantei';
import { GogyouKanteiResult } from '../gogyous/types';
import { YomikudashiResult } from '../yomikudashis/types';
import { TenchiJudgmentResults } from '../tenchis/TenchiJudgmentResult';
import { KakusuMessage } from '../../data/kakusu-messages';

/**
 * 統合スコア計算の入力データ
 */
export interface ScoreCalculatorInput {
  // 姓名の基本情報
  seiCharacters: Array<{ char: string; strokeCount: number }>;
  meiCharacters: Array<{ char: string; strokeCount: number }>;

  // 各格の画数
  tenkakuKakusu: number;   // 天格
  jinkakuKakusu: number;   // 人格
  chikakuKakusu: number;   // 地格
  sougakuKakusu: number;   // 総格
  gaikakuKakusu?: number;  // 外格（三文字以上の場合のみ）
}

/**
 * カテゴリ別スコア結果
 */
export interface CategoryScore {
  category: ScoreCategory;
  rawScore: number;           // 元のスコア（0-100）
  normalizedScore: number;    // 正規化されたスコア（0-100）
  weight: number;             // 重み付け（0-1）
  weightedScore: number;      // 重み付け適用後スコア
  details: string;            // 詳細説明
  issues?: string[];          // 問題点
  strengths?: string[];       // 良い点
}

/**
 * スコアカテゴリ
 */
export enum ScoreCategory {
  YOUIN = 'youin',           // 陰陽パターン
  GOGYOU = 'gogyou',         // 五行関係
  KAKUSU = 'kakusu',         // 画数メッセージ
  TENCHI = 'tenchi',         // 天地特殊
  YOMIKUDASHI = 'yomikudashi' // 読み下し
}

/**
 * カテゴリ別重み付け設定
 */
export interface CategoryWeights {
  [ScoreCategory.YOUIN]: number;      // 20%
  [ScoreCategory.GOGYOU]: number;     // 25%
  [ScoreCategory.KAKUSU]: number;     // 30%
  [ScoreCategory.TENCHI]: number;     // 15%
  [ScoreCategory.YOMIKUDASHI]: number; // 10%
}

/**
 * 総合評価レベル
 */
export enum OverallEvaluationLevel {
  EXCELLENT = 'excellent',    // 90点以上
  VERY_GOOD = 'very_good',   // 80-89点
  GOOD = 'good',             // 70-79点（正名）
  FAIR = 'fair',             // 60-69点
  POOR = 'poor',             // 50-59点
  VERY_POOR = 'very_poor'    // 49点以下
}

/**
 * 名前の分類
 */
export enum NameClassification {
  EXCELLENT_NAME = 'excellent_name',  // 優秀名（90点以上）
  GOOD_NAME = 'good_name',           // 正名（70-89点）
  AVERAGE_NAME = 'average_name',      // 普通名（50-69点）
  PROBLEMATIC_NAME = 'problematic_name' // 問題名（49点以下）
}

/**
 * 統合スコア計算結果
 */
export interface ScoreCalculatorResult {
  // 基本情報
  fullName: string;
  totalScore: number;           // 総合スコア（5-100点）
  classification: NameClassification;
  evaluationLevel: OverallEvaluationLevel;

  // カテゴリ別詳細
  categoryScores: CategoryScore[];

  // 総合評価
  overallAssessment: {
    summary: string;            // 総評
    strengths: string[];        // 強み
    weaknesses: string[];       // 弱み
    recommendations: string[];   // 改善提案
  };

  // 特別判定
  specialJudgments: {
    isPerfectScore: boolean;    // 満点判定
    isExcellentName: boolean;   // 優秀名判定
    isGoodName: boolean;        // 正名判定
    hasRecommendedChanges: boolean; // 改名推奨判定
  };

  // 詳細レポート
  detailedReport: {
    executiveSummary: string;   // 要約
    categoryAnalysis: string;   // カテゴリ別分析
    overallAdvice: string;      // 総合アドバイス
    technicalDetails: string;   // 技術的詳細
  };

  // メタ情報
  calculationMetadata: {
    timestamp: Date;
    version: string;
    weights: CategoryWeights;
    processingTimeMs: number;
  };
}

/**
 * 各判定システムの結果インターフェース
 */
export interface JudgmentResults {
  youinResult?: YouinKanteiResult;
  gogyouResult?: GogyouKanteiResult;
  yomikudashiResult?: YomikudashiResult;
  tenchiResult?: TenchiJudgmentResults;
  kakusuMessages?: {
    tenkaku: KakusuMessage | null;
    jinkaku: KakusuMessage | null;
    chikaku: KakusuMessage | null;
    sougaku: KakusuMessage | null;
    gaikaku?: KakusuMessage | null;
  };
}

/**
 * スコア正規化オプション
 */
export interface NormalizationOptions {
  minScore: number;           // 最小スコア（デフォルト：5）
  maxScore: number;           // 最大スコア（デフォルト：100）
  baseScore: number;          // 基準スコア（デフォルト：50）
  strictMode: boolean;        // 厳格モード
}

/**
 * 計算設定
 */
export interface ScoreCalculatorConfig {
  weights: CategoryWeights;
  normalization: NormalizationOptions;
  enableDetailedLogging: boolean;
  generateTechnicalReport: boolean;
}

/**
 * デフォルト設定
 */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  [ScoreCategory.YOUIN]: 0.20,      // 陰陽パターン: 20%
  [ScoreCategory.GOGYOU]: 0.25,     // 五行関係: 25%
  [ScoreCategory.KAKUSU]: 0.30,     // 画数メッセージ: 30%
  [ScoreCategory.TENCHI]: 0.15,     // 天地特殊: 15%
  [ScoreCategory.YOMIKUDASHI]: 0.10  // 読み下し: 10%
};

export const DEFAULT_NORMALIZATION: NormalizationOptions = {
  minScore: 5,
  maxScore: 100,
  baseScore: 50,
  strictMode: false
};

export const DEFAULT_CONFIG: ScoreCalculatorConfig = {
  weights: DEFAULT_WEIGHTS,
  normalization: DEFAULT_NORMALIZATION,
  enableDetailedLogging: true,
  generateTechnicalReport: true
};