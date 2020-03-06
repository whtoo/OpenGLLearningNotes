import { AdapterBase } from "./AdapterBase";
import { List } from "./ListNode";
import { Maybe } from "./Traits";

export class Queue<T> extends AdapterBase<T> {
    public remove():Maybe<T> {
        if(this._arr.length > 0){
            if(this._arr instanceof List){
                return this._arr.pop()
            } else {
                return this._arr.shift()
            }
        } else {
            return undefined
        }
    }

    
}