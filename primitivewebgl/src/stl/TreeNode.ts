export class TreeNode<T> {
    private _parent: TreeNode<T> | undefined
    private _children: Array<TreeNode<T>> | undefined
    public name : string
    public data : T | undefined

    //TODO:  增加 addChildNode,removeNode,findNode
}