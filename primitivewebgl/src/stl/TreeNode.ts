import { Nullable, Maybe } from './Traits'
export class TreeNode<T> {
    private _parent: Maybe<TreeNode<T>>
    private _children:  Maybe<Array<TreeNode<T>>>
    public name : string
    public data : Maybe<T>

    public constructor(data:Maybe<T> = undefined,  parent: Maybe<TreeNode<T>> = undefined,name:string = ''){
        this._parent = parent
        this._children = undefined
        this.name = name
        this.data = data
        if(this._parent !== undefined) {
            this._parent.addChild(this)
        }
    }
    public isDescendantOf(ancestor: Maybe<TreeNode<T> >) : boolean {
        // undefined check
        if(ancestor === undefined) {
            return false
        }

        // travel from parent of current node
        let node : Maybe<TreeNode<T> > = this._parent
        for(let node: Maybe<TreeNode<T> > = this._parent; node !== undefined;node = node._parent){
            //  ancestor of the current node is equal to ancestor
            if(node === ancestor) {
                return true
            }
        }
        return false
    }
    /**
     * Remove methods 
     */
    public removeChildAt(index: number): Maybe<TreeNode<T> > {
        if(this._children === undefined) {
            return undefined
        }

        let child : Maybe<TreeNode<T> > = this.getChildAt(index)
        if(child === undefined) {
            return undefined
        }

        this._children.splice(index,1)
        child._parent = undefined
        return child
    }

    public removeChild(child: Maybe<TreeNode<T> >): TreeNode<T>{
        if(child === undefined) {
            return undefined
        }

        if(this._children === undefined) {
            return undefined
        }

        let index = -1
        for(let i = 0; i < this._children.length; ++i) {
            if(this.getChildAt(i) === child) {
                index = i
                break
            }
        }
        if(index == -1) {
            return undefined
        }

        return this.removeChildAt(index)
    }


    public remove(): Maybe<TreeNode<T>> {
        if(this._parent !== undefined) {
            return this._parent.removeChild(this)
        }
        return undefined
    }

    /**
     * Add methods
     */

     public addChildAt(child: TreeNode<T>, index:number) : Maybe<TreeNode<T>> {
        if(this.isDescendantOf(child)) {
            return undefined
        }

        if(this._children === undefined) {
            this._children = []
        }

        if(index >= 0 && index <= this._children.length) {
            if(child._parent !== undefined) {
                child._parent.removeChild(child)
            }
            child._parent = this
            this._children.splice(index,0,child)
            return child
        } else {
            return undefined
        }
     }

     public addChild(child: TreeNode<T>) : Maybe<TreeNode<T>> {
         if(this._children === undefined) {
             this._children = []
         }
         return this.addChildAt(child,this._children.length)
     }

     /**
      * Getter
      */
     public get parent(): Maybe<TreeNode<T>> {
         return this._parent
     }

     public getChildAt(index:number) : Maybe<TreeNode<T>> {
         if(this._children === undefined) {
             return undefined
         }

         if(index < 0 || index >= this._children.length) {
             return undefined
         }

         return this._children[index]
     }

     public get childCount() : number {
         if(this._children !== undefined) {
             return this._children.length
         } else {
             return 0
         }
     }

     public hasChild() : boolean {
         return this._children !== undefined && this._children.length > 0
     }

     public get root() : Maybe<TreeNode<T>> {
         let cur : Maybe<TreeNode<T>> = this
         while(cur !== undefined && cur.parent !== undefined) {
             cur = cur.parent
         }

         return cur
     }

     public get depth():number {
         let cur : Maybe<TreeNode<T>> = this
         let level : number = 0
         while(cur !== undefined && cur.parent !== undefined) {
             cur = cur.parent
             level++
         }
         return level
     }     
}