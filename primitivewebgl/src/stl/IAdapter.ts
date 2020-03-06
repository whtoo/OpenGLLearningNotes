import { Maybe } from "./Traits";

export interface IAdapter<T> {
    add(t:T):void
    remove():Maybe<T>
    clear():void
    length:number
    isEmpty:boolean
}

