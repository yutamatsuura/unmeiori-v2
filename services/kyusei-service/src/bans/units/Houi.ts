
export default class Houi
{
    private _index:number;
    private _name:string;

    public static readonly NORTH = new Houi(0,"北");
    public static readonly NORTH_EAST = new Houi(1,"東北");
    public static readonly EAST = new Houi(2,"東");
    public static readonly SOUTH_EAST = new Houi(3,"東南");
    public static readonly SOUTH = new Houi(4,"南");
    public static readonly SOUTH_WEST = new Houi(5,"西南");
    public static readonly WEST = new Houi(6,"西");
    public static readonly NORTH_WEST = new Houi(7,"西北");

    public static readonly CHUUOU = new Houi(-1,"中央");    

    public static readonly HOUIS = new Array<Houi>(
        Houi.NORTH,
        Houi.NORTH_EAST,
        Houi.EAST,
        Houi.SOUTH_EAST,
        Houi.SOUTH,
        Houi.SOUTH_WEST,
        Houi.WEST,
        Houi.NORTH_WEST,
    );

    public static readonly TENDO = [
        Houi.SOUTH,      //2月 添字0
        Houi.SOUTH_WEST, //3月 添字1
        Houi.NORTH,      //4月 添字2
        Houi.WEST,       //5月 添字3
        Houi.NORTH_WEST, //6月 添字4
        Houi.EAST,       //7月 添字5
        Houi.NORTH,      //8月 添字6
        Houi.NORTH_EAST, //9月 添字7
        Houi.SOUTH,	     //10月 添字8
        Houi.EAST,	    //11月 添字9
        Houi.SOUTH_EAST, //12月 添字10    
        Houi.WEST	    //13月 添字11             
    ];

    private constructor(index:number,name:string)    
    {
        this._index = index;
        this._name = name;    
    }

    get index()
    {
        return this._index;    
    }    

    get name()
    {
        return this._name;    
    }    

    public rev():Houi
    {
        if(this._index === Houi.CHUUOU._index)    
        {
            return this;    
        }
        else
        {
            return Houi.of((this._index + 4) % 8);
        }
    }

    public static of(index:number):Houi
    {
        return Houi.HOUIS[index];
    }
}