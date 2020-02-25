namespace TSE {
    /**
     * Represents a WebGL shader
     */
    export class Shader {
        private _name : string
        private _program : WebGLProgram

        public constructor(name:string,vertexSrc:string,fragmentSrc:string) {
            this._name = name
            /// 1. create shaders both vertex and fragment
            let vertexShader = this.loadShader(vertexSrc,gl.VERTEX_SHADER)
            let fragmentShader = this.loadShader(fragmentSrc,gl.FRAGMENT_SHADER)
            /// 2. bind them to program and compile and link
            this.createProgram(vertexShader,fragmentShader)
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
    }
}