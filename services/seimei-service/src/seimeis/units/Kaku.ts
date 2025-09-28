import Seimei from "./Seimei";


export default class Kaku
{
    private _kakusu:number;
    private _beginIndex:number;
    private _endIndex:number;
    private _seimei:Seimei;
    private _name:string;

    constructor(name:string,kakusu:number,beginIndex:number,endIndex:number,seimei:Seimei)
    {
        this._name = name;    
        this._kakusu = kakusu;
        this._beginIndex = beginIndex;
        this._endIndex = endIndex;    
        this._seimei = seimei;
    }

    public getSeimei()
    {
        return this._seimei.allName().substring(this.beginIndex,this.endIndex + 1);
    }

    public getSeimeiWithSpace()
    {
        return this._seimei.allNameWithSpace().substring(this.beginIndexWithSpace(),this.endIndexWithSpace() + 1);
    }



    get seimei()
    {
        return this._seimei;
    }

    get name()
    {
        return this._name;    
    }

    get kakusu()
    {
        return this._kakusu;    
    }    

    get beginIndex()
    {
        return this._beginIndex;
    }    

    get endIndex()
    {
        return this._endIndex;    
    }    

    public beginIndexWithSpace()
    {
        if(this._seimei.sei.length <= this._beginIndex)
        {
            return this._beginIndex + 1;    
        }
        else
        {
            return this._beginIndex;    
        }    
    }

    
    public endIndexWithSpace()
    {
        if(this._seimei.sei.length <= this._endIndex)
        {
            return this._endIndex + 1;    
        }
        else
        {
            return this._endIndex;    
        }    
    }

    public static ofTenkaku(seimei:Seimei):Kaku
    {
        let kakusu = 0;
        let seis = seimei.sei;
        seis.forEach((sei)=>{
            kakusu += sei.kakusu;
        });

        let beginIndex = 0;
        let endIndex = seis.length - 1;
        return new Kaku("天格",kakusu,beginIndex,endIndex,seimei);
    }

    public static ofJinkaku(seimei:Seimei):Kaku
    {        
        let seis = seimei.sei;
        let meis = seimei.mei;
        let seiIndex = seis.length - 1;
        let meiIndex = 0;
        let seiLast = seis[seiIndex];
        let meiLast = meis[meiIndex];

        let kakusu = seiLast.kakusu + meiLast.kakusu;    
        return new Kaku("人格",kakusu,seiIndex,seiIndex + 1,seimei);
    }

    public static ofTikaku(seimei:Seimei):Kaku
    {        
        let seis = seimei.sei;
        let meis = seimei.mei;
        let kakusu = 0;
        meis.forEach((mei)=>{
            kakusu += mei.kakusu;
        });

        let beginIndex = seis.length;
        let endIndex = seis.length + meis.length - 1;

        return new Kaku("地格",kakusu,beginIndex,endIndex,seimei);
    }

    public static ofSoukaku(seimei:Seimei):Kaku
    {        
        let seis = seimei.sei;
        let meis = seimei.mei;    
        let kakusu = 0;
        meis.forEach((mei)=>{
            kakusu += mei.kakusu;
        });

        seis.forEach((sei)=>{
            kakusu += sei.kakusu;
        });

        let beginIndex = 0;
        let endIndex = seis.length + meis.length;

        return new Kaku("総格",kakusu,beginIndex,endIndex,seimei);
    }

    public static ofTigyou(seimei:Seimei):Kaku
    {        
        let seis = seimei.sei;
        let meis = seimei.mei;    
        let kakusu = meis[0].kakusu;
        let beginIndex =  seis.length;
        let endIndex = beginIndex + 1;

        return new Kaku("地行",kakusu,beginIndex,endIndex,seimei);
    }


}