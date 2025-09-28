/**
 * 天地特殊判定の結果を表すインターフェース
 */
export interface TenchiJudgmentResult {
    /** 判定タイプ */
    type: TenchiJudgmentType;
    /** 判定結果（該当するかどうか） */
    applies: boolean;
    /** スコア（0-100） */
    score: number;
    /** 詳細説明 */
    description: string;
    /** 天格の画数 */
    tenkaku: number;
    /** 地格の画数 */
    chikaku: number;
}

/**
 * 天地特殊判定のタイプ
 */
export enum TenchiJudgmentType {
    /** 天地同数（偶数） */
    DOUSU_EVEN = "天地同数（偶数）",
    /** 天地同数（奇数） */
    DOUSU_ODD = "天地同数（奇数）",
    /** 天地総同数 */
    SOU_DOUSU = "天地総同数",
    /** 天地衝突 */
    SHOUTOTSU = "天地衝突"
}

/**
 * 複数の天地特殊判定結果をまとめるクラス
 */
export class TenchiJudgmentResults {
    private _results: TenchiJudgmentResult[];

    constructor(results: TenchiJudgmentResult[]) {
        this._results = results;
    }

    get results(): ReadonlyArray<TenchiJudgmentResult> {
        return this._results;
    }

    /**
     * 該当する判定結果のみを取得
     */
    get applicableResults(): TenchiJudgmentResult[] {
        return this._results.filter(result => result.applies);
    }

    /**
     * 最も重要度の高い判定結果を取得
     */
    get primaryResult(): TenchiJudgmentResult | null {
        const applicable = this.applicableResults;
        if (applicable.length === 0) return null;

        // 天地総同数 > 天地衝突 > 天地同数の順で優先度を決定
        const priority = [
            TenchiJudgmentType.SOU_DOUSU,
            TenchiJudgmentType.SHOUTOTSU,
            TenchiJudgmentType.DOUSU_EVEN,
            TenchiJudgmentType.DOUSU_ODD
        ];

        for (const type of priority) {
            const found = applicable.find(result => result.type === type);
            if (found) return found;
        }

        return applicable[0];
    }

    /**
     * 総合スコアを計算
     */
    get totalScore(): number {
        const applicable = this.applicableResults;
        if (applicable.length === 0) return 50; // 中性値

        // 複数の判定が該当する場合は平均値を返す
        const sum = applicable.reduce((acc, result) => acc + result.score, 0);
        return Math.round(sum / applicable.length);
    }
}