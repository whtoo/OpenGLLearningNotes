namespace TSE {
    export class Sprite {
        protected _name : string
        protected _width : number
        protected _height : number
        protected _buffer : GLBuffer
        public position : Vector3 = new Vector3();
        private _textureName : string
        private _texture : Texture

/**
 * 
 * @param name The name of the material to  use with this sprite
 * @param width The width of this sprite
 * @param height The height of this sprite
 */
        public constructor(name:string , width : number = 100, height : number = 100,textureName:string) {
            this._name = name
            this._width = width
            this._height = height
            this._textureName = textureName
            this._texture = TextureManager.getTexture(textureName)
        }

        public get textureName() : string {
            return this._textureName
        }

        public get name() : string {
            return this._name
        }
        
        public destroy() : void {
            this._buffer.destroy()
            TextureManager.releaseTexture(this.textureName)
        }
        
        public load():void {
            this._buffer = new GLBuffer();
            let positionArribute = new AttributeInfo();
            positionArribute.location = 0
            positionArribute.offset = 0;
            positionArribute.size = 3;
            this._buffer.addAttributeLocation(positionArribute);

            let texCoordArribute = new AttributeInfo();
            texCoordArribute.location = 1
            texCoordArribute.offset = 3;
            texCoordArribute.size = 2;
            this._buffer.addAttributeLocation(texCoordArribute);

            /// Drawing follow clockwise order
            let vertices = [
                // x,y,z,u,v
                // x, y, z , u, v
                0, 0, 0, 0 ,0 ,
                0, this._height, 0, 0, 1.0, 
                this._width, this._height, 0, 1.0, 1.0, 
                this._width, this._height, 0, 1.0, 1.0, 
                this._width, 0, 0, 1.0, 0,
                0, 0, 0,  0, 0
            ]

            this._buffer.pushBackData(vertices)
            this._buffer.upload()
            this._buffer.unbind()
        }

         /**
         * update
         */
        public update() : void {
            
        }

        public draw(shader:Shader) : void {
            this._texture.activateAndBind(0)
            let diffuseLocation = shader.getUniformLocation('u_sampler')
            gl.uniform1i(diffuseLocation,0)

            this._buffer.bind()
            this._buffer.draw()
        }

    }

   
}