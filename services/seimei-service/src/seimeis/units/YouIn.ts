
export default class YouIn
{
    private _name:string;
    private _jp:string;
    private _you:boolean;

    public static readonly YOU = new YouIn("you","陽",true);
    public static readonly IN = new YouIn("in","陰",false);

    public static readonly ITEMS = [
        YouIn.IN,          
        YouIn.YOU,
    ];


    constructor(name:string,jp:string,you:boolean)    
    {
        this._name = name;    
        this._jp = jp;    
        this._you = you;
    }

    get name()
    {
        return this._name;    
    }

    get jp()
    {
        return this._jp;    
    }

    get you()
    {
        return this._you;
    }

    public rev():YouIn
    {
        if(this.you)
        {
            return YouIn.IN;
        }
        else
        {
            return YouIn.YOU;
        }
    }






    
    public static of(kakusu:number)    
    {
        return YouIn.ITEMS[kakusu % 2];
    }    

    public equals(another:YouIn):boolean
    {
        return this._you = another._you;
    }
}