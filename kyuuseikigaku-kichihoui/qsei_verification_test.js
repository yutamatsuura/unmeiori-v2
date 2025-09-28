// 九星気学ロジック検証用テストスクリプト
// TypeScriptの型を無視してJavaScriptとして実行

// 必要なクラスのインポートをシミュレート
const fs = require('fs');
const path = require('path');

// LocalDateクラスのシンプル実装
class LocalDate {
    constructor(year, month, day) {
        this.date = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    static of(year, month, day) {
        return new LocalDate(year, month, day);
    }

    getYear() {
        return this.date.getFullYear();
    }

    getMonthValue() {
        return this.date.getMonth() + 1;
    }

    getDayOfMonth() {
        return this.date.getDate();
    }

    toString() {
        return `${this.getYear()}-${this.getMonthValue()}-${this.getDayOfMonth()}`;
    }

    compareTo(other) {
        const diff = this.date.getTime() - other.date.getTime();
        return diff === 0 ? 0 : (diff < 0 ? -1 : 1);
    }

    plusDays(days) {
        const newDate = new Date(this.date);
        newDate.setDate(newDate.getDate() + days);
        return LocalDate.of(newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate());
    }

    minusDays(days) {
        return this.plusDays(-days);
    }
}

// TypeUtilsクラスのシンプル実装
class TypeUtils {
    static toInt(val) {
        return parseInt(String(val));
    }
}

// Gogyouクラスのシンプル実装
class Gogyou {
    constructor(key, seiki, taiki, shozoku, className) {
        this._key = key;
        this._seiki = seiki;
        this._taiki = taiki;
        this._shozoku = shozoku;
        this._className = className;
    }

    get key() { return this._key; }
    get seiki() { return this._seiki; }
    get taiki() { return this._taiki; }
    get shozoku() { return this._shozoku.slice(); }

    static of(key) {
        return Gogyou.KIPOU_MAPS.get(key);
    }
}

Gogyou.MOKU_KIPOU = new Gogyou("木", "水", "火", [3, 4], "moku");
Gogyou.KA_KIPOU = new Gogyou("火", "木", "土", [9], "ka");
Gogyou.DO_KIPOU = new Gogyou("土", "火", "金", [2, 5, 8], "do");
Gogyou.KIN_KIPOU = new Gogyou("金", "土", "水", [6, 7], "kin");
Gogyou.SUI_KIPOU = new Gogyou("水", "金", "木", [1], "sui");

Gogyou.KIPOU_MAPS = new Map([
    [Gogyou.MOKU_KIPOU._key, Gogyou.MOKU_KIPOU],
    [Gogyou.KA_KIPOU._key, Gogyou.KA_KIPOU],
    [Gogyou.DO_KIPOU._key, Gogyou.DO_KIPOU],
    [Gogyou.KIN_KIPOU._key, Gogyou.KIN_KIPOU],
    [Gogyou.SUI_KIPOU._key, Gogyou.SUI_KIPOU],
]);

// Houiクラスのシンプル実装
class Houi {
    constructor(index, name) {
        this._index = index;
        this._name = name;
    }

    get index() { return this._index; }
    get name() { return this._name; }
}

Houi.NORTH = new Houi(0, "北");
Houi.NORTH_EAST = new Houi(1, "東北");
Houi.EAST = new Houi(2, "東");
Houi.SOUTH_EAST = new Houi(3, "東南");
Houi.SOUTH = new Houi(4, "南");
Houi.SOUTH_WEST = new Houi(5, "西南");
Houi.WEST = new Houi(6, "西");
Houi.NORTH_WEST = new Houi(7, "西北");
Houi.CHUUOU = new Houi(-1, "中央");

// Hakkaクラスのシンプル実装
class Hakka {
    constructor(name, rubi) {
        this._name = name;
        this._rubi = rubi;
    }

    get name() { return this._name; }
}

Hakka.KANKYUU_K = new Hakka("坎宮傾斜", "かんきゅうけいしゃ");
Hakka.GONKYUU_K = new Hakka("艮宮傾斜", "ごんきゅうけいしゃ");
Hakka.SINKYUU_K = new Hakka("震宮傾斜", "しんきゅうけいしゃ");
Hakka.SONKYUU_K = new Hakka("巽宮傾斜", "そんきゅうけいしゃ");
Hakka.RIKYUU_K = new Hakka("離宮傾斜", "りきゅうけいしゃ");
Hakka.KONKYUU_K = new Hakka("坤宮傾斜", "こんきゅうけいしゃ");
Hakka.DAKYUU_K = new Hakka("兌宮傾斜", "だきゅうけいしゃ");
Hakka.KENKYUU_K = new Hakka("乾宮傾斜", "けんきゅうけいしゃ");
Hakka.TAIKYOKU = new Hakka("太極", "たいきょく");

// Setuクラスのシンプル実装（節入り計算）
class Setu {
    static calc(year, setu) {
        const D = setu.D;
        const A = setu.A;
        const Y = year + setu.year;
        const day = TypeUtils.toInt(D + (A * (Y - 1900))) - TypeUtils.toInt((Y - 1900) / 4);
        return LocalDate.of(year, setu.month, day);
    }

    static enters(year) {
        const result = [];
        Setu.SETU_ENTER.forEach((_, index) => {
            result.push(Setu.enter(year, index));
        });
        return result;
    }

    static enter(year, index) {
        if (index === Setu.SETU_ENTER.length - 1) {
            year++;
        }
        return Setu.calc(year, Setu.SETU_ENTER[index]);
    }
}

Setu.SETU2 = { month: 2, D: 4.8693, A: 0.242713, year: -1 };
Setu.SETU3 = { month: 3, D: 6.3968, A: 0.242512, year: 0 };
Setu.SETU4 = { month: 4, D: 5.6280, A: 0.242231, year: 0 };
Setu.SETU5 = { month: 5, D: 6.3771, A: 0.241945, year: 0 };
Setu.SETU6 = { month: 6, D: 6.5733, A: 0.241731, year: 0 };
Setu.SETU7 = { month: 7, D: 8.0091, A: 0.241642, year: 0 };
Setu.SETU8 = { month: 8, D: 8.4102, A: 0.241703, year: 0 };
Setu.SETU9 = { month: 9, D: 8.5186, A: 0.241898, year: 0 };
Setu.SETU10 = { month: 10, D: 9.1414, A: 0.242179, year: 0 };
Setu.SETU11 = { month: 11, D: 8.2396, A: 0.242469, year: 0 };
Setu.SETU12 = { month: 12, D: 7.9152, A: 0.242689, year: 0 };
Setu.SETU1 = { month: 1, D: 6.3811, A: 0.242778, year: -1 };

Setu.SETU_ENTER = [
    Setu.SETU2, Setu.SETU3, Setu.SETU4, Setu.SETU5, Setu.SETU6, Setu.SETU7,
    Setu.SETU8, Setu.SETU9, Setu.SETU10, Setu.SETU11, Setu.SETU12, Setu.SETU1
];

// QseiDateクラスのシンプル実装
class QseiDate {
    constructor(year, monthIndex, dayIndex) {
        this._year = year;
        this._monthIndex = monthIndex;
        this._dayIndex = dayIndex;
    }

    get year() { return this._year; }
    get monthIndex() { return this._monthIndex; }

    static of(date) {
        let index = -1;
        let year = date.getYear();

        const beforeSetu = Setu.enters(date.getYear() - 1);
        const currentSetu = Setu.enters(date.getYear());

        if (date.compareTo(currentSetu[0]) < 0) {
            year--;
            const sep = beforeSetu[beforeSetu.length - 1];
            if (date.compareTo(sep) < 0) {
                index = 10;
            } else {
                index = 11;
            }
        } else {
            if (date.compareTo(currentSetu[1]) < 0) {
                index = 0;
            } else if (date.compareTo(currentSetu[2]) < 0) {
                index = 1;
            } else if (date.compareTo(currentSetu[3]) < 0) {
                index = 2;
            } else if (date.compareTo(currentSetu[4]) < 0) {
                index = 3;
            } else if (date.compareTo(currentSetu[5]) < 0) {
                index = 4;
            } else if (date.compareTo(currentSetu[6]) < 0) {
                index = 5;
            } else if (date.compareTo(currentSetu[7]) < 0) {
                index = 6;
            } else if (date.compareTo(currentSetu[8]) < 0) {
                index = 7;
            } else if (date.compareTo(currentSetu[9]) < 0) {
                index = 8;
            } else if (date.compareTo(currentSetu[10]) < 0) {
                index = 9;
            } else {
                index = 10;
            }
        }

        return new QseiDate(year, index, 0);
    }
}

// Qseiクラスのシンプル実装
class Qsei {
    constructor(index, houi, name, rubi, gogyou, hakka, kiban8) {
        this._index = index;
        this._houi = houi;
        this._name = name;
        this._rubi = rubi;
        this._gogyou = gogyou;
        this._hakka = hakka;
        this._kiban8 = kiban8;
        this._kiban12 = Qsei.toKiban12(kiban8);
    }

    get index() { return this._index; }
    get name() { return this._name; }
    get gogyou() { return this._gogyou; }

    static toKiban12(kibanSrc) {
        if (kibanSrc.length !== 8) {
            throw new Error("パラメータが規定値以外でした");
        }
        return [
            kibanSrc[0], kibanSrc[1], kibanSrc[1], kibanSrc[2], kibanSrc[3], kibanSrc[3],
            kibanSrc[4], kibanSrc[5], kibanSrc[5], kibanSrc[6], kibanSrc[7], kibanSrc[7]
        ];
    }

    static of(index) {
        return Qsei.ARRAYS[index];
    }

    static getYearSub(year) {
        let mod = year % 9;
        if (mod === 0) {
            mod = 9;
        } else if (mod === 1) {
            mod = 10;
        }
        return 11 - mod;
    }

    static getYear(date) {
        return Qsei.of(this.getYearSub(QseiDate.of(date).year));
    }

    static getMonth(date) {
        const qseiDate = QseiDate.of(date);
        const index2 = (Qsei.getYear(date).index - 1) % 3;
        return Qsei.of(Qsei.MONTH_TABLE[qseiDate.monthIndex][index2]);
    }

    findWaki() {
        return this.gogyou.shozoku.filter(val => val !== this.index);
    }

    findKipous() {
        let result = this.findWaki();
        result = result.concat(Gogyou.of(this.gogyou.seiki).shozoku);
        result = result.concat(Gogyou.of(this.gogyou.taiki).shozoku);
        result = result.filter(val => val !== 5);
        return result.sort();
    }
}

// Qseiの定数定義
Qsei.ONE = new Qsei(1, Houi.NORTH, "一白水星", "いっぱくすいせい", Gogyou.SUI_KIPOU, Hakka.KANKYUU_K, [6, 4, 8, 9, 5, 7, 3, 2]);
Qsei.TWO = new Qsei(2, Houi.SOUTH_WEST, "二黒土星", "じこくどせい", Gogyou.DO_KIPOU, Hakka.KONKYUU_K, [7, 5, 9, 1, 6, 8, 4, 3]);
Qsei.THREE = new Qsei(3, Houi.EAST, "三碧木星", "さんぺきもくせい", Gogyou.MOKU_KIPOU, Hakka.SINKYUU_K, [8, 6, 1, 2, 7, 9, 5, 4]);
Qsei.FOUR = new Qsei(4, Houi.SOUTH_EAST, "四緑木星", "しろくもくせい", Gogyou.MOKU_KIPOU, Hakka.SONKYUU_K, [9, 7, 2, 3, 8, 1, 6, 5]);
Qsei.FIVE = new Qsei(5, Houi.CHUUOU, "五黄土星", "ごおうどせい", Gogyou.DO_KIPOU, Hakka.TAIKYOKU, [1, 8, 3, 4, 9, 2, 7, 6]);
Qsei.SIX = new Qsei(6, Houi.NORTH_WEST, "六白金星", "ろっぱくきんせい", Gogyou.KIN_KIPOU, Hakka.KENKYUU_K, [2, 9, 4, 5, 1, 3, 8, 7]);
Qsei.SEVEN = new Qsei(7, Houi.WEST, "七赤金星", "しちせききんせい", Gogyou.KIN_KIPOU, Hakka.DAKYUU_K, [3, 1, 5, 6, 2, 4, 9, 8]);
Qsei.EIGHT = new Qsei(8, Houi.NORTH_EAST, "八白土星", "はっぱくどせい", Gogyou.DO_KIPOU, Hakka.GONKYUU_K, [4, 2, 6, 7, 3, 5, 1, 9]);
Qsei.NINE = new Qsei(9, Houi.SOUTH, "九紫火星", "きゅうしかせい", Gogyou.KA_KIPOU, Hakka.RIKYUU_K, [5, 3, 7, 8, 4, 6, 2, 1]);

Qsei.ARRAYS = [null, Qsei.ONE, Qsei.TWO, Qsei.THREE, Qsei.FOUR, Qsei.FIVE, Qsei.SIX, Qsei.SEVEN, Qsei.EIGHT, Qsei.NINE];

// 月盤テーブル
Qsei.MONTH_TABLE = [
    [8, 2, 5], // 2月
    [7, 1, 4], // 3月
    [6, 9, 3], // 4月
    [5, 8, 2], // 5月
    [4, 7, 1], // 6月
    [3, 6, 9], // 7月
    [2, 5, 8], // 8月
    [1, 4, 7], // 9月
    [9, 3, 6], // 10月
    [8, 2, 5], // 11月
    [7, 1, 4], // 12月
    [6, 9, 3], // 13月
];

// テストケースの実行
function testQseiCalculation() {
    console.log("九星気学ロジック検証テスト開始\n");

    // テストケース1: 1990年5月15日
    const testDate1 = LocalDate.of(1990, 5, 15);
    const yearQsei1 = Qsei.getYear(testDate1);
    const monthQsei1 = Qsei.getMonth(testDate1);

    console.log("テストケース1: 1990年5月15日");
    console.log(`年盤九星: ${yearQsei1.name} (${yearQsei1.index})`);
    console.log(`月盤九星: ${monthQsei1.name} (${monthQsei1.index})`);
    console.log(`年盤吉方位: ${yearQsei1.findKipous()}`);
    console.log(`月盤吉方位: ${monthQsei1.findKipous()}`);
    console.log("---");

    // テストケース2: 2023年12月25日
    const testDate2 = LocalDate.of(2023, 12, 25);
    const yearQsei2 = Qsei.getYear(testDate2);
    const monthQsei2 = Qsei.getMonth(testDate2);

    console.log("テストケース2: 2023年12月25日");
    console.log(`年盤九星: ${yearQsei2.name} (${yearQsei2.index})`);
    console.log(`月盤九星: ${monthQsei2.name} (${monthQsei2.index})`);
    console.log(`年盤吉方位: ${yearQsei2.findKipous()}`);
    console.log(`月盤吉方位: ${monthQsei2.findKipous()}`);
    console.log("---");

    // テストケース3: 2000年1月1日
    const testDate3 = LocalDate.of(2000, 1, 1);
    const yearQsei3 = Qsei.getYear(testDate3);
    const monthQsei3 = Qsei.getMonth(testDate3);

    console.log("テストケース3: 2000年1月1日");
    console.log(`年盤九星: ${yearQsei3.name} (${yearQsei3.index})`);
    console.log(`月盤九星: ${monthQsei3.name} (${monthQsei3.index})`);
    console.log(`年盤吉方位: ${yearQsei3.findKipous()}`);
    console.log(`月盤吉方位: ${monthQsei3.findKipous()}`);
    console.log("---");

    // 節入り日の確認
    console.log("節入り日の確認（2023年）:");
    const setu2023 = Setu.enters(2023);
    setu2023.forEach((date, index) => {
        console.log(`${index + 2}月節入り: ${date.toString()}`);
    });

    return {
        testCase1: { year: yearQsei1, month: monthQsei1 },
        testCase2: { year: yearQsei2, month: monthQsei2 },
        testCase3: { year: yearQsei3, month: monthQsei3 }
    };
}

// テスト実行
try {
    const results = testQseiCalculation();
    console.log("\nテスト完了");
} catch (error) {
    console.error("テスト実行中にエラーが発生しました:", error);
}