export interface NamedEntity {
        /**
         * name
         */
        name(): string;
    }

    export enum ShaderType {
        VERTEX_SHADER = WebGLRenderingContext.VERTEX_SHADER,
        FRAMENT_SHADER = WebGLRenderingContext.FRAGMENT_SHADER
    }

    export class BaseShader implements NamedEntity {

        /**
         * 着色器的类型
         */
        _type: ShaderType
        _name: string

        /**
         * 着色器的源码字符串
         */
        _source: string

        _glContext: WebGLRenderingContext

        _glShader: WebGLShader

        constructor(glContext: WebGLRenderingContext, source: string, type: ShaderType, name: string) {
            this._type = type
            this._source = source
            this._glContext = glContext
            this._name = name

            let glShader = glContext.createShader(type)
            glContext.shaderSource(glShader, source)
            glContext.compileShader(glShader)

            if (glContext.getShaderParameter(glShader, glContext.COMPILE_STATUS) !== glContext.NO_ERROR) {
                const errInfo = glContext.getShaderInfoLog(glShader)
                glContext.deleteShader(glShader)
                const typeName = type === ShaderType.VERTEX_SHADER ? "vertex_shader" : "fragment_shader"
                throw new Error("There is a " + typeName + "error occured at " + this.name() + " as " + errInfo + " within source " + source)
            }

            this._glShader = glShader
        }

        name(): string {
            return this._name
        }

        shader(): WebGLShader {
            return this._glShader
        }
}