import { IAdapter } from "./IAdapter"
import { TreeNode } from "./TreeNode"
import { IEnumerator, Maybe } from "./Traits"

export type Indexer = (len : number,idx:number) => number
export function IndexerL2R(len:number,idx:number): number {
    return idx
}

export function IndexerR2L(len:number,idx:number) : number {
    return (len-idx - 1)
}

export class NodeT2BEnumerator<T,IdxFunc extends Indexer,Adapter extends IAdapter<TreeNode<T>>> implements IEnumerator<TreeNode<T>> {
    private _node : Maybe<TreeNode<T>>
    private _adapter! : IAdapter<TreeNode<T>>
    private _curNode! : Maybe<TreeNode<T>>
    private _indexer! : IdxFunc
    public constructor(node: Maybe<TreeNode<T>>,func:IdxFunc,adapter: new ()=> Adapter) {
        if(node === undefined) {
            return
        }

        this._node = node
        this._indexer = func
        this._adapter = new adapter()
        this._adapter.add(this._node)
        this._curNode = undefined
    }

    
    reset(): void {
        if(this._node == undefined) {
            return
        }
        this._curNode = undefined
        this._adapter.clear()
        this._adapter.add(this._node)
    }    
    
    moveNext(): boolean {
        if(this._adapter.isEmpty) {
            return false
        }

        this._curNode = this._adapter.remove()
        if(this._curNode != undefined) {
            let len: number = this._curNode.childCount
            for(let i = 0; i < len;++i) {
                let childIdx = this._indexer(len,i)
                let child = this._curNode.getChildAt(childIdx)
                if(child !== undefined) {
                    this._adapter.add(child)
                }
            }
        }
        return true
    }

    public get current: Maybe<TreeNode<T>> {
        return this._curNode
    }
    
}

export class NodeB2TEnumerator<T> implements IEnumerator<TreeNode<T>> {
    reset(): void {
        throw new Error("Method not implemented.")
    }    moveNext(): boolean {
        throw new Error("Method not implemented.")
    }
    current: TreeNode<T>

    /// TODO: page 153
}