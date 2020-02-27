namespace TSE {
    export class Sprite {
        protected _name : string
        protected _width : number
        protected _height : number
        protected _buffer : GLBuffer
        public position : Vector3 = new Vector3();
/**
 * 
 * @param name The name of the material to  use with this sprite
 * @param width The width of this sprite
 * @param height The height of this sprite
 */
        public constructor(name:string , width : number = 100, height : number = 100) {
            this._name = name
            this._width = width
            this._height = height
        }

        public load():void {
            this._buffer = new GLBuffer()
            let positionAttribute = new AttributeInfo()
            positionAttribute.location = 0 //this._shader.getAttributeLocation("a_position")
            positionAttribute.offset = 0
            positionAttribute.size = 3
            this._buffer.addAttributeLocation(positionAttribute)
            /// Drawing follow clockwise order
            let vertices = [
                // x,y,z
                0, 0, 0,
                0, this._height, 0,
                this._width, this._height, 0,

                this._width,this._height,0,
                this._width,0,0,
                0,0,0
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

        public draw() : void {
            this._buffer.bind()
            this._buffer.draw()
        }

    }

   
}