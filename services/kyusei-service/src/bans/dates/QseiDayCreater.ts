import QseiDay from "./QseiDay";
import JikanEto from "../units/JikanEto";
import Setu from "../units/Setu";
import LocalDate from "../../times/LocalDate";
import ChronoUnit from "../../times/ChronoUnit";
import DateUtils from "../../utils/DateUtils";
import Qsei from "../qseis/Qsei";




//日家九星を求めるクラス
//流派が様々あり、恣意的な気がする処理
//
//下記サイト参考 
//http://koyomi.vis.ne.jp/sub/rekicyuu_doc01.htm#9sei
//
//1900～2050年までの算出結果は、下記サイトと同一のため、問題なしと判断
//https://keisan.casio.jp/exec/system/1207304031

export default class QseiDayCreater {
    private qseiMap = new Map<string, QseiDay>();
 
    private static readonly JUDGE = LocalDate.of(2010,4,27);


    public create(begin: LocalDate, end: LocalDate): void {
        this.qseiMap.clear();

        //前年の夏至からスタート
        let current = QseiDayCreater.toKirikae(Setu.geshi(begin.getYear() - 1));        
        let exec:ExecBase = new GeshiExec(current);
        let qsei = exec.beginQsei(false);
        current = current.plusDays(1);
        let execs = new Array<ExecBase>();
        execs.push(exec);
        let i = 0;

        while (current.compareTo(end) <= 0) {
            let old = exec;
            exec = exec.changeAction(current);
            if (old == exec) {
                qsei = exec.action(qsei);
            }
            else {
                execs.push(exec);    
                qsei = exec.beginQsei(old.getNextModify());
                i = 0;
            }

            this.qseiMap.set(current.toString(), new QseiDay(current,i,exec.isPlus(), Qsei.of(qsei)));
            i++;
            current = current.plusDays(1);
        }

        //ステータステキストの作成        
        execs.forEach((exe)=>{            
            let solt = exe.getNextSolsticeDate();
            if(this.qseiMap.has(solt.toString()))
            {
                let val = this.qseiMap.get(solt.toString());
                val.isSoltice = true;
            }

            let kirikaeAfter = exe.getNextKirikae();
            if(this.qseiMap.has(kirikaeAfter.toString()))
            {
                let val = this.qseiMap.get(kirikaeAfter.toString());    
                val.isKirikaeAfter = true;
                val.kirikaeText = exe.getNextSolsticeText();
                if(exe.getNextModify())
                {
                    val.isUruu = true;                        
                }
            }    

            let kirikaeBefore = kirikaeAfter.minusDays(1);
            if(this.qseiMap.has(kirikaeBefore.toString()))
            {
                let val = this.qseiMap.get(kirikaeBefore.toString());    
                val.isKirikaeBefore = true;
            }                
        });
    }

    public getKeys(): IterableIterator<string> {
        return this.qseiMap.keys();
    }

    public getValue(date: string): QseiDay {
        return this.qseiMap.get(date);
    }


    public static isUruu(beforeKirikae: LocalDate, nextKirikae: LocalDate): boolean {
        let subDays = ChronoUnit.DAYS.between(beforeKirikae, nextKirikae);
        if (240 == subDays) {
            console.log("閏:",beforeKirikae,nextKirikae);
            return true;
        }
        else if (subDays != 180 && subDays != 210) {
            throw new Error("想定しない日数の差分が現れました" + subDays);
        }
        else {
            return false;
        }
    }
    

    public static getDay(date: LocalDate): QseiDay {        
        return QseiDayCreater.getDays([date])[0];
    }

    public static getDays(dates: Array<LocalDate>): Array<QseiDay> {
        let min = LocalDate.MAX;
        let max = LocalDate.MIN;

        dates.forEach((date) => {
            min = DateUtils.min(date, min);
            max = DateUtils.max(date, max);
        });

        let table = new QseiDayCreater();
        table.create(min, max);

        let result = new Array<QseiDay>();
        dates.forEach((date) => {
            {
                let info = table.getValue(date.toString());
                if (info == null) {
                    result.push(null);
                }
                else {
                    result.push(table.getValue(date.toString()));
                }
            }
        });

        return result;
    }

    public static toKirikae(date: LocalDate):LocalDate {
        let eto = JikanEto.ofDay(date).val;
        
        //28(壬辰)~29(癸巳)の扱い方が非常に絶妙かつ微妙
        //人間の手により操作された感がある？
        if(date.compareTo(this.JUDGE) <= 0)
        {
            //2010 4 27まで                
            if (eto <= 28) {
                // 冬至より前の日付を算出
                return date.minusDays(eto);
            }
            else {
                // 冬至より後の日付を算出    
                return date.plusDays(60 - eto);
            }
        }
        else
        {            
            if (eto <= 29) {
                // 冬至より前の日付を算出
                return date.minusDays(eto);
            }
            else {
                // 冬至より後の日付を算出    
                return date.plusDays(60 - eto);
            }
        }
    }
}




abstract class ExecBase {
    constructor() {

    }
    public abstract action(qsei: number): number;
    public changeAction(current: LocalDate): ExecBase {
        if (this.getNextKirikae().compareTo(current) <= 0) {
            return this.createNextExec(this.getNextKirikae());
        }
        return this;
    }

    public abstract isPlus(): boolean;
    public abstract getNextKirikae(): LocalDate;
    public abstract createNextExec(beforeKirikae: LocalDate): ExecBase;
    public abstract beginQsei(isModify: boolean): number;
    public abstract getNextModify(): boolean;
    public abstract getNextSolsticeDate(): LocalDate;
    public abstract getNextSolsticeText(): string;
}




//夏至＝＞冬至
class GeshiExec extends ExecBase {
    private mNextKirikae: LocalDate;
    private mIsUruu: boolean;
    private mNextSolstice: LocalDate;
    constructor(beforeKirikae: LocalDate) {
        super();    
        this.mNextSolstice = Setu.touji(beforeKirikae.getYear());
        this.mNextKirikae = QseiDayCreater.toKirikae(this.mNextSolstice);
        this.mIsUruu = QseiDayCreater.isUruu(beforeKirikae, this.mNextKirikae);
        if (this.mIsUruu) {
            this.mNextKirikae = this.mNextKirikae.minusDays(30);
        }
    }

    public getNextSolsticeText(): string {
        return "冬至";
    }


    public getNextSolsticeDate(): LocalDate {
        return this.mNextSolstice;
    }

    public getNextKirikae(): LocalDate {
        return this.mNextKirikae;
    }

    public action(qsei: number): number {
        let result = qsei - 1;
        if (result < 1) {
            result = 9;
        }

        return result;
    }

    public isPlus(): boolean {
        return false;
    }

    public createNextExec(beforeKirikae: LocalDate): ExecBase {
        return new ToujiExec(beforeKirikae);
    }

    public beginQsei(isModify: boolean): number {
        if (isModify) {
            return 3;
        }
        else {
            return 9;
        }
    }
    public getNextModify(): boolean {
        return this.mIsUruu;
    }
}

//冬至=>夏至
class ToujiExec extends ExecBase {
    private mNextSolstice: LocalDate;
    private mNextKirikae: LocalDate;
    private mIsUruu: boolean;
    constructor(beforeKirikae: LocalDate) {
        super();
        let year = beforeKirikae.getYear();
        if (beforeKirikae.getMonthValue() >= 10) {
            year++;
        }


        this.mNextSolstice = Setu.geshi(year);
        this.mNextKirikae = QseiDayCreater.toKirikae(this.mNextSolstice);
        this.mIsUruu = QseiDayCreater.isUruu(beforeKirikae, this.mNextKirikae);
        if (this.mIsUruu) {
            this.mNextKirikae = this.mNextKirikae.minusDays(30);
        }
    }

    public getNextSolsticeText():string {
        return "夏至";
    }

    
    public getNextSolsticeDate():LocalDate {
        return this.mNextSolstice;
    }

    public isPlus():boolean {
        return true;
    }

    public getNextKirikae():LocalDate {
        return this.mNextKirikae;
    }

    public action(qsei:number):number {
        let result = qsei + 1;
        if (9 < result) {
            result = 1;
        }

        return result;
    }
    
    public createNextExec(beforeKirikae:LocalDate):ExecBase    
    {
        return new GeshiExec(beforeKirikae);
    }

    public beginQsei(isModify:boolean):number
    {
        if (isModify) {
            return 7;
        }
        else {
            return 1;
        }
    }
    
    public getNextModify():boolean
    {
        return this.mIsUruu;
    }
}


