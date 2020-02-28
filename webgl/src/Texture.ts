namespace TSE {
    const LEVEL : number = 0
    const BORDER : number = 0
    const TEMP_IMAGE_DATA: Uint8Array = new Uint8Array([255,255,255,255])

    export class Texture implements IMessageHandler {
        private _name : string
        private _handler : WebGLTexture
        private _isLoaded : boolean = false
        private _width : number
        private _height : number
        
        public constructor(name:string,width:number = 1,height: number = 1) {
            this._name =  name
            this._width = width
            this._height = height

            this._handler = gl.createTexture()

            this.bind()

            gl.texImage2D()

        }


        onMessage(message: Message): void {
            throw new Error("Method not implemented.")
        }

        
    }
}