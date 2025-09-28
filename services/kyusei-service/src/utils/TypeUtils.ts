import LocalDate from "../times/LocalDate";

//型変換を行うクラス
export default class TypeUtils
{
    public static toInt(val:number):number
    {
        return parseInt(String(val));
    }    

    public static jpTimeToDate(val:string):LocalDate
    {
        let years = val.split("年");
        if(years.length <= 1)
        {
            return null;    
        }
        let year = years[0];
        let months = years[1].split("月");
        if(months.length <= 1)
        {
            return null;    
        }
        let month = months[0];
        let days = months[1].split("日");
        if(days.length <= 1)
        {
            return null;    
        }
        let day = days[0];

        return LocalDate.of(Number(year),Number(month),Number(day));
    }
}