export type Nullable<T> = (T | null)
export type Maybe<T> = (T | undefined)

export interface IEnumerator<T> {
    reset() : void
    moveNext() : boolean
    readonly current : Maybe<T>
}