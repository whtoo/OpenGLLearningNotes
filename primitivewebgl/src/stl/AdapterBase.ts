import { IAdapter } from "./IAdapter";
import { List } from "./ListNode";

export abstract class AdapterBase<T> implements IAdapter<T>{
    protected _arr : Array<T> | List<T>
    public constructor(userList:boolean = true){
        if(userList === true){
            this._arr = new List<T>()
        } else {
            this._arr = new Array<T>()
        }
    }
    public add(t: T): void {
        this._arr.push(t)
    }    
    public abstract remove(): T 
    clear(): void {
        if(this._arr instanceof List){
            this._arr = new List<T>()
        } else {
            this._arr = new Array<T>()
        }
    }

    public get length(): number {
        return this._arr.length
    }

    public get  isEmpty(): boolean{
        return this._arr.length <= 0
    }


} 