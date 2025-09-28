import { TenchiJudgmentResult, TenchiJudgmentType } from './TenchiJudgmentResult';

/**
 * 天地衝突判定クラス
 * 3, 5, 9画の特定組み合わせで凶意が強い組み合わせを検出
 */
export class ShoutotsuJudgment {
    // 衝突を起こしやすい画数の組み合わせ
    private static readonly CONFLICT_COMBINATIONS: Array<[number, number]> = [
        [3, 5], [5, 3],   // 3-5, 5-3の組み合わせ
        [3, 9], [9, 3],   // 3-9, 9-3の組み合わせ
        [5, 9], [9, 5],   // 5-9, 9-5の組み合わせ
        [3, 3],           // 3-3の組み合わせ
        [5, 5],           // 5-5の組み合わせ
        [9, 9],           // 9-9の組み合わせ
        [4, 9], [9, 4],   // 4-9, 9-4の組み合わせ（追加的な凶組み合わせ）
        [14, 19], [19, 14], // 14-19, 19-14の組み合わせ
        [19, 29], [29, 19], // 19-29, 29-19の組み合わせ
        [4, 14], [14, 4],   // 4-14, 14-4の組み合わせ
        [10, 20], [20, 10], // 10-20, 20-10の組み合わせ
    ];

    // 特に強い衝突の組み合わせ
    private static readonly STRONG_CONFLICT_COMBINATIONS: Array<[number, number]> = [
        [9, 9],           // 9-9（最強の凶組み合わせ）
        [19, 19],         // 19-19
        [29, 29],         // 29-29
        [9, 19], [19, 9], // 9-19, 19-9
        [9, 29], [29, 9], // 9-29, 29-9
        [19, 29], [29, 19], // 19-29, 29-19
    ];

    /**
     * 天地衝突判定を実行
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 判定結果
     */
    public static judge(tenkaku: number, chikaku: number): TenchiJudgmentResult {
        const applies = this.isApplicable(tenkaku, chikaku);
        const score = applies ? this.calculateScore(tenkaku, chikaku) : 50;
        const description = this.getDescription(applies, tenkaku, chikaku);

        return {
            type: TenchiJudgmentType.SHOUTOTSU,
            applies,
            score,
            description,
            tenkaku,
            chikaku
        };
    }

    /**
     * 天地衝突に該当するかを判定
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 該当するかどうか
     */
    private static isApplicable(tenkaku: number, chikaku: number): boolean {
        return this.CONFLICT_COMBINATIONS.some(([t, c]) => t === tenkaku && c === chikaku);
    }

    /**
     * 強い衝突に該当するかを判定
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns 強い衝突に該当するかどうか
     */
    private static isStrongConflict(tenkaku: number, chikaku: number): boolean {
        return this.STRONG_CONFLICT_COMBINATIONS.some(([t, c]) => t === tenkaku && c === chikaku);
    }

    /**
     * スコアを計算
     * @param tenkaku 天格の画数
     * @param chikaku 地格の画数
     * @returns スコア（0-100）
     */
    private static calculateScore(tenkaku: number, chikaku: number): number {
        if (!this.isApplicable(tenkaku, chikaku)) return 50;

        // 基本スコアは25（低い）
        let score = 25;

        // 強い衝突の場合はさらに低く
        if (this.isStrongConflict(tenkaku, chikaku)) {
            score = 10;
        }

        // 特定の組み合わせ別の調整
        const combination = `${tenkaku}-${chikaku}`;

        switch (combination) {
            case '9-9':
                score = 5; // 最も凶とされる組み合わせ
                break;
            case '19-19':
            case '29-29':
                score = 8;
                break;
            case '9-19':
            case '19-9':
            case '9-29':
            case '29-9':
            case '19-29':
            case '29-19':
                score = 12;
                break;
            case '3-9':
            case '9-3':
            case '5-9':
            case '9-5':
                score = 20;
                break;
            case '3-5':
            case '5-3':
                score = 30;
                break;
            case '3-3':
            case '5-5':
                score = 35;
                break;
            default:
                score = 25;
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
            return "天地衝突には該当しません。";
        }

        const combination = `${tenkaku}-${chikaku}`;
        let description = `天格${tenkaku}画と地格${chikaku}画の組み合わせが天地衝突に該当します。`;

        // 基本的な説明
        description += "この配置は天と地のエネルギーが対立し、内面的な葛藤や外的な困難を生じやすいとされています。";

        // 組み合わせ別の詳細説明
        if (this.isStrongConflict(tenkaku, chikaku)) {
            description += "特に強い衝突の組み合わせで、人生において大きな試練や困難に直面する可能性があります。";
        }

        switch (combination) {
            case '9-9':
                description += "最も強い凶意を持つ組み合わせです。忍耐力と強い意志で困難を乗り越える必要があります。周囲のサポートを積極的に求めることが重要です。";
                break;
            case '19-19':
            case '29-29':
                description += "苦労数同士の衝突で、継続的な困難に見舞われる可能性があります。しかし、これらの試練を乗り越えることで大きな成長が期待できます。";
                break;
            case '9-19':
            case '19-9':
            case '9-29':
            case '29-9':
            case '19-29':
            case '29-19':
                description += "苦労数との衝突により、人生の転換期に困難が生じやすい傾向があります。慎重な判断と計画的な行動が必要です。";
                break;
            case '3-9':
            case '9-3':
                description += "創造性を表す3画と苦労を表す9画の衝突で、才能の発揮において障害が生じる可能性があります。粘り強い努力が成功への鍵となります。";
                break;
            case '5-9':
            case '9-5':
                description += "自由を表す5画と苦労を表す9画の衝突で、独立心と現実との間で葛藤が生じやすい傾向があります。";
                break;
            case '3-5':
            case '5-3':
                description += "創造性と自由の衝突により、方向性の定まらない状況が生じることがあります。目標を明確にすることが重要です。";
                break;
            case '3-3':
                description += "創造性の過剰により、アイデアが実現に結びつかない可能性があります。現実的な計画性を身につけることが大切です。";
                break;
            case '5-5':
                description += "自由への過度な欲求により、責任感に欠ける傾向が生じる可能性があります。バランス感覚を養うことが重要です。";
                break;
            default:
                description += "エネルギーの対立により、内面と外面の調和を取ることが課題となります。";
        }

        // 対処法のアドバイス
        description += "天地衝突の影響を軽減するには、自己理解を深め、感情のコントロールを身につけ、周囲との調和を重視することが大切です。";

        return description;
    }
}