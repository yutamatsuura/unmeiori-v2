import LocalDate from "../times/LocalDate";


export default class DateUtils
{       
    private static readonly YOUBI_MAP = new Map<number,string>(
    [
        [1,"月"],
        [2,"火"],   
        [3,"水"],
        [4,"木"],
        [5,"金"],
        [6,"土"],
        [7,"日"],        
    ]
    );        

    public static getYoubi(val:number):string
    {
        return DateUtils.YOUBI_MAP.get(val);
    }
        
    

    static jpText(date: LocalDate): string {
        return date.getYear() + "年" + date.getMonthValue() + "月" + date.getDayOfMonth() + "日";
    }

    
    static jpMonthText(date: LocalDate): string {
        return date.getMonthValue() + "月" + date.getDayOfMonth() + "日";
    }

    public static max(a: LocalDate, b: LocalDate): LocalDate {
        if (a.compareTo(b) < 0) {
            // a < b
            return b;
        }
        else {
            return a;
        }
    }

    public static min(a: LocalDate, b: LocalDate): LocalDate {
        if (b.compareTo(a) < 0) {
            // b < a
            return b;
        }
        else {
            return a;
        }
    }


}