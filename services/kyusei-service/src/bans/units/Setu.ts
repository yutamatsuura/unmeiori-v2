import TypeUtils from "../../utils/TypeUtils";
import LocalDate from "../../times/LocalDate";


interface ISetu {
    month: number;
    D: number;
    A: number;
    year: number;
}

//節入りを求めるクラス
//詳しくは下記サイト参照
//http://addinbox.sakura.ne.jp/sekki24_topic.htm
export default class Setu {
    public static readonly SETU2 = { month: 2, D: 4.8693, A: 0.242713, year: -1 };
    public static readonly SETU3 = { month: 3, D: 6.3968, A: 0.242512, year: 0 };
    public static readonly SETU4 = { month: 4, D: 5.6280, A: 0.242231, year: 0 };
    public static readonly SETU5 = { month: 5, D: 6.3771, A: 0.241945, year: 0 };
    public static readonly SETU6 = { month: 6, D: 6.5733, A: 0.241731, year: 0 };
    public static readonly SETU7 = { month: 7, D: 8.0091, A: 0.241642, year: 0 };
    public static readonly SETU8 = { month: 8, D: 8.4102, A: 0.241703, year: 0 };
    public static readonly SETU9 = { month: 9, D: 8.5186, A: 0.241898, year: 0 };
    public static readonly SETU10 = { month: 10, D: 9.1414, A: 0.242179, year: 0 };
    public static readonly SETU11 = { month: 11, D: 8.2396, A: 0.242469, year: 0 };
    public static readonly SETU12 = { month: 12, D: 7.9152, A: 0.242689, year: 0 };
    public static readonly SETU1 = { month: 1, D: 6.3811, A: 0.242778, year: -1 };


    public static readonly GESHI = { month: 6, D: 22.2747, A: 0.241669, year: 0 };
    public static readonly TOUJI = { month: 12, D: 22.6587, A: 0.242752, year: 0 };

    public static readonly DOYOU4 = { month: 4, D: 17.8647, A: 0.242113, year: 0 };
    public static readonly DOYOU7 = { month: 7, D: 20.5896, A: 0.241649, year: 0 };
    public static readonly DOYOU10 = { month: 10, D: 21.2361, A: 0.242298, year: 0 };
    public static readonly DOYOU1 = { month: 1, D: 18.1552, A: 0.242770, year: -1 };

    public static readonly DOYOU_ENTERS = [
        Setu.DOYOU4,
        Setu.DOYOU7,
        Setu.DOYOU10,
        Setu.DOYOU1,
    ];

    public static readonly DOYOU_EXISTS = [
        Setu.SETU5,
        Setu.SETU8,
        Setu.SETU11,
        Setu.SETU2,
    ];

    public static readonly SETU_ENTER = [
        Setu.SETU2,
        Setu.SETU3,
        Setu.SETU4,
        Setu.SETU5,
        Setu.SETU6,
        Setu.SETU7,
        Setu.SETU8,
        Setu.SETU9,
        Setu.SETU10,
        Setu.SETU11,
        Setu.SETU12,
        Setu.SETU1
    ];

    public static readonly SETU_NUM = Setu.SETU_ENTER.length;

    private static calc(year: number, setu: ISetu): LocalDate {
        let D = setu.D;
        let A = setu.A;
        let Y = year + setu.year;
        let day = TypeUtils.toInt(D + (A * (Y - 1900))) - TypeUtils.toInt((Y - 1900) / 4);
        return LocalDate.of(year, setu.month, day);
    }

    public static getDoyouBegin(year: number, index: number): LocalDate {
        if (index === Setu.DOYOU_ENTERS.length - 1) {
            year++;
        }

        let result = Setu.calc(year, Setu.DOYOU_ENTERS[index]);
        return result;
    }

    public static getDoyouEnd(year:number,index:number)
    {
        if (index === Setu.DOYOU_EXISTS.length - 1) {
            year++;
        }

        let result = Setu.calc(year, Setu.DOYOU_EXISTS[index]);
        return result;
    }

    public static geshi(year: number): LocalDate {
        let result = Setu.calc(year, Setu.GESHI);
        return result;
    }

    public static touji(year: number): LocalDate {
        let result = Setu.calc(year, Setu.TOUJI);
        return result;
    }

    public static enters(year: number): Array<LocalDate> {
        let result = new Array<LocalDate>();
        this.SETU_ENTER.forEach((_, index) => {
            result.push(Setu.enter(year, index));
        });

        return result;
    }

    public static enter(year: number, index: number) {
        if (index === Setu.SETU_ENTER.length - 1) {
            year++;
        }

        let result = Setu.calc(year, Setu.SETU_ENTER[index]);
        return result;
    }
}