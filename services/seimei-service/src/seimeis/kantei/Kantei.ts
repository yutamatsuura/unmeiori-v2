import Gogyou from "../units/Gogyou";


interface Option
{    
    addTotalScore?:boolean;
    checkbox?:boolean;
    viewmsg1?:boolean;
    viewmsg2?:boolean;
    viewscore?:boolean;
    titlemsg1?:string;
    titlemsg2?:string;
    override?:boolean;
    viewtitle?:boolean;
}




const GOGYOU1:Option = {
    viewmsg1:true,
    viewmsg2:true,
    titlemsg1:"人格(凶名)",
    titlemsg2:"地格(凶名）",    
}


const GOGYOU2:Option = {
    viewmsg1:true,
    viewmsg2:false,
    titlemsg1:"人格(正名)",    
}

export default class Kantei
{
    private _eng:string;
    private _jp:string;
    private _viewscore:boolean;
    private _viewmsg1:boolean;
    private _viewmsg2:boolean;
    private _titlemsg1:string;
    private _titlemsg2:string;
    private _checkbox:boolean;
    private _addTotalScore:boolean;
    private _override:boolean;
    private _viewtitle:boolean;

    get eng()
    {
        return this._eng;    
    }

    get jp()
    {
        return this._jp;    
    }    

    get viewmsg1()
    {
        return this._viewmsg1;
    }

    get viewmsg2()
    {
        return this._viewmsg2;
    }    

    get titlemsg1()
    {
        return this._titlemsg1;    
    }

    get titlemsg2()
    {
        return this._titlemsg2;    
    }

    get addTotalScore()
    {
        return this._addTotalScore;    
    }
    
    get checkbox()
    {
        return this._checkbox;    
    }

    get override()
    {
        return this._override;    
    }

    get viewscore()
    {
        return this._viewscore;    
    }

    get viewtitle()
    {
        return this._viewtitle;    
    }


    constructor(eng:string,jp:string,option?:Option)
    {
        this._eng = eng;
        this._jp = jp;        
        this._checkbox = true;
        this._viewmsg1 = true;
        this._viewmsg2 = false;
        this._titlemsg1 = "";
        this._titlemsg2 = "";
        this._override = false;
        this._addTotalScore = true;
        this._viewscore = true;
        this._viewtitle = true;

        if(option != undefined)
        {
            if(option.viewmsg1 != undefined)
            {
                this._viewmsg1 = option.viewmsg1;
            }

            if(option.viewmsg2 != undefined)
            {
                this._viewmsg2 = option.viewmsg2;
            }

            if(option.checkbox != undefined)
            {
                this._checkbox = option.checkbox;
            }

            if(option.titlemsg1 != undefined)
            {
                this._titlemsg1 = option.titlemsg1;
            }

            if(option.titlemsg2 != undefined)
            {
                this._titlemsg2 = option.titlemsg2;
            }

            if(option.addTotalScore != undefined)
            {
                this._addTotalScore = option.addTotalScore;
            }

            if(option.override != undefined)
            {
                this._override = option.override;    
            }
                        
            if(option.viewscore != undefined)
            {
                this._viewscore = option.viewscore;    
            }

            if(option.viewtitle != undefined)
            {
                this._viewtitle = option.viewtitle;
            }
        }   
    }
    
    
    public static gogyou(first:Gogyou,second:Gogyou,option?:Option)    
    {
        return new Kantei(first.key(second),`${first.jp}-${second.jp}`,option);
    }

    
    public static readonly GOGYOU_BALANCE_OK = new Kantei('gogyo_balance_ok', '五行のバランス(良)');
    public static readonly GOGYOU_BALANCE_NG = new Kantei('gogyo_balance_ng', '五行のバランス(悪)');
    public static readonly GOGYOU_KA_KA = Kantei.gogyou(Gogyou.KA,Gogyou.KA,GOGYOU1);
    public static readonly GOGYOU_KA_SUI = Kantei.gogyou(Gogyou.KA,Gogyou.SUI,GOGYOU1);
    public static readonly GOGYOU_SUI_KA = Kantei.gogyou(Gogyou.SUI,Gogyou.KA,GOGYOU1);
    public static readonly GOGYOU_SUI_SUI = Kantei.gogyou(Gogyou.SUI,Gogyou.SUI,GOGYOU1);

    public static readonly GOGYOU_MOKU_MOKU = Kantei.gogyou(Gogyou.MOKU,Gogyou.MOKU,GOGYOU2);
    public static readonly GOGYOU_MOKU_KA =  Kantei.gogyou(Gogyou.MOKU,Gogyou.KA,GOGYOU2);
    public static readonly GOGYOU_MOKU_DO =  Kantei.gogyou(Gogyou.MOKU,Gogyou.DO,GOGYOU2);
    public static readonly GOGYOU_MOKU_KIN = Kantei.gogyou(Gogyou.MOKU,Gogyou.KIN,GOGYOU2);
    public static readonly GOGYOU_MOKU_SUI = Kantei.gogyou(Gogyou.MOKU,Gogyou.SUI,GOGYOU2);
    public static readonly GOGYOU_KA_MOKU = Kantei.gogyou(Gogyou.KA,Gogyou.MOKU,GOGYOU2);
    public static readonly GOGYOU_KA_DO =  Kantei.gogyou(Gogyou.KA,Gogyou.DO,GOGYOU2);
    public static readonly GOGYOU_KA_KIN = Kantei.gogyou(Gogyou.KA,Gogyou.KIN,GOGYOU2);

    public static readonly GOGYOU_DO_MOKU = Kantei.gogyou(Gogyou.DO,Gogyou.MOKU,GOGYOU2);
    public static readonly GOGYOU_DO_KA =  Kantei.gogyou(Gogyou.DO,Gogyou.KA,GOGYOU2);
    public static readonly GOGYOU_DO_DO =  Kantei.gogyou(Gogyou.DO,Gogyou.DO,GOGYOU2);
    public static readonly GOGYOU_DO_KIN = Kantei.gogyou(Gogyou.DO,Gogyou.KIN,GOGYOU2);
    public static readonly GOGYOU_DO_SUI = Kantei.gogyou(Gogyou.DO,Gogyou.SUI,GOGYOU2);

    public static readonly GOGYOU_KIN_MOKU = Kantei.gogyou(Gogyou.KIN,Gogyou.MOKU,GOGYOU2);
    public static readonly GOGYOU_KIN_KA = Kantei.gogyou(Gogyou.KIN,Gogyou.KA,GOGYOU2);
    public static readonly GOGYOU_KIN_DO = Kantei.gogyou(Gogyou.KIN,Gogyou.DO,GOGYOU2);
    public static readonly GOGYOU_KIN_KIN = Kantei.gogyou(Gogyou.KIN,Gogyou.KIN,GOGYOU2);
    public static readonly GOGYOU_KIN_SUI = Kantei.gogyou(Gogyou.KIN,Gogyou.SUI,GOGYOU2);
    
    public static readonly GOGYOU_SUI_MOKU = Kantei.gogyou(Gogyou.SUI,Gogyou.MOKU,GOGYOU2);
    public static readonly GOGYOU_SUI_DO = Kantei.gogyou(Gogyou.SUI,Gogyou.DO,GOGYOU2);
    public static readonly GOGYOU_SUI_KIN = Kantei.gogyou(Gogyou.SUI,Gogyou.KIN,GOGYOU2);


    public static readonly INYOU_CHUDAN = new Kantei('inyou_chudan', '中断');
    public static readonly INYOU_INYOU = new Kantei('inyou_zenro', '善良' );
    public static readonly INYOU_SIRO_KATAYORI = new Kantei('inyou_siro_katayori', '白の方寄り');
    public static readonly INYOU_KURO_KATAYORI = new Kantei('inyou_kuro_katayori', '黒の方寄り');
    public static readonly INYOU_NIJU_BASAMI = new Kantei('inyou_niju_basami', '二重挟み');
    public static readonly INYOU_OHBASAMI = new Kantei('inyou_ohbasami', '大挟み');
    public static readonly INYOU_SHIBARI = new Kantei('inyou_shibari', '縛り');
    public static readonly INYOU_UE_MAKINAOSI = new Kantei('inyou_ue_makinaosi', '上蒔き直し');
    public static readonly INYOU_SITA_MAKINAOSI = new Kantei('inyou_sita_makinaosi', '下蒔き直し');

    public static readonly TENTI_DOUSU_GUSU = new Kantei('tenti_dousu_guu', '天地同数(偶数)');
    public static readonly TENTI_DOUSU_KISUU = new Kantei('tenti_dousu_kisu', '天地同数(奇数)');
    public static readonly SEIMEI_DOUSU = new Kantei('tenti_soudousuu','天地総同数');
    public static readonly TENTI_SHOUTOTU = new Kantei('tenti_shoutotu', '天地衝突');

    public static readonly KUDASI_ANIMAL = new Kantei('kudasi_animal','動物',{viewtitle:false});
    public static readonly KUDASI_FISH = new Kantei('kudasi_fish', '魚',{viewtitle:false});
    public static readonly KUDASI_PLANT = new Kantei('kudasi_plant', '植物',{viewtitle:false});
    public static readonly KUDASI_ROCK = new Kantei('kudasi_rock', '鉱物',{viewtitle:false});
    public static readonly KUDASI_TENYOU = new Kantei('kudasi_tenyou', '天佒',{viewtitle:false});
    public static readonly KUDASI_BUNRI = new Kantei('kudasi_bunri', '分離名',{checkbox:false});
    public static readonly KUDASI_TIGYOU9 = new Kantei('kudasi_tigyoou9', '地行が9画または19画',{checkbox:false,viewtitle:false});
    public static readonly KUDASI_TIKAKU9 = new Kantei('kudasi_tikaku9', '地格が9画または19画',{checkbox:false,viewtitle:false});
    public static readonly KUDASI_JINKAKU9 = new Kantei('kudasi_jinkaku9', '人格が9画または19画',{checkbox:false,viewtitle:false});
    public static readonly KUDASI_SUI = new Kantei('kudasi_sui', '地行が水行',{checkbox:false});
    public static readonly KUDASI_HAPPY = new Kantei('kudasi_happy', '幸福すぎる字',{viewtitle:false});
    public static readonly KUDASI_SONKI = new Kantei('kudasi_sonki', '尊貴すぎる字',{viewtitle:false});
    public static readonly KUDASI_HINKAKU = new Kantei('kudasi_hinkaku', '品格を損なう字',{viewtitle:false});
    public static readonly KUDASI_JIKAN = new Kantei('kudasi_jikan', '十干十二支の字',{viewtitle:false});
    public static readonly KUDASI_KEIBETU = new Kantei('kudasi_keibetu', '軽蔑の字',{viewtitle:false});
    public static readonly KUDASI_KIKOU = new Kantei('kudasi_kikou','気候の字',{viewtitle:false});
    public static readonly KUDASI_NO_SEX = new Kantei('kudasi_non_sex', '性別がわからない文字',{viewtitle:false});
    public static readonly KUDASI_ONE_CHARA = new Kantei('kudasi_one_chara', '一文字だけの字',{checkbox:false,viewtitle:false});
    public static readonly KUDASI_ETC = new Kantei('kudasi_etc', 'その他の名前にはしたくない字',{override:true,viewtitle:false});
    
    public static readonly SCORE_FULL = new Kantei('score_full', '満点(100点)',{addTotalScore:false});      
    public static readonly SCORE_OK = new Kantei('score_ok', '合格(70～100点)',{addTotalScore:false});      
    public static readonly SCORE_NG = new Kantei('score_ng', '不合格(70点未満)',{addTotalScore:false});      
    public static readonly SCORE_KYOU_OR_KIPOU = new Kantei('score_kipou_or_kyou', '正名もしくは凶名の境界点',{addTotalScore:false,viewmsg1:false});            
    public static readonly SCORE_MAX = new Kantei('score_max', '最高得点',{addTotalScore:false,viewmsg1:false});            
    public static readonly SCORE_MIN = new Kantei('score_min', '最低得点',{addTotalScore:false,viewmsg1:false});            
    public static readonly SCORE_BEGIN = new Kantei('score_begin', '計算開始得点',{addTotalScore:false,viewmsg1:false});            

    public static readonly MAX_KAKUSU = 81;
    public static readonly KAKUSUES = Kantei.Kakusu(Kantei.MAX_KAKUSU);
    

    public static readonly ITEMS = new Map<string,Kantei>();
    public static addItem(result:Kantei)
    {
        Kantei.ITEMS.set(result.eng,result);        
    }

    public static of(key:string)
    {
        return Kantei.ITEMS.get(key);
    }

    public static Kakusu(num:number):Map<number,Kantei>
    {
        let result = new Map<number,Kantei>();
        for(let i = 1;i <= num;i++)    
        {
            result.set(i,new Kantei(`kakusu${i}`,`画数${i}`,{
                viewscore:true,
                viewmsg1:true,                
                viewmsg2:true,
                titlemsg1:"総論",
                titlemsg2:"人生の概観",
            }));
        }

        return result;        
    }

    public static rangeKakusu(first:number,end:number):Array<Kantei>
    {
        let result = new Array<Kantei>();
        for(let i = first; i<= end;i++)
        {
            result.push(Kantei.KAKUSUES.get(i));            
        }
        


        return result;               
    }
}



