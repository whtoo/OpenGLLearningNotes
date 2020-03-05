namespace TSG {
    export class BasicShader extends BaseShader {
        public static defaultVertexSrc(): string {
            const vertexSrc = `
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;
            attribute vec2 aTextureCoord;
        
            uniform mat4 uNormalMatrix;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;
        
            void main(void) {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
              vTextureCoord = aTextureCoord;
        
              // Apply lighting effect
        
              highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
              highp vec3 directionalLightColor = vec3(1, 1, 1);
              highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
        
              highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
        
              highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
              vLighting = ambientLight + (directionalLightColor * directional);
            }
            `

            return vertexSrc
        }

        public static defaultFragmentSrc(): string {
            const fragmentSrc = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;

            uniform sampler2D uSampler;

            void main(void) {
            highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

            gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
            }
            `

            return fragmentSrc
        }

        public constructor(glContext: WebGLRenderingContext, source: string, type: ShaderType, name: string) {
            super(glContext, source, type, name)
        }

        public static createDefaultShader(glContext: WebGLRenderingContext, type: ShaderType, name: string): BasicShader {
            const src = type === ShaderType.VERTEX_SHADER ? this.defaultVertexSrc() : this.defaultFragmentSrc()
            let shader = new BasicShader(glContext, src, type, name)

            return shader
        }

    }
}