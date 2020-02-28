namespace TSE {
    /**
     * Represent the information needed for a GLBuffer attribute
     */
    export class AttributeInfo {
        /**
         * The location of attribute
         */
        public location: number

        /**
         * The size (number of elements) in this attribute (i.e Vector3 = 3)
         */
        public size: number

        public offset: number = 0
    }

    export class GLBuffer {
        private _hasAttributeLocation: boolean = false
        private _elementSize: number
        private _stride: number
        private _buffer: WebGLBuffer

        private _targetBufferType: number
        private _dataType: number
        private _mode: number
        private _typeSize: number

        private _data: number[] = []
        private _attributes: AttributeInfo[] = []

        private checkError(funcName:string,flag:string):void {
            if(gl.getError() !== gl.NO_ERROR){
                console.log(funcName,flag,gl.getError())
                throw new Error("The "+funcName +":::"+flag+"::"+gl.getError())
            }
        }
        /**
         * Create a new GL buffer
         * @param dataType The data type of this buffer. Default : gl.Float
         * @param tagetBufferType The buffer target type. Can be either gl.ARRAY_BUFFER or
         * gl.ELEMENT_ARRAY_BUFFER. Default : gl.ARRAY_BUFFER
         * @param mode The drawing mode of this buffer.(i.e. gl.TRIANGLES or gl.LINES). Default:
         * gl.TRIANGLES
         */
        public constructor(dataType: number = gl.FLOAT, targetBufferType: number = gl.ARRAY_BUFFER, mode: number = gl.TRIANGLES) {
            this._elementSize = 0
            this._dataType = dataType
            this._targetBufferType = targetBufferType
            this._mode = mode

            switch (this._dataType) {
                case gl.FLOAT:
                case gl.INT:
                case gl.UNSIGNED_INT:
                    this._typeSize = 4
                    break;
                case gl.SHORT:
                case gl.UNSIGNED_SHORT:
                    this._typeSize = 2
                    break
                case gl.BYTE:
                case gl.UNSIGNED_BYTE:
                    this._typeSize = 1
                    break
                default:
                    throw new Error("Unrecongnized data type: " + dataType.toString())
            }

            this._buffer = gl.createBuffer()
            if(!this._buffer) {
                throw new Error("Can't allocate buffer from WebGL")
            }
        }
        /**
         * Destroy Buffer
         */
        public destroy(): void {
            gl.deleteBuffer(this._buffer);
        }

        /**
         * Binds this buffer
         * @param normalized indicates if the data should be normalized. Default : false
         */
        public bind(normalized: boolean = false): void {
            gl.bindBuffer(this._targetBufferType, this._buffer)
            this.checkError('bind','start')

            if (this._hasAttributeLocation) {
                for (let attr of this._attributes) {
                    gl.vertexAttribPointer(attr.location, attr.size, this._dataType, normalized, this._stride, attr.offset * this._typeSize)
                    gl.enableVertexAttribArray(attr.location)
                    this.checkError('bind','loop')
                }
            }
            this.checkError('bind','end')
        }

        /**
         * Unbind this buffer
         */
        public unbind(): void {
            for(let attr of this._attributes) {
                /// disconnect buffer with attr
                gl.disableVertexAttribArray(attr.location)
                this.checkError('unbind','start')
            }
            /// reset to null
            gl.bindBuffer(this._targetBufferType,undefined)
            this.checkError('unbind','end')
        }

        /**
         * Adds an attribute with the provided information to this buffer
         * @param info The information to be added
         */
        public addAttributeLocation(info: AttributeInfo) : void {
            this._hasAttributeLocation = true
            info.offset = this._elementSize
            this._attributes.push(info)
            this._elementSize += info.size
            this._stride = this._elementSize * this._typeSize
        }

        /**
         * Replaces the current data in this buffer with the provided data.
         * @param data The data to be loaded in this buffer
         */
        public setData(data: number[]):void {
            this.clearData()
            this.pushBackData(data)
        }
        
        public pushBackData(data: number[]) : void{
            for(let d of data) {
                this._data.push(d)
            }
        }

        public clearData() : void {
            this._data.length = 0
        }

        public upload(): void {
            /// 状态标记要操作的buffer类型
            gl.bindBuffer(this._targetBufferType,this._buffer)
            this.checkError('upload','start')
            let bufferData: ArrayBuffer
            switch (this._dataType) {
                case gl.FLOAT:
                    bufferData = new Float32Array(this._data)
                    break;
                case gl.INT:
                bufferData = new Int32Array(this._data)
                break
                case gl.UNSIGNED_INT:
                    bufferData  = new Uint32Array(this._data)
                    break
                case gl.SHORT:
                    bufferData = new Int16Array(this._data)
                    break
                case gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data)
                    break
                case gl.BYTE:
                    bufferData = new Int8Array(this._data)
                    break
                case gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data)
                    break
            }
            ///  根据类型选择要写的buffer;buffer只传入一次,可能需要多次绘制
            gl.bufferData(this._targetBufferType,bufferData,gl.STATIC_DRAW)
            this.checkError('upload','end')

        }

        public draw() : void {
            if(this._targetBufferType === gl.ARRAY_BUFFER) {
                gl.drawArrays(this._mode, 0, this._data.length / this._elementSize)
            } else if(this._targetBufferType == gl.ELEMENT_ARRAY_BUFFER) {
                gl.drawElements(this._mode,this._data.length,this._dataType,0)
            }
        }

    }



}