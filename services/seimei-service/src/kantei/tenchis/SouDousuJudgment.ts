import { TenchiJudgmentResult, TenchiJudgmentType } from './TenchiJudgmentResult';

/**
 * 天地総同数判定クラス
 * 天格の合計画数と地格の合計画数が等しい場合の特殊判定
 * 極めて稀なケースで、特別な意味を持つ
 */
export class SouDousuJudgment {
    /**
     * 天地総同数判定を実行
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 判定結果
     */
    public static judge(tenkaku: number, chikaku: number): TenchiJudgmentResult {
        const applies = this.isApplicable(tenkaku, chikaku);
        const score = applies ? this.calculateScore(tenkaku, chikaku) : 50;
        const description = this.getDescription(applies, tenkaku, chikaku);

        return {
            type: TenchiJudgmentType.SOU_DOUSU,
            applies,
            score,
            description,
            tenkaku,
            chikaku
        };
    }

    /**
     * 天地総同数に該当するかを判定
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 該当するかどうか
     */
    private static isApplicable(tenkaku: number, chikaku: number): boolean {
        // 天格の合計画数と地格の合計画数が等しい
        // この実装では、単純に天格と地格が等しいことを条件とする
        // （実際の実装では、各文字の画数の合計を比較する必要がある場合もある）
        return tenkaku === chikaku && tenkaku > 0;
    }

    /**
     * スコアを計算
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns スコア（0-100）
     */
    private static calculateScore(tenkaku: number, chikaku: number): number {
        if (!this.isApplicable(tenkaku, chikaku)) return 50;

        // 天地総同数は極めて稀で特別な意味を持つ
        const value = tenkaku; // tenkaku === chikakuなのでどちらでも同じ

        // 基本スコアは80（特別な配置として高評価）
        let score = 80;

        // 画数別の調整
        if (value >= 1 && value <= 10) {
            // 小さい画数：珍しい配置だが、基盤として安定
            score = 75;
        } else if (value >= 11 && value <= 20) {
            // 中程度の画数：バランスが良く、特別な意味を持つ
            score = 85;
        } else if (value >= 21 && value <= 30) {
            // やや大きい画数：強力な配置
            score = 90;
        } else if (value >= 31) {
            // 大きい画数：特別だが重すぎる可能性
            score = 75;
        }

        // 特別に良いとされる画数の調整
        const excellentNumbers = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 27];
        if (excellentNumbers.includes(value)) {
            score += 10;
        }

        // 注意が必要な画数の調整
        const cautiousNumbers = [4, 9, 10, 14, 19, 20, 22, 26, 28, 29];
        if (cautiousNumbers.includes(value)) {
            score -= 10;
        }

        // 大凶数の調整
        const unluckyNumbers = [9, 19, 29, 39];
        if (unluckyNumbers.includes(value)) {
            score -= 20;
        }

        // スコアの範囲を0-100に制限
        return Math.max(0, Math.min(100, score));
    }

    /**
     * 詳細説明を生成
     * @param applies 該当するかどうか
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 詳細説明
     */
    private static getDescription(applies: boolean, tenkaku: number, chikaku: number): string {
        if (!applies) {
            return "天地総同数には該当しません。";
        }

        const value = tenkaku;
        let description = `天格${tenkaku}画と地格${chikaku}画が総同数となっています。`;

        // 基本的な特徴
        description += "これは極めて稀な配置で、特別な意味を持つとされています。";
        description += "天と地の調和が完全に取れた状態を表し、内面と外面、理想と現実のバランスが優れていることを示します。";

        // 画数別の詳細説明
        if (value >= 1 && value <= 10) {
            description += "小さな画数での総同数は、純粋さと調和の象徴です。素直で自然な魅力を持ち、周囲との協調性に優れています。";
        } else if (value >= 11 && value <= 20) {
            description += "中程度の画数での総同数は、理想的なバランスを表します。能力と人格の調和が取れ、安定した発展が期待できます。";
        } else if (value >= 21 && value <= 30) {
            description += "大きな画数での総同数は、強力な運勢を示します。大きな目標の実現と、それに見合う人格の形成が可能です。";
        } else {
            description += "非常に大きな画数での総同数は、特別な使命を持つ可能性を示しますが、その重責に耐える強さが必要です。";
        }

        // 特別な意味
        description += "この配置の方は、自分の内なる声と外界の要求を上手く調和させる能力に長けています。";

        // 画数別の特別な言及
        const excellentNumbers = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 27];
        if (excellentNumbers.includes(value)) {
            description += "この画数での総同数は特に幸運な配置とされ、多方面での成功が期待できます。";
        }

        const cautiousNumbers = [4, 9, 10, 14, 19, 20, 22, 26, 28, 29];
        if (cautiousNumbers.includes(value)) {
            description += "この画数での総同数は慎重な行動が求められますが、適切な判断により良い結果を得ることができます。";
        }

        const unluckyNumbers = [9, 19, 29, 39];
        if (unluckyNumbers.includes(value)) {
            description += "この画数での総同数は試練を伴う可能性がありますが、それを乗り越えることで大きな成長が期待できます。";
        }

        return description;
    }
}