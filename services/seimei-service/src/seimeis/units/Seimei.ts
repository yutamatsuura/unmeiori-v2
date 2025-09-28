import Chara from "./Chara";
import Ngwords from "../components/Ngwords";


export default class Seimei {
    private _sei: ReadonlyArray<Chara>;
    private _mei: ReadonlyArray<Chara>;
    private _ngs:Array<Ngwords>;

    constructor(seis: Array<Chara>, meis: Array<Chara>,ngs:Array<Ngwords>) {
        this._sei = seis;
        this._mei = meis;
        this._ngs = ngs;
    }

    get ngs()
    {
        return this._ngs;
    }

    get sei() {
        return this._sei;
    }

    get mei() {
        return this._mei;
    }

    public allName() {
        let result = "";
        this.sei.forEach(val => {
            result += val.name;
        });

        this.mei.forEach(val => {
            result += val.name;
        });

        return result;
    }

    public allNameWithSpace() {
        let result = "";
        this.sei.forEach(val => {
            result += val.name;
        });

        result += " ";
        this.mei.forEach(val => {
            result += val.name;
        });

        return result;
    }

    get all() {
        return this._sei.slice().concat(this._mei);
    }
}