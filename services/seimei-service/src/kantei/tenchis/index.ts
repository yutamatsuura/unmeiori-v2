// 天地特殊判定モジュールのエクスポート

// メインクラス
export { TenchiKantei } from './TenchiKantei';

// 結果型とインターフェース
export {
    TenchiJudgmentResult,
    TenchiJudgmentType,
    TenchiJudgmentResults
} from './TenchiJudgmentResult';

// 個別判定クラス
export { DousuEvenJudgment } from './DousuEvenJudgment';
export { DousuOddJudgment } from './DousuOddJudgment';
export { SouDousuJudgment } from './SouDousuJudgment';
export { ShoutotsuJudgment } from './ShoutotsuJudgment';