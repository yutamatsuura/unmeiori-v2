import Gogyou from "./Gogyou";
import YouIn from "./YouIn";


export default class Chara
{
    private _name:string;
    private _kakusu:number;
    private _kana:string;
    private _gogyou:Gogyou;
    private _youin:YouIn;
    private _isBunri:boolean;
    constructor(name:string,kana:string,kakusu:number,gogyou:Gogyou,youin:YouIn,isBunri:boolean)
    {
        this._name = name;
        this._kana = kana;
        this._kakusu = kakusu;
        this._gogyou = gogyou;
        this._youin = youin; 
        this._isBunri = isBunri;
    }

    get kana()
    {
        return this._kana;    
    }    

    get name()
    {
        return this._name;    
    }
    
    get kakusu()
    {
        return this._kakusu;    
    }    


    get gogyou()
    {
        return this._gogyou;    
    }

    get youin()
    {
        return this._youin;    
    }

    get isBunri()
    {
        return this._isBunri;
    }    

    public static of(name:string,kakusu:number,kana:string,isBunri:boolean):Chara
    {
        let gogyou = Gogyou.ofKana(kana);
        if(gogyou == null)
        {
            throw new Error(`${kana}の五行が見つかりませんでした。`);                    
        }
        return new Chara(name,kana,kakusu,gogyou,YouIn.of(kakusu),isBunri);
    }
}