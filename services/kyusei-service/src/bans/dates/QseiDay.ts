import LocalDate from "../../times/LocalDate";
import Qsei from "../qseis/Qsei";


export default class QseiDay extends Qsei
{
	private _date:LocalDate;
	private _plus:boolean;
	private _seq:number;
	private _isSoltice:boolean;
	private _isKirikaeAfter:boolean;
	private _isKirikaeBefore:boolean;
	private _kirikaeText:string;
	private _isUruu:boolean;

	constructor(date:LocalDate, seq:number,plus:boolean,qs:Qsei) 
    {			
		super(qs.index,
			qs.houi,
			qs.name,
			qs.rubi,
			qs.gogyou,
			qs.hakka,
			qs.kiban8);

		this._date = date;
		this._seq = seq;
		this._plus = plus;
		this._isKirikaeAfter = false;
		this._isKirikaeBefore = false;
		this._isSoltice = false;
		this._kirikaeText = "";
		this._isUruu = false;
	}	

	get isSoltice():boolean
	{
		return this._isSoltice;		
	}

	set isSoltice(isSoltice:boolean)
	{
		this._isSoltice = isSoltice;	
	}
	
	get isKirikaeAfter():boolean
	{
		return this._isKirikaeAfter;		
	}

	set isKirikaeAfter(isKirikae:boolean)
	{
		this._isKirikaeAfter = isKirikae;	
	}

	get isKirikaeBefore():boolean
	{
		return this._isKirikaeBefore;
	}

	set isKirikaeBefore(isKirikae:boolean)
	{
		this._isKirikaeBefore = isKirikae;
	}

	get kirikaeText()
	{
		return this._kirikaeText;	
	}	

	set kirikaeText(kirikae:string)	
	{
		this._kirikaeText = kirikae;	
	}

	get isUruu()
	{
		return this._isUruu;	
	}

	set isUruu(isUruu:boolean)	
	{
		this._isUruu = isUruu;	
	}
   
	
	public toString():string {
		return this._date + ", i=" + this._seq + ",plus=" + this._plus + ",eto="+ ",qsei=" + this.index;
	}   	
}