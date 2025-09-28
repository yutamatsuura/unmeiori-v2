import LocalDateTime from "./LocalDateTime";



//java.timeのLocalDateと同じ
export default class LocalDate
{
    private date:Date;
    public static MAX = LocalDate.of(9999,12,31);
    public static MIN = LocalDate.of(-1000,1,1);


    private constructor(date:Date)
    {
        this.date = new Date(date.getTime());        
    }

    public getRaw():Date
    {
        return this.date;    
    }

    public static of(year:number,month:number,day:number):LocalDate
    {
        if(0 <= year  && year <= 1000)
        {                
            let date = new Date(year + 1000,month - 1,day,0,0,0,0);
            date.setFullYear(date.getFullYear() - 1000);            
            let result= new LocalDate(date);
            return result;            
        }
        else
        {
            return new LocalDate(new Date(year,month - 1,day,0,0,0,0));
        }
    }        


    public static ofDate(date:Date):LocalDate
    {
        //時、分、秒を切り捨てるため、一端LocalDateTimeにおとす。
        let local = LocalDateTime.ofTime(date);
        return LocalDate.of(local.getYear(),
        local.getMonthValue(),
        local.getDayOfMonth());
    }

    public static ofTime(time:number):LocalDate
    {
        return LocalDate.ofDate(new Date(time));
    }        

    public static parse(text:string):LocalDate
    {
        return new LocalDate(new Date(text));
    }

    public static now():LocalDate
    {
        return LocalDate.ofDate(new Date());
    }

    public getDate()
    {
        return this.date;    
    }


  
    public plusDays(val:number):LocalDate
    {
        let date = LocalDate.of(this.getYear(),this.getMonthValue(),this.getDayOfMonth()).date;
        date.setDate(date.getDate() + val);
        return new LocalDate(date);     
    }

    public plusMonths(val:number):LocalDate
    {
        let date = LocalDate.of(this.getYear(),this.getMonthValue(),this.getDayOfMonth()).date;
        date.setMonth(date.getMonth() + val);
        return new LocalDate(date);     
    }    

    public plusYears(val:number):LocalDate
    {
        let date = LocalDate.of(this.getYear(),this.getMonthValue(),this.getDayOfMonth()).date;
        date.setFullYear(date.getFullYear() + val);
        return new LocalDate(date);     
    }    

    public minusDays(val:number):LocalDate
    {
        return this.plusDays(-val);
    }

    public minusMonths(val:number):LocalDate
    {
        return this.plusMonths(-val);
    }

    public minusYears(val:number):LocalDate
    {
        return this.plusYears(-val);
    }

    public getYear():number
    {
        return this.date.getFullYear();
    }

    public getDayofWeek():number
    {
        let result =  this.date.getDay();
        //日曜日は7
        if(result == 0)
        {
            return 7;    
        }
        else
        {
            return result;    
        }
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
    
    public equals(b:LocalDate):boolean
    {
        return this.date.getTime() === b.date.getTime();
    }

    public getTime():number
    {
        return this.date.getTime();
    }

    public compareTo(b:LocalDate):number    
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
        return this.getYear() + "-" + this.getMonthValue() + "-" + this.getDayOfMonth();
    }
}
