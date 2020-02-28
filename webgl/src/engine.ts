namespace TSE {
    /**
     * 游戏引擎类
     */
    export class Engine {
        /**
         * 构造函数
         */
        public constructor() {
            console.log("Engine initialized")
        }

        private _count: number = 0;
        private _canvas: HTMLCanvasElement
        private _shader: Shader
        // 缓冲区是显卡和CPU交换数据的内存区域,专用于着色器
        private _sprite : Sprite
        private _projectionMatrix : Matrix4f
        private _modelMatrix : Matrix4f
        private _previousTime : number
        /**
         * 启动函数
         */
        public start(): void {
            MessageBus.update(0)

            this._canvas = GLUtilities.initialize()
            AssetManager.initialize()

            gl.clearColor(0.5, 0.5, 0.5, 1)
            /// Draw flow
            this.loadShaders()
            this._shader.use()
            this._projectionMatrix = Matrix4f.orthorthographic(0,this._canvas.clientWidth,0,this._canvas.clientHeight,-1,100)
            this._modelMatrix = Matrix4f.translation(new Vector3(200,0,0))
            this._sprite = new Sprite("test",'texturezero.png')
            this._sprite.load()

            this.resize()

            /// Loop start
            this.loop();
        }
        public resize(): void {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth
                this._canvas.height = window.innerHeight
            }
            gl.viewport(0, 0,  gl.drawingBufferWidth, gl.drawingBufferHeight);
        }

        private updateMVPMatrix() : void {
            this._projectionMatrix = Matrix4f.orthorthographic(0,this._canvas.clientWidth,0,this._canvas.clientHeight,-1,100)

            let projectionPos = this._shader.getUniformLocation('u_projection')
            gl.uniformMatrix4fv(projectionPos,false,new Float32Array(this._projectionMatrix.data))
            
            let modelMatrix = this._shader.getUniformLocation('u_model')
            gl.uniformMatrix4fv(modelMatrix,false,new Float32Array(this._modelMatrix.data))
        }

        private loop(): void {
            this._count++;
            document.title = this._count.toString();
            let delta = performance.now() - this._previousTime;

            this.update( delta );
            /// Render cmd
            gl.clear(gl.COLOR_BUFFER_BIT)
            let colorPosition = this._shader.getUniformLocation('u_tint')
            gl.uniform4f(colorPosition,1,0.5,1,1)
            this.updateMVPMatrix();
            this._sprite.draw(this._shader)

            this._previousTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        }

        private update(delta: number) : void {
            MessageBus.update(delta)
        }

        private loadShaders(): void {
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
            let fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_tint;
            uniform sampler2D u_sampler;

            varying vec2 v_texCoord;

            void main() {
                gl_FragColor = u_tint * texture2D(u_sampler,v_texCoord);
            }
            `
            this._shader = new Shader('base', vertexShaderSource, fragmentShaderSource)
        }

    }
}