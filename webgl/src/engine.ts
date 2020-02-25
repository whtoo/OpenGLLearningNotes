namespace TSE {
    /**
     * 游戏引擎类
     */
    export class Engine {
        /**
         * 构造函数
         */
        public constructor() {
            console.log("hello world")
        }

        private _count: number = 0;
        private _canvas: HTMLCanvasElement
        private _shader: Shader
        // 缓冲区是显卡和CPU交换数据的内存区域,专用于着色器
        private _buffer: WebGLBuffer

        /**
         * 启动函数
         */
        public start(): void {
            this._canvas = GLUtilities.initialize()
            gl.clearColor(1, 0, 0, 1)
            /// Draw flow
            this.loadShaders()
            this._shader.use()
            this.createBuffer()
            this.resize()
            /// Loop start
            this.loop();
        }
        public resize(): void {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth
                this._canvas.height = window.innerHeight
            }
            gl.viewport(0,0 , window.innerWidth, window.innerHeight);
        }
        private loop(): void {
            this._count++;
            document.title = this._count.toString();
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.loop.bind(this));
        }

        private loadShaders(): void {
            let vertexShaderSource = `
            attribute vec3 a_position;

            void main() {
                gl_Position = vec4(a_position,1.0);
            }
            `
            let fragmentShaderSource = `
            precision mediump float;

            void main() {
                gl_FragColor = vec4(1.0,1.0,1.0,1.0);
            }
            `
            this._shader = new Shader('base', vertexShaderSource, fragmentShaderSource)
        }

        private createBuffer(): void {
            this._buffer = gl.createBuffer()

            let vertices = [
                // x,y,z
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0
            ]

            gl.bindBuffer(gl.ARRAY_BUFFER,this._buffer)
            gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0)
            gl.enableVertexAttribArray(0)
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW)

            gl.bindBuffer(gl.ARRAY_BUFFER,undefined)
            gl.disableVertexAttribArray(0)

        }

    }
}