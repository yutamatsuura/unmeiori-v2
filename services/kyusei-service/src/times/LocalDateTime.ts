import LocalDate from "./LocalDate";


//java.timeのLocalDateTimeと同じ
export default class LocalDateTime
{
    private date:Date;
    public static MAX = new LocalDateTime(new Date(8640000000000000));
    public static MIN = new LocalDateTime(new Date(-8640000000000000));

    private constructor(date:Date)
    {
        this.date = new Date(date.getTime());
    }

    public cloneDate():LocalDateTime
    {
        return LocalDateTime.of(this.getYear(),this.getMonthValue(),this.getDayOfMonth(),
        this.getHour(),
        this.getMinutes(),
        this.getSeconds(),
        this.getMilliseconds());
    }

    
    public static ofTime(date:Date):LocalDateTime
    {
        return new LocalDateTime(date);
    }
    

    public static of(year:number,month:number,day:number,hour=0,minute=0,seconds=0,ms=0):LocalDateTime
    {
        if(year <= 0 && year <= 100)
        {
            let date = new Date(year + 100,month - 1,day,hour,minute,seconds,ms);
            date.setFullYear(date.getFullYear() - 100);
            return new LocalDateTime(date);
        }
        else
        {
            return new LocalDateTime(new Date(year,month - 1,day,hour,minute,seconds,ms));
        }
    }        

    public static now():LocalDateTime
    {
        return new LocalDateTime(new Date());        
    }

    public plusSeconds(val:number):LocalDateTime
    {
        let date = this.cloneDate().date;
        date.setSeconds(date.getSeconds() + val);
        return new LocalDateTime(date);
    }

    public minusSeconds(val:number):LocalDateTime
    {
        return this.plusSeconds(-val);
    }


    public plusMinutes(val:number):LocalDateTime
    {
        let date = this.cloneDate().date;
        date.setMinutes(date.getMinutes() + val);
        return new LocalDateTime(date);     
    }

    
    public minusMinutes(val:number):LocalDateTime
    {
        return this.plusMinutes(-val);
    }

    public plusHours(val:number):LocalDateTime
    {
        let date = this.cloneDate().date;
        date.setHours(date.getHours() + val);
        return new LocalDateTime(date);       
    }


    public minusHours(val:number):LocalDateTime
    {
        return this.plusHours(-val);
    }

    public plusDays(val:number):LocalDateTime
    {
        let date = this.cloneDate().date;
        date.setDate(date.getDate() + val);
        return new LocalDateTime(date);     
    }

    public minusDays(val:number):LocalDateTime
    {
        return this.plusDays(-val);
    }

    public getYear():number
    {
        return this.date.getFullYear();
    }

    public getMilliseconds():number
    {
        return this.date.getMilliseconds();    
    }
    
    public getMonthValue():number
    {
        return this.date.getMonth() + 1;
    }

    public getDayOfMonth():number
    {
        return this.date.getDate();
    }

    public getMinutes():number
    {
        return this.date.getMinutes();
    }    

    public getHour():number
    {
        return this.date.getHours();
    }

    public getSeconds():number
    {
        return this.date.getSeconds();
    }    
    
    public equals(b:LocalDateTime):boolean
    {
        return this.date.getTime() === b.date.getTime();    
    }

    public toLocalDate():LocalDate
    {
        return LocalDate.of(this.getYear(),this.getMonthValue(),this.getDayOfMonth());        
    }

    public getTime():number
    {
        return this.date.getTime();
    }

    public compareTo(b:LocalDateTime):number    
    {
        let sub = this.date.getTime() - b.date.getTime();
        if(sub === 0)
        {
            return 0;    
        }
        else if(sub < 0)
        {
            return -1;    
        }
        else
        {
            return 1;    
        }
    }
    
    public toString():string
    {
        return this.getYear() + "-" + this.getMonthValue() + "-" + this.getDayOfMonth() + 
            " " + this.getHour() + ":"  + this.getMinutes() + ":" + this.getSeconds();
    }
}
