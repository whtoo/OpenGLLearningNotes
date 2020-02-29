namespace TSE {
    export class BasicShader extends BaseShader {
        public constructor() {
            super("basic")
            this.loadShaders(this.getVertexShaderSource(),this.getFragmentShaderSource())

        }


        private getVertexShaderSource() : string {
            let vertexShaderSource = `
            attribute vec3 a_position;
            attribute vec2 a_texCoord;

            uniform mat4 u_projection;
            uniform mat4 u_model;
            varying vec2 v_texCoord;

            void main() {
                gl_Position = u_projection * u_model *vec4(a_position,1.0);
                v_texCoord = a_texCoord;
            }
            `
            return vertexShaderSource
        }

        private getFragmentShaderSource() : string {
            let fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_tint;
            uniform sampler2D u_sampler;

            varying vec2 v_texCoord;

            void main() {
                gl_FragColor = u_tint * texture2D(u_sampler,v_texCoord);
            }
            `
            return fragmentShaderSource
        }
    }
}