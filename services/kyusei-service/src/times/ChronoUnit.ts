import LocalDate from "./LocalDate";

class YearSub {
    public between(from: LocalDate, to: LocalDate): number {
        const y2 = from.getYear().toString().padStart(4, '0');
        const m2 = from.getMonthValue().toString().padStart(2, '0');
        const d2 = from.getDayOfMonth().toString().padStart(2, '0');

        const y1 = to.getYear().toString().padStart(4, '0');
        const m1 = to.getMonthValue().toString().padStart(2, '0');
        const d1 = to.getDayOfMonth().toString().padStart(2, '0');
        return Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000);
    }
}

class DaySub {
    public between(from: LocalDate, to: LocalDate): number {
        return  Math.round((to.getTime() - from.getTime()) / 86400000);            
    }        
}    


export default class ChronoUnit {
    public static YEARS = new YearSub();
    public static DAYS = new DaySub();
}