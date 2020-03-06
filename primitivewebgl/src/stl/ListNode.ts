import { Nullable, Maybe } from "./Traits";

export class ListNode<T> {
    public next: Nullable<ListNode<T>>;
    public prev: Nullable<ListNode<T>>;
    public data: Maybe<T>;
    public constructor(data: T | undefined = undefined) {
        this.next = this.prev = null;
        this.data = data;
    }
}

export class List<T> {
    private _headNode: ListNode<T>;
    private _length: number;
    public constructor() {
        /// 哨兵节点(不计入长度)
        this._headNode = new ListNode<T>();
        this._headNode.next = this._headNode;
        this._headNode.prev = this._headNode;

        this._length = 0;
    }


    /**
     * empty
     */
    public empty(): boolean {
        return this._headNode.next == this._headNode;

    }

    public get length():number {
        return this._length;
    }

    public begin(): ListNode<T>{
        if(this._headNode.next === null) {
            throw new Error("头节点的next指针必须不为null")
        }
        return this._headNode.next;
    }

    public end(): ListNode<T> {
        return this._headNode;
    }

    public contains(data : T) : boolean {
        for(let link : Nullable<ListNode<T>> = this._headNode.next;link !== null && link != this._headNode;link = link.next) {
            if(link !== null) {
                if(link.data !== undefined) {
                    if(data == link.data){
                        return true
                    }
                }
            }            
        }

        return false
    }

    public forNext(cb: (data:T)=>void) : void {
        for(let link: Nullable<ListNode<T>> = this._headNode.next;link!== null&& link != this._headNode;link = link.next) {
            if(link !== null) {
                if(link.data !== undefined) {
                    cb(link.data)
                }
            }
        }
    }

    public forPrev(cb:(data:T)=>void) : void {
        for(let link: Nullable<ListNode<T>> = this._headNode.prev;link!== null&& link != this._headNode;link = link.prev) {
            if(link !== null) {
                if(link.data !== undefined) {
                    cb(link.data)
                }
            }
        }
    }

    public insertBefore(node:ListNode<T>,data:T):ListNode<T> {
        let ret: ListNode<T> = new ListNode<T>(data)
        ret.next = node
        ret.prev = node.prev
        if(node.prev !== null) {
            node.prev.next = ret
        }
        node.prev = ret
        this._length++
        return ret
    }

    public remove(node:ListNode<T>):void {
        let next:Nullable<ListNode<T>> = node.next
        let prev:Nullable<ListNode<T>> = node.prev

        if(prev !== null){
            prev.next = next
        }

        if(next !== null){
            next.prev = prev
        }
        this._length--

    }

    public push(data:T):void{
        this.insertBefore(this.end(),data)
    }

    public pop():Maybe<T> {
        let prev : Nullable<ListNode<T>> = this.end().prev
        if(prev !== null) {
            let ret:Maybe<T> = prev.data
            this.remove(prev)
            return ret
        }

        return undefined
    }

    public push_front(data:T):void {
        this.insertBefore(this.begin(),data)
    } 

    public pop_front():Maybe<T> {
        let ret:Maybe<T> = this.begin().data
        this.remove(this.begin())
        return ret
    }

    

}
