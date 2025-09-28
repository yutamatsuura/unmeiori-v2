import Qsei from "../qseis/Qsei";
import JikanEto from "./JikanEto";
import LocalDate from "../../times/LocalDate";
import Sangou from "./Sangou";
import Houi from "./Houi";
import QseiDate from "../dates/QseiDate";
import KibanConfig from "../Config";
import Config from "../Config";
import QseiGroupBase from "../qseis/QseiGroupBase";


abstract class KipouCreaterBase {
    protected kiban8: Array<number>;
    protected hakaiIndex: number;
    protected birthYear: Qsei;
    protected birthMonth: Qsei;
    protected maxKipous: Array<number>;
    protected bigKipous: Array<number>;
    protected doukaiValue: number;
    protected currentQsei: Qsei;
    protected isTarget: boolean;
    protected taisaiIndex: number;
    constructor(currentQsei: Qsei, birth: QseiGroupBase, current: QseiGroupBase) {
        this.isTarget = (current.date.equals(birth.date) == false);
        this.currentQsei = currentQsei;
        this.kiban8 = currentQsei.kiban8;
        this.taisaiIndex = this.getJikanEto(current.date).toEto().houi.index;
        this.hakaiIndex = this.getJikanEto(current.date).toEto().houi.rev().index;
        this.birthYear = birth.year;
        this.birthMonth = birth.month;
        this.maxKipous = birth.maxKipous();
        this.bigKipous = birth.bigKipous();
        let nenban3Index = currentQsei.kiban8.findIndex((val) => {
            return this.birthYear.index === val;
        });
        if (0 <= nenban3Index) {
            this.doukaiValue = Qsei.KOUTEN_JOUI.kiban8[nenban3Index];
        }
    }

    protected abstract getHakaiName(): Kipou
    protected abstract getTaisaiName(): Kipou
    protected abstract getJikanEto(date: LocalDate): JikanEto;


    protected effectSub(index: number): Array<Kipou> {
        let result = new Array<Kipou>();
        let k = this.kiban8[index];
        if (k == 5) {
            result.push(Kipou.GOOU);
        }
        let ans = this.kiban8[(index + 4) % 8];
        if (ans == 5) {
            result.push(Kipou.ANKEN);
        }


        if (this.hakaiIndex == index) {
            result.push(this.getHakaiName());
        }

        if (this.taisaiIndex == index) {
            result.push(this.getTaisaiName());
        }


        let honMeiIndex = this.kiban8.findIndex((val) => {
            return val === this.birthYear.index;
        });
        let honMeiTekiIndex = honMeiIndex === -1 ? -1 : (honMeiIndex + 4) % 8;
        if (k == this.kiban8[honMeiIndex]) {
            result.push(Kipou.HONMEI);
        }

        if (k == this.kiban8[honMeiTekiIndex]) {
            result.push(Kipou.HONMEI_TEKI);
        }

        let getuMeiIndex = this.kiban8.findIndex((val) => {
            return val === this.birthMonth.index;
        });
        let getuMeiTekiIndex = getuMeiIndex === -1 ? - 1 : (getuMeiIndex + 4) % 8;

        if (k == this.kiban8[getuMeiIndex]) {
            result.push(Kipou.GETUMEI);
        }

        if (k == this.kiban8[getuMeiTekiIndex]) {
            result.push(Kipou.GETUMEI_TEKI);
        }

        if (Qsei.of(k).houi.rev().index === index) {
            result.push(Kipou.TEII_TEKI);
        }


        this.maxKipous.forEach((i) => {
            if (k == i) {
                result.push(Kipou.SAIDAI);
            }
        });


        this.bigKipous.forEach((i) => {
            if (k == i) {
                result.push(Kipou.DAIKI);
            }
        });

        //currentとbirthdate二つの時刻が与えられた場合にのみ実行
        if (this.isTarget) {
            if (k == this.doukaiValue) {
                result.push(Kipou.DOUKAI);
            }
        }

        return result;
    }

    public effects(): Array<Array<Kipou>> {
        let result = new Array<Array<Kipou>>();
        this.kiban8.forEach((kiban, i) => {
            result.push(this.effectSub(i));
        });

        return result;
    }
}

class YearKipouCreater extends KipouCreaterBase {
    private daisangouHoui: Houi;
    constructor(birth:QseiGroupBase, current: QseiGroupBase) {
        super(current.year, birth,current);
        this.daisangouHoui = Sangou.ofDaisangou(JikanEto.ofYear(current.date).toEto()).houi;
    }

    protected getHakaiName(): Kipou {
        return Kipou.SAIHA;
    }

    protected getTaisaiName(): Kipou {
        return Kipou.TAISAI;
    }

    protected getJikanEto(date: LocalDate): JikanEto {
        return JikanEto.ofYear(date);
    }

    protected effectSub(index: number): Array<Kipou> {
        let result = super.effectSub(index);
        if (index === this.daisangouHoui.index) {
            result.push(Kipou.DAISAN);
        }

        return result;
    }
}

class MonthKipouCreater extends KipouCreaterBase {
    private tendou: Houi;
    private koji: Qsei;
    private rinjuUse = false;
    constructor(birth:QseiGroupBase, current:QseiGroupBase) {
        super(current.month, birth, current);
        this.tendou = Houi.TENDO[QseiDate.of(current.date).monthIndex];
        this.koji = Qsei.of(JikanEto.ofYear(current.date).toEto().koji);
        let currentYearQsei = current.year;
        this.rinjuUse = currentYearQsei.index == this.currentQsei.index;
    }

    protected getHakaiName(): Kipou {
        return Kipou.GEPPA;
    }

    protected getJikanEto(date: LocalDate): JikanEto {
        return JikanEto.ofMonth(date);
    }

    protected getTaisaiName(): Kipou {
        return Kipou.GEKKEN;
    }

    protected effectSub(index: number): Array<Kipou> {
        let result = super.effectSub(index);
        if (this.tendou.index === index) {
            result.push(Kipou.TENDOU);
        }

        if (this.isTarget) {
            let k = this.kiban8[index];
            if (k == this.koji.index) {
                result.push(Kipou.KOJI);
            }
        }

        if (this.rinjuUse && this.isTarget && this.isRinju(index)) {
            let kyous = result.filter((d) => {
                return d.kipou == false;
            });
            if (0 < kyous.length) {
                result.push(Kipou.RINJUU_KYOU);
            }
            else {
                let kipous = result.filter((d) => {
                    return d.kipou == true;
                });
                if (0 < kipous.length) {
                    result.push(Kipou.RINJUU_KITI);
                }
            }
        }

        return result;
    }

    //輪重（輪重吉方、輪重凶報）かを判定
    private isRinju(index: number): boolean {
        let k = this.kiban8[index];
        let index1Senten = Qsei.SENTEN_JOUI.kiban8.findIndex((d) => {
            return d == k;
        });

        if (index1Senten < 0) {
            return false;
        }
        let index2Senten = Houi.of(index1Senten).rev().index;
        let value2Senten = Qsei.SENTEN_JOUI.kiban8[index2Senten];
        let index3Kouten = Qsei.KOUTEN_JOUI.kiban8.findIndex((d) => {
            return d == value2Senten;
        });

        if (index3Kouten < 0) {
            return false;
        }

        return index3Kouten == index;
    }
}

class DayKipouCreater extends KipouCreaterBase {
    private tendou: Houi;

    constructor(birth:QseiGroupBase, current:QseiGroupBase) {
        super(current.day, birth, current);
        this.tendou = Houi.TENDO[QseiDate.of(current.date).monthIndex];
    }

    protected getHakaiName(): Kipou {
        return Kipou.NIPPA;
    }

    protected getJikanEto(date: LocalDate): JikanEto {
        return JikanEto.ofDay(date);
    }

    protected getTaisaiName(): Kipou {
        return Kipou.NISSIN;
    }


    protected effectSub(index: number): Array<Kipou> {
        let result = super.effectSub(index);
        if (this.tendou.index === index) {
            result.push(Kipou.TENDOU);
        }

        return result;
    }
}






export default class Kipou {
    public static readonly DEFAULT_FONT = "black";

    //吉方より凶の方を優先するため、この並び順
    public static readonly TYPE_KYOU = 2;
    public static readonly TYPE_KIPOU = 1;
    public static readonly TYPE_NORMAL = 0;


    //吉方位
    public static readonly SAIDAI = new Kipou(KibanConfig.SAIDAI, "最大吉方", true);
    public static readonly DAIKI = new Kipou(KibanConfig.DAIKI, "吉方", true);
    public static readonly DOUKAI = new Kipou(KibanConfig.DOUKAI, "同会吉方", true);
    public static readonly RINJUU_KITI = new Kipou(KibanConfig.RINJU_KITI, "輪重吉方", true);
    public static readonly TENDOU = new Kipou(KibanConfig.TENDO, "天道", true);
    public static readonly DAISAN = new Kipou(KibanConfig.DAISAN, "大三合", true);
    public static readonly TAISAI = new Kipou(KibanConfig.TAISAI, "太歳", true);
    public static readonly GEKKEN = new Kipou(KibanConfig.GEKKEN, "月建", true);
    public static readonly NISSIN = new Kipou(KibanConfig.NISSIN, "日辰", true);

    //凶方位
    public static readonly GOOU = new Kipou(KibanConfig.GOOU, "五黄殺", false);
    public static readonly ANKEN = new Kipou(KibanConfig.ANKEN, "暗剣殺", false);
    public static readonly HONMEI = new Kipou(KibanConfig.HONMEI, "本命殺", false);
    public static readonly GETUMEI = new Kipou(KibanConfig.GETUMEI, "月命殺", false);
    public static readonly SAIHA = new Kipou(KibanConfig.SAIHA, "歳破", false);
    public static readonly GEPPA = new Kipou(KibanConfig.GEPPA, "月破", false);
    public static readonly NIPPA = new Kipou(KibanConfig.NIPPA, "日破", false);
    public static readonly HONMEI_TEKI = new Kipou(KibanConfig.HONMEI_TEKI, "本命的殺", false);
    public static readonly GETUMEI_TEKI = new Kipou(KibanConfig.GETUMEI_TEKI, "月命的殺", false);
    public static readonly KOJI = new Kipou(KibanConfig.KOJI, "小児殺", false);
    public static readonly RINJUU_KYOU = new Kipou(KibanConfig.RINJU_KYOU, "輪重凶方", false);
    public static readonly TEII_TEKI = new Kipou(KibanConfig.TEII_TEKI, "定位対冲", false);


    private _kipou: boolean;
    private _name: string;
    private _type: number;
    private _id: string;

    private static readonly KIPOU_LIST = [
        Kipou.SAIDAI,
        Kipou.DAIKI,
        Kipou.DOUKAI,
        Kipou.RINJUU_KITI,
        Kipou.TENDOU,
        Kipou.DAISAN,
        Kipou.TAISAI,
        Kipou.GEKKEN,
        Kipou.NISSIN,

        Kipou.GOOU,
        Kipou.ANKEN,
        Kipou.HONMEI,
        Kipou.GETUMEI,
        Kipou.SAIHA,
        Kipou.GEPPA,
        Kipou.NIPPA,
        Kipou.HONMEI_TEKI,
        Kipou.GETUMEI_TEKI,
        Kipou.KOJI,
        Kipou.RINJUU_KYOU,
        Kipou.TEII_TEKI
    ];

    private static readonly KIPOU_MAP = new Map<string, Kipou>();

    static static_constructor() {
        Kipou.KIPOU_LIST.forEach((kipou) => {
            Kipou.KIPOU_MAP.set(kipou.id, kipou);
        });
    }

    public static of(id: string): Kipou {
        return Kipou.KIPOU_MAP.get(id);
    }

    private constructor(id: string, name: string, kipou: boolean) {
        this._id = id;
        this._name = name;
        this._kipou = kipou;
        if (kipou) {
            this._type = Kipou.TYPE_KIPOU;
        }
        else {
            this._type = Kipou.TYPE_KYOU;
        }
    }

    get type(): number {
        return this._type;
    }


    get id(): string {
        return this._id;
    }

    get enableId(): string {
        return Config.getEnableId(this._id);
    }

    get kipou(): boolean {
        return this._kipou;
    }


    get name(): string {
        return this._name;
    }

    get fontColor(): string {
        if (this._type == Kipou.TYPE_KIPOU) {
            return "red";
        }
        else if (this._type == Kipou.TYPE_KYOU) {
            return "black";
        }
        else {
            return "";
        }
    }

    public toString(): string {
        return this._name;
    }



    public static birthOfYear(birthGroup: QseiGroupBase): Array<Array<Kipou>> {
        let result = new YearKipouCreater(
            birthGroup,
            birthGroup
        ).effects();
        return result;
    }


    public static birthOfMonth(birthGroup: QseiGroupBase): Array<Array<Kipou>> {
        return new MonthKipouCreater(
            birthGroup,
            birthGroup,
        ).effects();
    }

    public static birthOfDay(birthGroup:QseiGroupBase): Array<Array<Kipou>> {
        let result = new DayKipouCreater(
            birthGroup,
            birthGroup            
        ).effects();
        return result;
    }



    public static currentOfYear(birthGroup:QseiGroupBase, currentGroup:QseiGroupBase): Array<Array<Kipou>> {
        return new YearKipouCreater(
            birthGroup,
            currentGroup,
        ).effects();
    }

    public static currentOfMonth(birthGroup:QseiGroupBase, currentGroup:QseiGroupBase): Array<Array<Kipou>> {
        return new MonthKipouCreater(
            birthGroup,
            currentGroup        
        ).effects();
    }

    public static currentOfDay(birthGroup: QseiGroupBase, currentGroup:QseiGroupBase): Array<Array<Kipou>> {
        return new DayKipouCreater(
            birthGroup,
            currentGroup
        ).effects();
    }
}


Kipou.static_constructor();