namespace TSE {
    export class Sprite {
        protected _name : string
        protected _width : number
        protected _height : number
        protected _buffer : GLBuffer
        public position : Vector3 = new Vector3();
        private _materialName : string
        private _material : Material

/**
 * 
 * @param name The name of the material to  use with this sprite
 * @param width The width of this sprite
 * @param height The height of this sprite
 */
        public constructor(name:string ,materialName:string, width : number = 100, height : number = 100) {
            this._name = name
            this._width = width
            this._height = height
            this._materialName = materialName
            this._material = MaterialManager.getMaterial(materialName)
        }

        public get materialName() : string {
            return this._materialName
        }

        public get name() : string {
            return this._name
        }
        
        public destroy() : void {
            this._buffer.destroy()
            MaterialManager.releaseMaterial(this.materialName)
            this._material = null;
            this._materialName = null;
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

        public draw(shader:BaseShader) : void {
            let colorPos = shader.getUniformLocation('u_tint')
            gl.uniform4fv(colorPos,this._material.tint.toFloat32Array())

            let modelPos = shader.getUniformLocation('u_model')
            gl.uniformMatrix4fv(modelPos,false,new Float32Array(Matrix4f.translation(this.position).data))


            if (this._material.diffuseTexture !== undefined) {
                this._material.diffuseTexture.activateAndBind(0);
                let diffuseLocation = shader.getUniformLocation("u_sampler");
                gl.uniform1i(diffuseLocation, 0);
            }

            this._buffer.bind()
            this._buffer.draw()
        }

    }

   
}