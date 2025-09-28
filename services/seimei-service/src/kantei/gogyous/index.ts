/**
 * 五行詳細判定システム エクスポート
 */

export { GogyouKantei } from './GogyouKantei';
export {
  Gogyou,
  GogyouRelation,
  getGogyouFromStrokeCount,
  getGogyouRelation,
  GOGYOU_RELATION_DESCRIPTIONS,
  GOGYOU_CHARACTERISTICS,
  SOUSHOU_RELATIONS,
  SOUKOKU_RELATIONS
} from './gogyou-relations';
export type {
  GogyouKanteiInput,
  GogyouKanteiResult,
  GogyouRelationResult,
  InternalGogyouBalance
} from './types';