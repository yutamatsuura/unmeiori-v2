import TypeUtils from "../../utils/TypeUtils";




export default class Gogyou
{
    private _name:string;
    private _jp:string;

    public static readonly MOKU = new Gogyou("moku","木");
    public static readonly KA = new Gogyou("ka","火");
    public static readonly DO = new Gogyou("do","土");
    public static readonly KIN = new Gogyou("kin","金");
    public static readonly SUI = new Gogyou("sui","水");

    public constructor(name:string,jp:string)    
    {
        this._name = name;    
        this._jp = jp;    
    }

    public static readonly ITEMS = [
        Gogyou.MOKU,    
        Gogyou.KA,    
        Gogyou.DO,    
        Gogyou.KIN,    
        Gogyou.SUI    
    ];

    public static readonly KANAS = new Map<string,Gogyou>(    
    [
        //木    
        ["カ",Gogyou.MOKU],
        ["キ",Gogyou.MOKU],
        ["ク",Gogyou.MOKU],
        ["ケ",Gogyou.MOKU],
        ["コ",Gogyou.MOKU],

        ["ガ",Gogyou.MOKU],
        ["ギ",Gogyou.MOKU],
        ["グ",Gogyou.MOKU],
        ["ゲ",Gogyou.MOKU],
        ["ゴ",Gogyou.MOKU],

        //火 
        ["タ",Gogyou.KA],   
        ["チ",Gogyou.KA],   
        ["ツ",Gogyou.KA],   
        ["テ",Gogyou.KA],   
        ["ト",Gogyou.KA], 

        ["ダ",Gogyou.KA],   
        ["ヂ",Gogyou.KA],   
        ["ヅ",Gogyou.KA],   
        ["デ",Gogyou.KA],   
        ["ド",Gogyou.KA], 

        ["ナ",Gogyou.KA],   
        ["ニ",Gogyou.KA],   
        ["ヌ",Gogyou.KA],   
        ["ネ",Gogyou.KA],   
        ["ノ",Gogyou.KA], 

        ["ラ",Gogyou.KA],   
        ["リ",Gogyou.KA],   
        ["ル",Gogyou.KA],   
        ["レ",Gogyou.KA],   
        ["ロ",Gogyou.KA], 

        //土
        ["ア",Gogyou.DO],
        ["イ",Gogyou.DO],
        ["ウ",Gogyou.DO],
        ["エ",Gogyou.DO],
        ["オ",Gogyou.DO],
       
        ["ヤ",Gogyou.DO],
        ["ユ",Gogyou.DO],
        ["ヨ",Gogyou.DO],

        ["ワ",Gogyou.DO],
        ["ヲ",Gogyou.DO],
        ["ン",Gogyou.DO],
  
        //金        
        ["サ",Gogyou.KIN],
        ["シ",Gogyou.KIN],
        ["ス",Gogyou.KIN],
        ["セ",Gogyou.KIN],
        ["ソ",Gogyou.KIN],

        ["ザ",Gogyou.KIN],
        ["ジ",Gogyou.KIN],
        ["ズ",Gogyou.KIN],
        ["ゼ",Gogyou.KIN],
        ["ゾ",Gogyou.KIN],


        //水
        ["ハ",Gogyou.SUI],
        ["ヒ",Gogyou.SUI],
        ["フ",Gogyou.SUI],
        ["ヘ",Gogyou.SUI],
        ["ホ",Gogyou.SUI],

        ["バ",Gogyou.SUI],
        ["ビ",Gogyou.SUI],
        ["ブ",Gogyou.SUI],
        ["ベ",Gogyou.SUI],
        ["ボ",Gogyou.SUI],

        ["パ",Gogyou.SUI],
        ["ピ",Gogyou.SUI],
        ["プ",Gogyou.SUI],
        ["ペ",Gogyou.SUI],
        ["ポ",Gogyou.SUI],

        ["マ",Gogyou.SUI],
        ["ミ",Gogyou.SUI],
        ["ム",Gogyou.SUI],
        ["メ",Gogyou.SUI],
        ["モ",Gogyou.SUI],
    ]);
    

    get jp()
    {
        return this._jp;    
    }    

    get name()
    {
        return this._name;    
    }

    public static of(index:number):Gogyou
    {
        let val = index % 10;
        val /= 2;
        val = TypeUtils.toInt(val);
        return Gogyou.ITEMS[val];
    }

    public static ofKana(kana:string):Gogyou
    {
        let c = kana.substring(0,1);
        if(Gogyou.KANAS.has(c))
        {
            return Gogyou.KANAS.get(c);            
        }
        else
        {        
            return null;
        }
    }

    public static toKey(first:Gogyou,second:Gogyou):string
    {
        return `gogyou_${first.name}-${second.name}`;    
    }

    public key(second:Gogyou):string
    {
        return Gogyou.toKey(this,second);
    }
}