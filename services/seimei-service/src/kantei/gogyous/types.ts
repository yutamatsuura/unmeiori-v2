/**
 * 五行判定結果の型定義
 */

import { Gogyou, GogyouRelation } from './gogyou-relations';

/**
 * 個別の五行関係判定結果
 */
export interface GogyouRelationResult {
  /** 第一の五行 */
  gogyou1: Gogyou;
  /** 第二の五行 */
  gogyou2: Gogyou;
  /** 関係性 */
  relation: GogyouRelation;
  /** スコア（100点満点） */
  score: number;
  /** 詳細説明 */
  description: string;
  /** 影響の強さ */
  impact: 'strong' | 'moderate' | 'weak';
}

/**
 * 内的五行バランス判定結果
 */
export interface InternalGogyouBalance {
  /** 含まれる五行の種類 */
  gogyouTypes: Gogyou[];
  /** 五行の種類数 */
  typeCount: number;
  /** バランススコア（100点満点） */
  balanceScore: number;
  /** バランス評価 */
  evaluation: 'excellent' | 'good' | 'fair' | 'poor';
  /** 詳細説明 */
  description: string;
}

/**
 * 五行詳細判定の総合結果
 */
export interface GogyouKanteiResult {
  /** 人格五行 */
  jinkaku: {
    gogyou: Gogyou;
    strokeCount: number;
    description: string;
  };
  /** 地格五行 */
  chikaku: {
    gogyou: Gogyou;
    strokeCount: number;
    description: string;
  };
  /** 人格と地格の関係 */
  jinkakuChikakuRelation: GogyouRelationResult;
  /** 内的五行バランス */
  internalBalance: InternalGogyouBalance;
  /** 総合スコア（100点満点） */
  totalScore: number;
  /** 総合評価 */
  totalEvaluation: 'excellent' | 'good' | 'fair' | 'poor';
  /** 総合的なアドバイス */
  advice: string;
}

/**
 * 五行判定の入力データ
 */
export interface GogyouKanteiInput {
  /** 姓の文字配列とそれぞれの画数 */
  seiCharacters: Array<{ char: string; strokeCount: number }>;
  /** 名の文字配列とそれぞれの画数 */
  meiCharacters: Array<{ char: string; strokeCount: number }>;
}