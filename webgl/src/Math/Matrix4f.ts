namespace TSE {
    export class Matrix4f {
        private _data : number[] = []

        constructor(){
            this._data = [
                1.0, 0 , 0,0,
                0, 1.0 , 0,0,
                0, 0, 1.0 , 0,
                0, 0,  0, 1.0
            ]
        }

        public static indentity() : Matrix4f {
            return new Matrix4f()
        }
        
        public get data() : number[] {
            return this._data
        }

        public static orthorthographic(left: number, right: number, bottom: number, top: number, nearClip: number, farClip: number): Matrix4f {
            let m = this.indentity()
            let rml = 1.0 / (left - right)
            let tmb = 1.0 / (bottom - top)
            let nmf = 1.0 / (nearClip - farClip)

            m._data[0] = -2.0 * rml
            m._data[5] = -2.0 * tmb
            m._data[10] = -2.0 * nmf
            /// opengl 是列主
            m._data[12] = rml * (right + left)
            m._data[13] = tmb * (top + bottom)
            m._data[14] = nmf * (nearClip+farClip)
            return m
        }
        
        public static translation(position: Vector3) : Matrix4f {
            let m = new Matrix4f()

            m._data[12] = position.x
            m._data[13] = position.y
            m._data[14] = position.z
            return m
        }
    }
}