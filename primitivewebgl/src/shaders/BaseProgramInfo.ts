import { BaseShader , ShaderType, NamedEntity } from './Shader'

export class BaseProgramInfo implements NamedEntity {

        _name: string
        _vertexShader: BaseShader;
        _fragmentShader: BaseShader;
        _gl: WebGLRenderingContext
        _glProgram: WebGLProgram
        _uniformMaps : {[name:string]:WebGLUniformLocation} = {}


        public setUniformMat4f(uniformName:string,val:Float32Array){
            const loc = this.getUniformLocation(uniformName)
            this._uniformMaps[uniformName] = loc
        }

        getUniformLocation(uniformName:string) : WebGLUniformLocation {
            return this._gl.getUniformLocation(this._glProgram,uniformName)
        }

        public setAttrib(attribName:string,val:number) {

        }

        getAttribLocation(attribName:string) : number {
            /// TODO: add impl
            return 0
        }

        public constructor(glContext: WebGLRenderingContext, name: string, vetexSrc: string, fragmentSrc: string) {

            this._vertexShader = new BaseShader(this._gl, vetexSrc, ShaderType.VERTEX_SHADER, name)
            this._fragmentShader = new BaseShader(this._gl, fragmentSrc, ShaderType.FRAMENT_SHADER, name)
            this._glProgram = this._gl.createProgram()

            glContext.attachShader(this._glProgram, this._vertexShader)
            glContext.attachShader(this._glProgram, this._fragmentShader)
            glContext.linkProgram(this._glProgram)
            if (glContext.getProgramParameter(this._glProgram, glContext.LINK_STATUS) !== glContext.NO_ERROR) {
                const error = glContext.getProgramInfoLog(this.program())
                glContext.deleteProgram(this._glProgram)
                throw new Error("There is a error occured at " + this.name() + " as " + error)
            }

        }

        name(): string {
            return this._name
        }

        program(): WebGLProgram {
            return this._glProgram
        }

    }