export default class Nattin {
    public static readonly KOSHI = new Nattin(0, "甲子", "こうし");
    public static readonly INCHU = new Nattin(1, "乙丑", "いっちゅう");
    public static readonly HEIYIN = new Nattin(2, "丙寅", "へいいん");
    public static readonly TEIBOU = new Nattin(3, "丁卯", "ていぼう");
    public static readonly BOSHIN = new Nattin(4, "戊辰", "ぼしん");
    public static readonly KISHI = new Nattin(5, "己巳", "きし");
    public static readonly KOUGO = new Nattin(6, "庚午", "こうご");
    public static readonly SHINHI = new Nattin(7, "辛未", "しんび");
    public static readonly JINSHIN = new Nattin(8, "壬申", "じんしん");
    public static readonly KIYUU = new Nattin(9, "癸酉", "きゆう");
    public static readonly KOUJUTU = new Nattin(10, "甲戌", "こうじゅつ");
    public static readonly INGAI = new Nattin(11, "乙亥", "いんがい");
    public static readonly HEISHI = new Nattin(12, "丙子", "へいし");
    public static readonly TEICHU = new Nattin(13, "丁丑", "ていちゅう");
    public static readonly BOYIN = new Nattin(14, "戊寅", "ぼいん");
    public static readonly KIBOU = new Nattin(15, "己卯", "きぼう");
    public static readonly KOUSHIN = new Nattin(16, "庚辰", "こうしん");
    public static readonly SHINSHI = new Nattin(17, "辛巳", "しんし");
    public static readonly JINGO = new Nattin(18, "壬午", "じんご");
    public static readonly KIHI = new Nattin(19, "癸未", "きび");
    public static readonly KOUSHIN2 = new Nattin(20, "甲申", "こうしん");
    public static readonly INYUU = new Nattin(21, "乙酉", "いんゆう");
    public static readonly HEIJUTU = new Nattin(22, "丙戌", "へいじゅつ");
    public static readonly TEIGAI = new Nattin(23, "丁亥", "ていがい");
    public static readonly BOSHI = new Nattin(24, "戊子", "ぼし");
    public static readonly KICHU = new Nattin(25, "己丑", "きちゅう");
    public static readonly KOUYIN = new Nattin(26, "庚寅", "こういん");
    public static readonly SHINBOU = new Nattin(27, "辛卯", "しんぼう");
    public static readonly JINSHIN2 = new Nattin(28, "壬辰", "じんしん");
    public static readonly KISHI2 = new Nattin(29, "癸巳", "きし");

    private static readonly NATTINS = [
        Nattin.KOSHI, Nattin.INCHU, Nattin.HEIYIN, Nattin.TEIBOU, Nattin.BOSHIN,
        Nattin.KISHI, Nattin.KOUGO, Nattin.SHINHI, Nattin.JINSHIN, Nattin.KIYUU,
        Nattin.KOUJUTU, Nattin.INGAI, Nattin.HEISHI, Nattin.TEICHU, Nattin.BOYIN,
        Nattin.KIBOU, Nattin.KOUSHIN, Nattin.SHINSHI, Nattin.JINGO, Nattin.KIHI,
        Nattin.KOUSHIN2, Nattin.INYUU, Nattin.HEIJUTU, Nattin.TEIGAI, Nattin.BOSHI,
        Nattin.KICHU, Nattin.KOUYIN, Nattin.SHINBOU, Nattin.JINSHIN2, Nattin.KISHI2
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

    public static of(index: number): Nattin {
        return Nattin.NATTINS[index % 30];
    }
}