export default class Jikan {
    public static readonly KOU = new Jikan(0, "甲", "こう");
    public static readonly OTSU = new Jikan(1, "乙", "おつ");
    public static readonly HEI = new Jikan(2, "丙", "へい");
    public static readonly TEI = new Jikan(3, "丁", "てい");
    public static readonly BO = new Jikan(4, "戊", "ぼ");
    public static readonly KI = new Jikan(5, "己", "き");
    public static readonly KOU2 = new Jikan(6, "庚", "こう");
    public static readonly SHIN = new Jikan(7, "辛", "しん");
    public static readonly JIN = new Jikan(8, "壬", "じん");
    public static readonly GUI = new Jikan(9, "癸", "き");

    private static readonly JIKANS = [
        Jikan.KOU, Jikan.OTSU, Jikan.HEI, Jikan.TEI, Jikan.BO,
        Jikan.KI, Jikan.KOU2, Jikan.SHIN, Jikan.JIN, Jikan.GUI
    ];

    private _index: number;
    private _name: string;
    private _rubi: string;

    private constructor(index: number, name: string, rubi: string) {
        this._index = index;
        this._name = name;
        this._rubi = rubi;
    }

    get index(): number {
        return this._index;
    }

    get name(): string {
        return this._name;
    }

    get rubi(): string {
        return this._rubi;
    }

    public static of(index: number): Jikan {
        return Jikan.JIKANS[index % 10];
    }
}