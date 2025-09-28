import LocalDate from "../../times/LocalDate";
import Setu from "../units/Setu";
import ChronoUnit from "../../times/ChronoUnit";
import TypeUtils from "../../utils/TypeUtils";


//九星の特殊な（ややこしい）月を管理するクラス
//このクラスにより簡単に九星の日付を取得できる。
export default class QseiDate
{
    private _year:number;
    private _monthIndex:number;
    private _dayIndex:number;

    private constructor(year:number,monthIndex:number,dayIndex:number)    
    {
        this._year = year;    
        this._monthIndex = monthIndex;    
        this._dayIndex = dayIndex;
    }

    public getYearBegin():LocalDate
    {
        return Setu.enter(this._year,0);
    }

    public getYearEnd():LocalDate
    {
        return Setu.enter(this._year + 1,0).minusDays(1);
    }

    public getMonthBegin():LocalDate
    {
        let result = Setu.enter(this._year,this._monthIndex);
        return result;        
    }

    public getMonthBegins():Array<LocalDate>
    {    
        return Setu.enters(this._year);
    }

    public getMonthEnd():LocalDate
    {
        if(this.monthIndex + 1 < Setu.SETU_NUM)
        {                
            return Setu.enter(this._year,this._monthIndex + 1).minusDays(1);                
        }
        else
        {
            return Setu.enter(this._year + 1,0).minusDays(1);
        }                
    }

    public static readonly DOYOUS = new Set<number>(
        [2,5,8,11],
    );        


    public isDoyou():boolean
    {
        if(QseiDate.DOYOUS.has(this._monthIndex))    
        {
            let index = TypeUtils.toInt(this._monthIndex / 3);
            let doyouBegin = Setu.getDoyouBegin(this._year,index);
            let doyouEnd = Setu.getDoyouEnd(this._year,index);        
            let current = this.date;            
            return (doyouBegin.compareTo(current) <= 0 && current.compareTo(doyouEnd) < 0 );                    
        }
        else
        {
            return false;    
        }        
    }    

    get monthIndex()
    {
        return this._monthIndex;    
    }    

    get dayIndex()
    {
        return this._dayIndex;    
    }    

    get date():LocalDate
    {
        return this.getMonthBegin().plusDays(this._dayIndex);
    }

    get year():number
    {
        return this._year;    
    }

    public getTouji():LocalDate
    {
        return Setu.touji(this._year);
    }

    public getGeshi():LocalDate
    {
        return Setu.geshi(this._year);
    }    
    
    //１月～２月
    get month12()
    {
        let val = (this._monthIndex + 2);
        if(12 < val)
        {
            val -= 12;    
        }
        return val;
    }

    //２月～１３月    
    get month13()
    {
        return (this._monthIndex + 2);        
    }    

      
    public static of(date: LocalDate): QseiDate {                    
        let index = -1;
        let year = date.getYear();

        let beforeSetu = Setu.enters(date.getYear() - 1);
        let currentSetu = Setu.enters(date.getYear());
        
        if (date.compareTo(currentSetu[0]) < 0){
            year--;    
            //前年系
            let sep = beforeSetu[beforeSetu.length - 1];
            if (date.compareTo(sep) < 0) {
                //12月        
                 index = 10;
            }
            else {
                //13月
                index = 11;
            }
        }
        else {
            //今年系            
            if (date.compareTo(currentSetu[1]) < 0) {                    
                index = 0; //2月
            }
            else if (date.compareTo(currentSetu[2]) < 0) {
                index = 1; //3月
            }
            else if (date.compareTo(currentSetu[3]) < 0) {
                index = 2; //4月
            }
            else if (date.compareTo(currentSetu[4]) < 0) {
                index = 3; //5月
            }
            else if (date.compareTo(currentSetu[5]) < 0) {
                index = 4; //6月
            }
            else if (date.compareTo(currentSetu[6]) < 0) {
                index = 5; //7月
            }
            else if (date.compareTo(currentSetu[7]) < 0) {
                index = 6; //8月
            }
            else if (date.compareTo(currentSetu[8]) < 0) {
                index = 7; //9月
            }
            else if (date.compareTo(currentSetu[9]) < 0) {
                index = 8; //10月
            }
            else if(date.compareTo(currentSetu[10]) < 0){
                index = 9; //11月
            }
            else
            {
                index = 10; //12月
            }
        }

        let dayIndex = ChronoUnit.DAYS.between(Setu.enter(year,index),date);
        return new QseiDate(year,index,dayIndex);
    }


    public plusMonths(month:number):QseiDate
    {
        let newYear = this._year + (this._monthIndex + month) / Setu.SETU_NUM;
        let newMonth = (this._monthIndex + month) % Setu.SETU_NUM;
        let newDay = this._dayIndex
            
        if(newMonth < 0)        
        {
            newMonth += Setu.SETU_NUM;            
        }        
        return new QseiDate(newYear,newMonth,newDay);
    }

    public minusMonths(month:number):QseiDate
    {
        return this.plusMonths(-month);
    }

    public plusYears(year:number):QseiDate
    {
        return new QseiDate(this._year + year,this._monthIndex,this._dayIndex);
    }

    
    public minusYears(year:number):QseiDate
    {
        return this.plusYears(-1);
    }

    //plus daysは境界値が大変なので楽して実装
    public plusDays(days:number):QseiDate
    {
        let localDate = this.date.plusDays(days);
        return QseiDate.of(localDate);
    }

    public minusDays(days:number):QseiDate
    {
        return this.plusDays(-days);
    }

}