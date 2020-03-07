import { IAdapter } from "./IAdapter"
import { TreeNode } from "./TreeNode"
import { IEnumerator, Maybe } from "./Traits"
import { Stack } from "./Stack"
import { Queue } from "./Queue"

export type Indexer = (len: number, idx: number) => number
export function IndexerL2R(len: number, idx: number): number {
    return idx
}

export function IndexerR2L(len: number, idx: number): number {
    return (len - idx - 1)
}

export class NodeT2BEnumerator<T, IdxFunc extends Indexer, Adapter extends IAdapter<TreeNode<T>>> implements IEnumerator<TreeNode<T>> {
    private _node: Maybe<TreeNode<T>>
    private _adapter!: IAdapter<TreeNode<T>>
    private _curNode!: Maybe<TreeNode<T>>
    private _indexer!: IdxFunc
    public constructor(node: Maybe<TreeNode<T>>, func: IdxFunc, adapter: new () => Adapter) {
        if (node === undefined) {
            return
        }

        this._node = node
        this._indexer = func
        this._adapter = new adapter()
        this._adapter.add(this._node)
        this._curNode = undefined
    }


    reset(): void {
        if (this._node == undefined) {
            return
        }
        this._curNode = undefined
        this._adapter.clear()
        this._adapter.add(this._node)
    }

    moveNext(): boolean {
        if (this._adapter.isEmpty) {
            return false
        }

        this._curNode = this._adapter.remove()
        if (this._curNode != undefined) {
            let len: number = this._curNode.childCount
            for (let i = 0; i < len; ++i) {
                let childIdx = this._indexer(len, i)
                let child = this._curNode.getChildAt(childIdx)
                if (child !== undefined) {
                    this._adapter.add(child)
                }
            }
        }
        return true
    }

    public get current(): Maybe<TreeNode<T>> {
        return this._curNode
    }

}

export class NodeB2TEnumerator<T> implements IEnumerator<TreeNode<T>> {

    private _iter: IEnumerator<TreeNode<T>>
    private _arr!: Maybe<Array<TreeNode<T>>>
    private _arrIdx!: number

    public constructor(iter: IEnumerator<TreeNode<T>>) {
        this._iter = iter
        this.reset()
    }



    public reset(): void {
        this._arr = [] /// 清空数组
        /// 调用先根枚举器,将结果全部存入数组
        while (this._iter.moveNext()) {
            this._arr.push(this._iter.current)
        }
        // 设置_arrIdx为数组的length
        // 因为后根遍历是先根遍历的逆操作,所以是从数组尾部向顶部的遍历
        this._arrIdx = this._arr.length
    }
    public get current(): Maybe<TreeNode<T>> {
        if (this._arrIdx >= this._arr.length) {
            return undefined
        }
        else {
            return this._arr[this._arrIdx]
        }
    }

    public moveNext(): boolean {
        this._arrIdx--
        return (this._arrIdx >= 0 && this._arrIdx < this._arr.length)
    }


}

export class NodeEnumeratorFactory {
    // DFS(stack) order by left to right and top to bottom
    public static create_df_l2r_t2b_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeT2BEnumerator(node, IndexerR2L, Stack)
        return iter
    }

    // DFS(stack) order by right to left and top to bottom
    public static create_df_r2l_t2b_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeT2BEnumerator(node, IndexerL2R, Stack)
        return iter
    }

    /// BFS(queue) order by left to right and top to bottom
    public static create_bf_l2r_t2b_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeT2BEnumerator(node, IndexerL2R, Queue)
        return iter
    }

    /// BFS(queue) order by right to left and top to bottom
    public static create_bf_r2l_t2b_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeT2BEnumerator(node, IndexerR2L, Queue)
        return iter
    }

    // DFS(stack) order by left to right and top to bottom
    public static create_df_l2r_b2t_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeB2TEnumerator(this.create_df_l2r_t2b_iter(node))
        return iter
    }

    // DFS(stack) order by right to left and top to bottom
    public static create_df_r2l_b2t_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeB2TEnumerator(this.create_df_r2l_t2b_iter(node))
        return iter
    }

    /// BFS(queue) order by left to right and top to bottom
    public static create_bf_l2r_b2t_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeB2TEnumerator(this.create_bf_l2r_t2b_iter(node))
        return iter
    }

    /// BFS(queue) order by right to left and top to bottom
    public static create_bf_r2l_b2t_iter<T>(node: Maybe<TreeNode<T>>): IEnumerator<TreeNode<T>> {
        let iter = new NodeB2TEnumerator(this.create_bf_r2l_t2b_iter(node))
        return iter
    }
}