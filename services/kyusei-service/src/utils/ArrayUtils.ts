
export default class ArrayUtils
{
    public static compare<T>(a:Array<T>,b:Array<T>):boolean
    {
        for(let i = 0; i < a.length;i++)    
        {
            for(let j = 0; j < b.length;j++)    
            {
                if(a[i] === b[j])
                {
                    return true;    
                }
            }
        }

        return false;        
    }

    public static and<T>(a:Array<T>,b:Array<T>):Array<T>
    {
        return a.filter((aValue)=>{
            return 0 <= b.indexOf(aValue);
        });        
    }

    public static or<T>(a:Array<T>,b:Array<T>):Array<T>
    {
        let result = a.slice();
        b.forEach((bValue)=>
        {
            if(result.indexOf(bValue) < 0)    
            {
                result.push(bValue);
            }            
        });

        return result;        
    }

    public static sub<T>(a:Array<T>,b:Array<T>):Array<T>
    {
        let result = new Array<T>();
        a.forEach((aValue)=>
        {
            if(b.indexOf(aValue) < 0)    
            {
                result.push(aValue);
            }            
        });

        return result;  
    }

}