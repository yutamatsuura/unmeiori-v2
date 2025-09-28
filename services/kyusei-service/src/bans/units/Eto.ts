import Houi from "./Houi";


export default class Eto
{
    private _index:number;
    private _name:string;
    private _houi:Houi;
    private _koji:number;    

    public static readonly NE = new Eto(0,"子",Houi.NORTH,8);
    public static readonly USHI = new Eto(1,"丑",Houi.NORTH_EAST,9);
    public static readonly TORA = new Eto(2,"寅",Houi.NORTH_EAST,2);
    public static readonly USA = new Eto(3,"卯",Houi.EAST,3);
    public static readonly TATU = new Eto(4,"辰",Houi.SOUTH_EAST,5);
    public static readonly MI = new Eto(5,"巳",Houi.SOUTH_EAST,6);
    public static readonly UMA = new Eto(6,"午",Houi.SOUTH,8);
    public static readonly HITUJI = new Eto(7,"未",Houi.SOUTH_WEST,9);
    public static readonly SARU = new Eto(8,"申",Houi.SOUTH_WEST,2);
    public static readonly TORI = new Eto(9,"酉",Houi.WEST,3);
    public static readonly INU = new Eto(10,"戌",Houi.NORTH_WEST,5);
    public static readonly INO = new Eto(11,"亥",Houi.NORTH_WEST,6);

    public static ETOS = new Array<Eto>(
        Eto.NE,
        Eto.USHI,
        Eto.TORA,
        Eto.USA,
        Eto.TATU,
        Eto.MI,
        Eto.UMA,
        Eto.HITUJI,
        Eto.SARU,
        Eto.TORI,
        Eto.INU,
        Eto.INO,        
    );

    
    public static FROM_HOUIS = new Array<Array<Eto>>(
        [Eto.NE],               //北
        [Eto.USHI,Eto.TORA],    //東北
        [Eto.USA],              //東
        [Eto.TATU,Eto.MI],      //東南
        [Eto.UMA],              //南
        [Eto.HITUJI,Eto.SARU],  //西南
        [Eto.TORI],              //西
        [Eto.INU,Eto.INO],       //西北
    );
    
    public static ofHoui(houi:Houi):Array<Eto>
    {
        return Eto.FROM_HOUIS[houi.index];
    }

    constructor(index:number,name:string,houi:Houi,koji:number)
    {
        this._index = index;
        this._name = name;
        this._houi = houi;    
        this._koji = koji;
    }

    get index():number
    {
        return this._index;
    }    

    get name():string
    {
        return this._name;
    }

    get koji():number
    {
        return this._koji;
    }

    get houi():Houi
    {
        return this._houi;
    }    

    public static of(index:number):Eto
    {
        return Eto.ETOS[index % 12];
    }

    public rev():Eto
    {
        return Eto.ETOS[(this.index + 6) % 12];
    }
}
