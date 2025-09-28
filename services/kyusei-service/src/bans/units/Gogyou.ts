


export default class Gogyou
{
    private _key:string;
    private _seiki:string;
    private _taiki:string;
    private _shozoku:Array<number>;
    private _className:string;
    public static readonly MOKU_KIPOU = new Gogyou("木","水","火",[3,4],"moku");
    public static readonly KA_KIPOU = new Gogyou("火","木","土",[9],"ka");
    public static readonly DO_KIPOU = new Gogyou("土","火","金",[2,5,8],"do");
    public static readonly KIN_KIPOU = new Gogyou("金","土","水",[6,7],"kin");
    public static readonly SUI_KIPOU = new Gogyou("水","金","木",[1],"sui");
 
    
    private static KIPOU_MAPS = new Map<string,Gogyou>([
        [Gogyou.MOKU_KIPOU._key,Gogyou.MOKU_KIPOU],
        [Gogyou.KA_KIPOU._key,Gogyou.KA_KIPOU],
        [Gogyou.DO_KIPOU._key,Gogyou.DO_KIPOU],
        [Gogyou.KIN_KIPOU._key,Gogyou.KIN_KIPOU],
        [Gogyou.SUI_KIPOU._key,Gogyou.SUI_KIPOU],
    ]);


    private constructor(key:string,seiki:string,taiki:string,shozoku:Array<number>,color:string)    
    {
        this._key = key;
        this._seiki = seiki;
        this._taiki = taiki;
        this._shozoku = shozoku;       
        this._className = color;
    }

    public static of(key:string):Gogyou | undefined
    {
        return Gogyou.KIPOU_MAPS.get(key);
    }

    get className():string
    {
        return this._className;
    }    

    get key():string
    {
        return this._key;
    }

    get seiki():string
    {
        return this._seiki;
    }

    get taiki():string
    {
        return this._taiki;
    }

    get shozoku():Array<number>
    {
        return this._shozoku.slice();
    }
}