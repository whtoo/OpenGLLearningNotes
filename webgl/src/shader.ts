namespace TSE {
    /**
     * Represents a WebGL shader
     */
    export class Shader {
        private _name : string
        private _program : WebGLProgram
        /// 字典存储
        private _attributes : { [name:string] : number} = {}
        private _uniforms : { [name:string] : WebGLUniformLocation} = {}

        /**
         * 
         * @param name 
         * @param vertexSrc 
         * @param fragmentSrc 
         */
        public constructor(name:string,vertexSrc:string,fragmentSrc:string) {
            this._name = name
            /// 1. create shaders both vertex and fragment
            let vertexShader = this.loadShader(vertexSrc,gl.VERTEX_SHADER)
            let fragmentShader = this.loadShader(fragmentSrc,gl.FRAGMENT_SHADER)
            /// 2. bind them to program and compile and link
            this.createProgram(vertexShader,fragmentShader)
            this.detectAttributes()
            this.detectUniforms()
        }

        /**
         * Get shader's name
         * @param name The name of shader
         */
        public get name(): string {
            return this._name
        }
/**
 * Use this shader
 */
        public use() : void {
            gl.useProgram(this._program)
        }

        private loadShader(source:string,shaderType:number) : WebGLShader {
            let shader : WebGLShader = gl.createShader(shaderType);
            /// bind source to shader
            gl.shaderSource(shader,source)
            /// compile shader
            gl.compileShader(shader)
            let error = gl.getShaderInfoLog(shader).trim()
            if(error !== "" ) {
                throw new Error("Error compiling shader" + this._name + ":" + error + "shaderType "+" " + source)
            }
            return shader
        }

        private createProgram(vertexShader:WebGLShader,fragmentShader:WebGLShader): void {
            this._program = gl.createProgram()
            gl.attachShader(this._program,vertexShader)
            gl.attachShader(this._program,fragmentShader)

            gl.linkProgram(this._program)

            let error = gl.getProgramInfoLog(this._program).trim();
            if( error !== "" ) {
                throw new Error("Error linking shader " + this._name + ":" + error)
            }
        }

        /**
         * 查询属性的slot
         */
        private detectAttributes(): void {
            let attributeCount = gl.getProgramParameter(this._program,gl.ACTIVE_ATTRIBUTES);
            for(let i = 0; i < attributeCount; ++i) {
                let info: WebGLActiveInfo = gl.getActiveAttrib(this._program,i)
                if(!info) { break}
                this._attributes[info.name] = gl.getAttribLocation(this._program,info.name)
            }
        }

        /**
         * 获取具有提供名称的属性的location
         * @param name 要检索location的属性名称
         */
        public getAttributeLocation(name:string):number {
            if(this._attributes[name] === undefined) {
                throw new Error(`Unable to find attribute named '${name}' in shader named '${this._name}'`)
            }

            return this._attributes[name]
        }

        /**
         * Gets the locaiton of an uniform with the provided name.
         * @param name The name of the uniform whose location to retrieve
         */
        public getUniformLocation(name:string): WebGLUniformLocation {
            if(this._uniforms[name] === undefined) {
                throw new Error(`Unable to find uniform named '${name}' in shader named '${this._name}'`)
            }
            return this._uniforms[name]
        
        }

        private detectUniforms(): void {
            let uniformCount = gl.getProgramParameter(this._program,gl.ACTIVE_UNIFORMS)
            for(let i = 0; i < uniformCount; ++i){
                let info : WebGLActiveInfo = gl.getActiveUniform(this._program,i)
                if(!info) {
                    break
                }

                this._uniforms[info.name] = gl.getUniformLocation(this._program,info.name)
            }
        }



    }
}