import Seimei from '../../seimeis/units/Seimei';
import Kaku from '../../seimeis/units/Kaku';
import { TenchiJudgmentResults } from './TenchiJudgmentResult';
import { DousuEvenJudgment } from './DousuEvenJudgment';
import { DousuOddJudgment } from './DousuOddJudgment';
import { SouDousuJudgment } from './SouDousuJudgment';
import { ShoutotsuJudgment } from './ShoutotsuJudgment';

/**
 * 天地特殊判定メインクラス
 * 姓名判断の天格と地格の特殊な関係を判定する
 */
export class TenchiKantei {
    private _seimei: Seimei;
    private _tenkaku: Kaku;
    private _chikaku: Kaku;

    /**
     * コンストラクタ
     * @param seimei 姓名データ
     */
    constructor(seimei: Seimei) {
        this._seimei = seimei;
        this._tenkaku = Kaku.ofTenkaku(seimei);
        this._chikaku = Kaku.ofTikaku(seimei);
    }

    /**
     * 天地特殊判定を実行
     * @returns 天地特殊判定の結果
     */
    public judge(): TenchiJudgmentResults {
        const tenkakuKakusu = this._tenkaku.kakusu;
        const chikakuKakusu = this._chikaku.kakusu;

        // 各種判定を実行
        const results = [
            DousuEvenJudgment.judge(tenkakuKakusu, chikakuKakusu),
            DousuOddJudgment.judge(tenkakuKakusu, chikakuKakusu),
            SouDousuJudgment.judge(tenkakuKakusu, chikakuKakusu),
            ShoutotsuJudgment.judge(tenkakuKakusu, chikakuKakusu)
        ];

        return new TenchiJudgmentResults(results);
    }

    /**
     * 天格を取得
     * @returns 天格
     */
    get tenkaku(): Kaku {
        return this._tenkaku;
    }

    /**
     * 地格を取得
     * @returns 地格
     */
    get chikaku(): Kaku {
        return this._chikaku;
    }

    /**
     * 姓名データを取得
     * @returns 姓名データ
     */
    get seimei(): Seimei {
        return this._seimei;
    }

    /**
     * 天格の画数を取得
     * @returns 天格の画数
     */
    get tenkakuKakusu(): number {
        return this._tenkaku.kakusu;
    }

    /**
     * 地格の画数を取得
     * @returns 地格の画数
     */
    get chikakuKakusu(): number {
        return this._chikaku.kakusu;
    }

    /**
     * 天地の画数の組み合わせを文字列で取得
     * @returns "天格-地格"の形式
     */
    get combination(): string {
        return `${this.tenkakuKakusu}-${this.chikakuKakusu}`;
    }

    /**
     * 静的メソッド：姓名データから天地特殊判定を実行
     * @param seimei 姓名データ
     * @returns 天地特殊判定の結果
     */
    public static judge(seimei: Seimei): TenchiJudgmentResults {
        const kantei = new TenchiKantei(seimei);
        return kantei.judge();
    }

    /**
     * 静的メソッド：天格と地格の画数から直接判定
     * @param tenkakuKakusu 天格の画数
     * @param chikakuKakusu 地格の画数
     * @returns 天地特殊判定の結果
     */
    public static judgeByKakusu(tenkakuKakusu: number, chikakuKakusu: number): TenchiJudgmentResults {
        // 各種判定を実行
        const results = [
            DousuEvenJudgment.judge(tenkakuKakusu, chikakuKakusu),
            DousuOddJudgment.judge(tenkakuKakusu, chikakuKakusu),
            SouDousuJudgment.judge(tenkakuKakusu, chikakuKakusu),
            ShoutotsuJudgment.judge(tenkakuKakusu, chikakuKakusu)
        ];

        return new TenchiJudgmentResults(results);
    }

    /**
     * 判定結果のサマリーを取得
     * @returns 判定結果のサマリー
     */
    public getSummary(): {
        combination: string;
        totalScore: number;
        primaryType: string | null;
        applicableCount: number;
        description: string;
    } {
        const results = this.judge();
        const primaryResult = results.primaryResult;

        return {
            combination: this.combination,
            totalScore: results.totalScore,
            primaryType: primaryResult?.type || null,
            applicableCount: results.applicableResults.length,
            description: primaryResult?.description || "特別な天地関係は検出されませんでした。"
        };
    }

    /**
     * デバッグ用情報を取得
     * @returns デバッグ情報
     */
    public getDebugInfo(): {
        seimeiName: string;
        tenkaku: { name: string; kakusu: number; seimei: string };
        chikaku: { name: string; kakusu: number; seimei: string };
        combination: string;
        judgmentResults: any[];
    } {
        const results = this.judge();

        return {
            seimeiName: this._seimei.allNameWithSpace(),
            tenkaku: {
                name: this._tenkaku.name,
                kakusu: this._tenkaku.kakusu,
                seimei: this._tenkaku.getSeimeiWithSpace()
            },
            chikaku: {
                name: this._chikaku.name,
                kakusu: this._chikaku.kakusu,
                seimei: this._chikaku.getSeimeiWithSpace()
            },
            combination: this.combination,
            judgmentResults: results.results.map(result => ({
                type: result.type,
                applies: result.applies,
                score: result.score,
                description: result.description
            }))
        };
    }
}