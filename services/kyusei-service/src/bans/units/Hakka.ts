

export default class Hakka
{
    public static readonly KANKYUU_K = new Hakka("坎宮傾斜","かんきゅうけいしゃ");        
    public static readonly GONKYUU_K = new Hakka("艮宮傾斜","ごんきゅうけいしゃ");    
    public static readonly SINKYUU_K = new Hakka("震宮傾斜","しんきゅうけいしゃ");
    public static readonly SONKYUU_K = new Hakka("巽宮傾斜","そんきゅうけいしゃ");
    public static readonly RIKYUU_K = new Hakka("離宮傾斜","りきゅうけいしゃ");
    public static readonly KONKYUU_K = new Hakka("坤宮傾斜","こんきゅうけいしゃ");        
    public static readonly DAKYUU_K = new Hakka("兌宮傾斜","だきゅうけいしゃ");
    public static readonly KENKYUU_K = new Hakka("乾宮傾斜","けんきゅうけいしゃ");        

    private _name:string;
    private _rubi:string;

    public static readonly TAIKYOKU = new Hakka("太極","たいきょく");    
    public static readonly URAS = new Map<string,Hakka>([
        [Hakka.KANKYUU_K._name,Hakka.RIKYUU_K],
        [Hakka.KONKYUU_K._name,Hakka.KENKYUU_K],
        [Hakka.SINKYUU_K._name,Hakka.SONKYUU_K],
        [Hakka.SONKYUU_K._name,Hakka.SINKYUU_K],
        [Hakka.KENKYUU_K._name,Hakka.KONKYUU_K],
        [Hakka.DAKYUU_K._name,Hakka.GONKYUU_K],
        [Hakka.GONKYUU_K._name,Hakka.DAKYUU_K],
        [Hakka.RIKYUU_K._name,Hakka.KANKYUU_K],    
    ]
    );        



    public static readonly HAKKAS = new Array<Hakka>(
        Hakka.KANKYUU_K,
        Hakka.GONKYUU_K,
        Hakka.SINKYUU_K,
        Hakka.SONKYUU_K,
        Hakka.RIKYUU_K,
        Hakka.KONKYUU_K,
        Hakka.DAKYUU_K,
        Hakka.KENKYUU_K
    );        

    public static readonly KEISHAS = new Array<Hakka>(
        Hakka.KANKYUU_K,
        Hakka.GONKYUU_K,
        Hakka.GONKYUU_K,
        Hakka.SINKYUU_K,
        Hakka.SONKYUU_K,
        Hakka.SONKYUU_K,
        Hakka.RIKYUU_K,
        Hakka.KONKYUU_K,
        Hakka.KONKYUU_K,
        Hakka.DAKYUU_K,
        Hakka.KENKYUU_K,
        Hakka.KENKYUU_K
    );


    private constructor(name:string,rubi:string)    
    {                
        this._name = name;
        this._rubi = rubi;   
    }

    get name()
    {
        return this._name;    
    }    

    get rubi()
    {
        return this._rubi;    
    }    

    public reverse():Hakka
    {
        const result = Hakka.URAS.get(this.name);
        if (result === undefined) {
            throw new Error(`Reverse mapping not found for: ${this.name}`);
        }
        return result;
    }
}
