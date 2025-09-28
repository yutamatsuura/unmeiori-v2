import { TenchiJudgmentResult, TenchiJudgmentType } from './TenchiJudgmentResult';

/**
 * 天地同数（奇数）判定クラス
 * 天格と地格が同じ奇数の場合の特殊判定
 */
export class DousuOddJudgment {
    /**
     * 天地同数（奇数）判定を実行
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 判定結果
     */
    public static judge(tenkaku: number, chikaku: number): TenchiJudgmentResult {
        const applies = this.isApplicable(tenkaku, chikaku);
        const score = applies ? this.calculateScore(tenkaku, chikaku) : 50;
        const description = this.getDescription(applies, tenkaku, chikaku);

        return {
            type: TenchiJudgmentType.DOUSU_ODD,
            applies,
            score,
            description,
            tenkaku,
            chikaku
        };
    }

    /**
     * 天地同数（奇数）に該当するかを判定
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 該当するかどうか
     */
    private static isApplicable(tenkaku: number, chikaku: number): boolean {
        // 天格と地格が同じかつ、両方とも奇数である
        return tenkaku === chikaku && tenkaku % 2 === 1 && tenkaku > 0;
    }

    /**
     * スコアを計算
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns スコア（0-100）
     */
    private static calculateScore(tenkaku: number, chikaku: number): number {
        if (!this.isApplicable(tenkaku, chikaku)) return 50;

        // 奇数の天地同数は活動的だが不安定な傾向
        // 画数によってスコアを調整
        const value = tenkaku; // tenkaku === chikakuなのでどちらでも同じ

        // 基本スコアは55（やや注意）
        let score = 55;

        // 画数別の調整
        if (value >= 1 && value <= 9) {
            // 小さい奇数：活動的だが基盤が不安定
            score = 50;
        } else if (value >= 11 && value <= 19) {
            // 中程度の奇数：活動性と安定性のバランス
            score = 60;
        } else if (value >= 21 && value <= 29) {
            // やや大きい奇数：強い活動性
            score = 65;
        } else if (value >= 31) {
            // 大きい奇数：過度な活動性で不安定
            score = 45;
        }

        // 特に良いとされる奇数画数の調整
        const excellentOddNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27];
        if (excellentOddNumbers.includes(value)) {
            score += 8;
        }

        // 注意が必要な奇数画数の調整
        const cautiousOddNumbers = [9, 19, 29]; // 苦労数
        if (cautiousOddNumbers.includes(value)) {
            score -= 10;
        }

        // 大凶数の調整
        const unluckyNumbers = [9, 19, 29, 39];
        if (unluckyNumbers.includes(value)) {
            score -= 15;
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
            return "天地同数（奇数）には該当しません。";
        }

        const value = tenkaku;
        let description = `天格${tenkaku}画と地格${chikaku}画が同数の奇数となっています。`;

        // 基本的な特徴
        description += "この配置は活動的で変化に富む性質を示しますが、安定性に課題が生じることがあります。";

        // 画数別の詳細説明
        if (value >= 1 && value <= 9) {
            description += "小さな奇数同士の組み合わせで、活発な行動力はありますが、基盤の安定化が重要な課題となります。";
        } else if (value >= 11 && value <= 19) {
            description += "中程度の奇数同士の組み合わせで、活動性と安定性のバランスを取ることで良い結果が期待できます。";
        } else if (value >= 21 && value <= 29) {
            description += "やや大きな奇数同士の組み合わせで、強い推進力と創造性を持ちますが、方向性の安定化が重要です。";
        } else {
            description += "大きな奇数同士の組み合わせで、非常に強い活動性を持ちますが、過度な変化により不安定になりやすい傾向があります。";
        }

        // 特別な画数への言及
        const excellentOddNumbers = [1, 3, 5, 7, 11, 13, 15, 17, 21, 23, 25, 27];
        if (excellentOddNumbers.includes(value)) {
            description += "この画数は活動力と発展性に優れた良い配置とされています。";
        }

        const cautiousOddNumbers = [9, 19, 29];
        if (cautiousOddNumbers.includes(value)) {
            description += "この画数は苦労を伴う可能性があり、忍耐強い取り組みが重要です。";
        }

        const unluckyNumbers = [9, 19, 29, 39];
        if (unluckyNumbers.includes(value)) {
            description += "この画数は特に慎重な行動と周囲のサポートが必要な配置です。";
        }

        return description;
    }
}