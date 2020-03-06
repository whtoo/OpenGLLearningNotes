import { AdapterBase } from "./AdapterBase";
import { Maybe } from "./Traits";

export class Stack<T> extends AdapterBase<T> {
    public remove(): Maybe<T> {
        if(this._arr.length > 0) {
            return this._arr.pop()
        } else {
            return undefined
        }
    }

}