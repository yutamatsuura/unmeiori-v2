import Gogyou from "../units/Gogyou";
import LocalDate from "../../times/LocalDate";
import Hakka from "../units/Hakka";
import Houi from "../units/Houi";
import QseiDate from "../dates/QseiDate";



const MONTH_TABLE = [
    [8, 2, 5],					//2月 添字0
    [7, 1, 4],					//3月 添字1
    [6, 9, 3],					//4月 添字2
    [5, 8, 2],					//5月 添字3
    [4, 7, 1],					//6月 添字4
    [3, 6, 9],					//7月 添字5
    [2, 5, 8],					//8月 添字6
    [1, 4, 7],					//9月 添字7
    [9, 3, 6],					//10月 添字8
    [8, 2, 5],					//11月 添字9
    [7, 1, 4],					//12月 添字10
    [6, 9, 3],					//13月 添字11
];



export default class Qsei {
    private _index: number;
    private _houi: Houi | null;
    private _name: string;
    private _rubi: string;
    private _gogyou: Gogyou | null;
    private _hakka: Hakka;
    private _kiban8: Array<number>;
    private _kiban12: Array<number>;

    public static readonly ONE = new Qsei(
        1,
        Houi.NORTH,
        "一白水星",
        "いっぱくすいせい",
        Gogyou.SUI_KIPOU,
        Hakka.KANKYUU_K,
        [6, 4, 8, 9, 5, 7, 3, 2]
    );

    public static readonly TWO = new Qsei(
        2,
        Houi.SOUTH_WEST,
        "二黒土星",
        "じこくどせい",
        Gogyou.DO_KIPOU,
        Hakka.KONKYUU_K,
        [7, 5, 9, 1, 6, 8, 4, 3]
    );
    public static readonly THREE = new Qsei(
        3,
        Houi.EAST,
        "三碧木星",
        "さんぺきもくせい",
        Gogyou.MOKU_KIPOU,
        Hakka.SINKYUU_K,
        [8, 6, 1, 2, 7, 9, 5, 4]
    );
    public static readonly FOUR = new Qsei(
        4,
        Houi.SOUTH_EAST,
        "四緑木星",
        "しろくもくせい",
        Gogyou.MOKU_KIPOU,
        Hakka.SONKYUU_K,
        [9, 7, 2, 3, 8, 1, 6, 5]
    );
    public static readonly FIVE = new Qsei(
        5,
        Houi.CHUUOU,
        "五黄土星",
        "ごおうどせい",
        Gogyou.DO_KIPOU,
        Hakka.TAIKYOKU,
        [1, 8, 3, 4, 9, 2, 7, 6]
    );
    public static readonly SIX = new Qsei(
        6,
        Houi.NORTH_WEST,
        "六白金星",
        "ろっぱくきんせい",
        Gogyou.KIN_KIPOU,
        Hakka.KENKYUU_K,
        [2, 9, 4, 5, 1, 3, 8, 7]
    );
    public static readonly SEVEN = new Qsei(
        7,
        Houi.WEST,
        "七赤金星",
        "しちせききんせい",
        Gogyou.KIN_KIPOU,
        Hakka.DAKYUU_K,
        [3, 1, 5, 6, 2, 4, 9, 8]
    );
    public static readonly EIGHT = new Qsei(
        8,
        Houi.NORTH_EAST,
        "八白土星",
        "はっぱくどせい",
        Gogyou.DO_KIPOU,
        Hakka.GONKYUU_K,
        [4, 2, 6, 7, 3, 5, 1, 9]
    );
    public static readonly NINE = new Qsei(
        9,
        Houi.SOUTH,
        "九紫火星",
        "きゅうしかせい",
        Gogyou.KA_KIPOU,
        Hakka.RIKYUU_K,
        [5, 3, 7, 8, 4, 6, 2, 1]
    );


    public static readonly KOUTEN_JOUI = new Qsei(
        5,
        null,
        "後天定位",
        "こうてんじょうい",
        null,
        Hakka.RIKYUU_K,
        [1, 8, 3, 4, 9, 2, 7, 6]
    );

    public static readonly SENTEN_JOUI = new Qsei(
        -1,
        null,
        "先天定位",
        "先天てんじょうい",
        null,
        Hakka.RIKYUU_K,
        [2, 3, 9, 7, 6, 4, 1, 8]
    );    




    public static readonly ARRAYS = new Array<Qsei | null>(
        null,
        Qsei.ONE,
        Qsei.TWO,
        Qsei.THREE,
        Qsei.FOUR,
        Qsei.FIVE,
        Qsei.SIX,
        Qsei.SEVEN,
        Qsei.EIGHT,
        Qsei.NINE,
    );
    constructor(index: number, houi: Houi | null, name: string, rubi: string, gogyou: Gogyou | null, hakka: Hakka, kiban8: Array<number>) {
        this._index = index;
        this._houi = houi;
        this._name = name;
        this._rubi = rubi;
        this._hakka = hakka;
        this._gogyou = gogyou;
        this._kiban8 = kiban8;
        this._kiban12 = Qsei.toKiban12(kiban8);
    }

    private static toKiban12(kibanSrc: Array<number>): Array<number> {
        if (kibanSrc.length != 8) {
            throw new Error("パラメータが規定値以外でした");
        }

        return [
            kibanSrc[0],
            kibanSrc[1],
            kibanSrc[1],
            kibanSrc[2],
            kibanSrc[3],
            kibanSrc[3],
            kibanSrc[4],
            kibanSrc[5],
            kibanSrc[5],
            kibanSrc[6],
            kibanSrc[7],
            kibanSrc[7]
        ];
    }


    public static of(index: number): Qsei | null {
        return Qsei.ARRAYS[index] || null;
    }

    get index(): number {
        return this._index;
    }

    get kiban8(): Array<number> {
        return this._kiban8.slice();
    }

    get kiban12(): Array<number> {
        return this._kiban12.slice();
    }

    get name(): string {
        return this._name;
    }

    get hakka(): Hakka {
        return this._hakka;
    }

    get rubi(): string {
        return this._rubi;
    }

    get gogyou(): Gogyou | null {
        return this._gogyou;
    }

    get houi(): Houi | null {
        return this._houi;
    }

    public getHeadName(): string {
        return this.name.substring(0, 1);
    }

    public findWaki(): Array<number> {
        if (!this.gogyou) return [];
        return this.gogyou.shozoku.filter((val) => {
            return val != this.index;
        });
    }

    public findKipous(): Array<number> {
        if (!this.gogyou) return [];
        let result = this.findWaki();

        const seikiGogyou = Gogyou.of(this.gogyou.seiki);
        if (seikiGogyou) {
            result = result.concat(seikiGogyou.shozoku);
        }

        const taikiGogyou = Gogyou.of(this.gogyou.taiki);
        if (taikiGogyou) {
            result = result.concat(taikiGogyou.shozoku);
        }

        result = result.filter((val) => {
            return val != 5;
        });

        result = result.sort();

        return result;
    }

    private static getYearSub(year: number): number {
        let mod = year % 9;
        if (mod == 0) {
            mod = 9;
        }
        else if (mod == 1) {
            mod = 10;
        }

        return 11 - mod;
    }


    public static getYear(date: LocalDate): Qsei | null {
        return Qsei.of(this.getYearSub(QseiDate.of(date).year));
    }


    public static getMonth(date: LocalDate): Qsei | null {
        let qseiDate = QseiDate.of(date);
        const yearQsei = Qsei.getYear(date);
        if (!yearQsei) return null;
        let index2 = (yearQsei.index - 1) % 3;
        return Qsei.of(MONTH_TABLE[qseiDate.monthIndex][index2]);
    }

    /**
     * 日盤（日命星）を計算するメソッド
     * シンプルな計算式で日々の九星を算出
     */
    public static getDay(date: LocalDate): Qsei | null {
        // 基準日: 2000年1月1日を九紫火星(9)とする
        const baseDate = LocalDate.of(2000, 1, 1);
        const baseDayQsei = 9;

        // 基準日からの経過日数を計算（ミリ秒から日数へ変換）
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / millisecondsPerDay);

        // 日盤は9日周期で回転（逆順で回転するため、日数を引く）
        let dayQseiIndex = baseDayQsei - (daysDiff % 9);

        // 負の値の場合は9を足して正の値にする
        while (dayQseiIndex <= 0) {
            dayQseiIndex += 9;
        }

        // 9を超える場合は9で割った余りにする
        while (dayQseiIndex > 9) {
            dayQseiIndex -= 9;
        }

        return Qsei.of(dayQseiIndex);
    }


    static toText(qseiIndexs: Array<number>): string {
        if(qseiIndexs.length == 0)
        {
            return "ー";    
        }
        let qsei = new Array<string>();
        qseiIndexs.forEach((index) => {
            const qseiItem = Qsei.of(index);
            if (qseiItem) {
                qsei.push(qseiItem.name);
            }
        });

        return qsei.join(",");
    }
}

