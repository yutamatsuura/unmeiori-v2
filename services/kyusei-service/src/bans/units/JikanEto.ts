import Eto from "./Eto";
import Jikan from "./Jikan";
import LocalDate from "../../times/LocalDate";
import QseiDate from "../dates/QseiDate";
import Nattin from "./Nattin";
import TypeUtils from "../../utils/TypeUtils";
import Eto60 from "./Eto60";





export default class JikanEto
{
    private _val:number;




 
    private constructor(val:number)
    {
        this._val = val;
    }

    get val()    
    {
        return this._val;    
    }
    

    public toString():string
    {
        return this.toJikan().name + this.toEto().name + "_" + this.val;    
    }

    get name():string
    {
        return this.toJikan().name + this.toEto().name;
    }

    public toEto60():Eto60
    {
        return Eto60.of(this._val);
    }


    public toEto():Eto
    {
        return Eto.of(this.val % 12);
    }    

    public toJikan():Jikan
    {
        return Jikan.of(this.val % 10);
    }    

    public toNattin():Nattin
    {
        let index = TypeUtils.toInt(this.val / 2);
        return Nattin.of(index);
    }

    private static toMJD(date: LocalDate): number {
        let y = date.getYear();
        let m = date.getMonthValue();
        let d = date.getDayOfMonth();
        if (m == 1) {
            m = 13;
            y = y - 1
        }
        else if (m == 2) {
            m = 14;
            y = y - 1
        }        

        return Math.floor(365.25 * y) + Math.floor(y / 400) - Math.floor(y / 100) + Math.floor(30.59 * (m - 2)) + d - 678912;
    }    

    
    public static ofDay(date: LocalDate):JikanEto {
        let mjd = JikanEto.toMJD(date);
        return new JikanEto((mjd + 50) % 60);
    }

    public static ofMonth(date:LocalDate):JikanEto{
        let qseiMonth = QseiDate.of(date);    
        let year = (qseiMonth.year + 1) % 5;
        return new JikanEto((year * 12 + qseiMonth.month12) % 60);        
    }
        
    public static ofYear(date: LocalDate):JikanEto {        
        let year = QseiDate.of(date).year;
        return new JikanEto((year + 56) % 60);
    }
}