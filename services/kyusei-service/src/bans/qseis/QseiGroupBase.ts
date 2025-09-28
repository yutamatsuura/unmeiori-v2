import Qsei from "./Qsei";
import LocalDate from "../../times/LocalDate";

export default abstract class QseiGroupBase {
    protected _year: Qsei;
    protected _month: Qsei;
    protected _day: Qsei;
    protected _date: LocalDate;

    constructor(year: Qsei, month: Qsei, day: Qsei, date: LocalDate) {
        this._year = year;
        this._month = month;
        this._day = day;
        this._date = date;
    }

    get year(): Qsei {
        return this._year;
    }

    get month(): Qsei {
        return this._month;
    }

    get day(): Qsei {
        return this._day;
    }

    get date(): LocalDate {
        return this._date;
    }

    public abstract maxKipous(): Array<number>;
    public abstract bigKipous(): Array<number>;
}