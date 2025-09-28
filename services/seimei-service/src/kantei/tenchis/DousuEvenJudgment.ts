import { TenchiJudgmentResult, TenchiJudgmentType } from './TenchiJudgmentResult';

/**
 * 天地同数（偶数）判定クラス
 * 天格と地格が同じ偶数の場合の特殊判定
 */
export class DousuEvenJudgment {
    /**
     * 天地同数（偶数）判定を実行
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 判定結果
     */
    public static judge(tenkaku: number, chikaku: number): TenchiJudgmentResult {
        const applies = this.isApplicable(tenkaku, chikaku);
        const score = applies ? this.calculateScore(tenkaku, chikaku) : 50;
        const description = this.getDescription(applies, tenkaku, chikaku);

        return {
            type: TenchiJudgmentType.DOUSU_EVEN,
            applies,
            score,
            description,
            tenkaku,
            chikaku
        };
    }

    /**
     * 天地同数（偶数）に該当するかを判定
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 該当するかどうか
     */
    private static isApplicable(tenkaku: number, chikaku: number): boolean {
        // 天格と地格が同じかつ、両方とも偶数である
        return tenkaku === chikaku && tenkaku % 2 === 0 && tenkaku > 0;
    }

    /**
     * スコアを計算
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns スコア（0-100）
     */
    private static calculateScore(tenkaku: number, chikaku: number): number {
        if (!this.isApplicable(tenkaku, chikaku)) return 50;

        // 偶数の天地同数は安定性があるが変化に乏しいとされる
        // 画数によってスコアを調整
        const value = tenkaku; // tenkaku === chikakuなのでどちらでも同じ

        // 基本スコアは60（やや良い）
        let score = 60;

        // 画数別の調整
        if (value >= 2 && value <= 10) {
            // 小さい偶数：安定度は高いが発展性に欠ける
            score = 55;
        } else if (value >= 12 && value <= 20) {
            // 中程度の偶数：バランスが良い
            score = 65;
        } else if (value >= 22 && value <= 30) {
            // やや大きい偶数：安定性と発展性のバランス
            score = 70;
        } else if (value >= 32) {
            // 大きい偶数：安定性はあるが重すぎる可能性
            score = 55;
        }

        // 特に良いとされる偶数画数の調整
        const excellentEvenNumbers = [6, 8, 16, 18, 24, 26];
        if (excellentEvenNumbers.includes(value)) {
            score += 10;
        }

        // 注意が必要な偶数画数の調整
        const cautiousEvenNumbers = [4, 10, 14, 22, 28];
        if (cautiousEvenNumbers.includes(value)) {
            score -= 5;
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
            return "天地同数（偶数）には該当しません。";
        }

        const value = tenkaku;
        let description = `天格${tenkaku}画と地格${chikaku}画が同数の偶数となっています。`;

        // 基本的な特徴
        description += "この配置は安定性と持続力に優れ、着実な歩みを示します。";

        // 画数別の詳細説明
        if (value >= 2 && value <= 10) {
            description += "小さな偶数同士の組み合わせで、堅実さはありますが、大きな変化や発展には時間がかかる傾向があります。";
        } else if (value >= 12 && value <= 20) {
            description += "中程度の偶数同士の組み合わせで、安定性と適度な発展性を兼ね備えています。";
        } else if (value >= 22 && value <= 30) {
            description += "やや大きな偶数同士の組み合わせで、堅固な基盤の上に着実な発展が期待できます。";
        } else {
            description += "大きな偶数同士の組み合わせで、安定性は高いですが、時として変化への適応が課題となることがあります。";
        }

        // 特別な画数への言及
        const excellentEvenNumbers = [6, 8, 16, 18, 24, 26];
        if (excellentEvenNumbers.includes(value)) {
            description += "この画数は特に調和と発展のバランスが良いとされています。";
        }

        const cautiousEvenNumbers = [4, 10, 14, 22, 28];
        if (cautiousEvenNumbers.includes(value)) {
            description += "この画数は安定性がある一方で、柔軟性を意識することが大切です。";
        }

        return description;
    }
}