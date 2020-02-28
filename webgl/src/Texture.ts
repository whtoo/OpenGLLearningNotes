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

            gl.texImage2D(gl.TEXTURE_2D,LEVEL,gl.RGBA,1,1,BORDER,gl.RGBA,gl.UNSIGNED_BYTE,TEMP_IMAGE_DATA)

            let asset = AssetManager.getAsset(this._name) as ImageAsset
            if(asset !== undefined) {
                this.loadTextureFromAsset(asset)
            } else {
                Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED+this._name,this)
            }
        }

        public get name():string {
            return this._name
        }

        public get isLoaded():boolean{
            return this._isLoaded
        }

        public get width():number {
            return this._width
        }

        public get height():number {
            return this._height
        }

        public destroy():void {
            gl.deleteTexture(this._handler)
        }

        public activateAndBind(textureUnit : number = 0) : void {
            gl.activeTexture(gl.TEXTURE + textureUnit)
            this.bind()
        }
        public bind(): void {
            gl.bindTexture(gl.TEXTURE_2D,this._handler)
        }
        
        public unbind() : void {
            gl.bindTexture(gl.TEXTURE_2D,undefined)
        }

        public onMessage(message: Message): void {
            if(message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
                this.loadTextureFromAsset(message.context as ImageAsset)
            }
        }

        private loadTextureFromAsset(asset: ImageAsset) : void {
            this._width = asset.width
            this._handler = asset.height

            this.bind()

            gl.texImage2D(gl.TEXTURE_2D,LEVEL,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,asset.data)

            this._isLoaded = true
        }
        
    }
}