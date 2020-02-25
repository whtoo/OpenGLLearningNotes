var engine;
window.onload = function () {
    engine = new TSE.Engine();
    engine.start();
};
window.onresize = function () {
    engine.resize();
};

var TSE;
(function (TSE) {
    /**
     * 游戏引擎类
     */
    class Engine {
        /**
         * 构造函数
         */
        constructor() {
            this._count = 0;
            console.log("Engine initialized");
        }
        /**
         * 启动函数
         */
        start() {
            this._canvas = TSE.GLUtilities.initialize();
            TSE.gl.clearColor(1, 0, 0, 1);
            /// Draw flow
            this.loadShaders();
            this._shader.use();
            this.createBuffer();
            this.resize();
            /// Loop start
            this.loop();
        }
        resize() {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
            }
            TSE.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        }
        loop() {
            this._count++;
            document.title = this._count.toString();
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, this._buffer);
            TSE.gl.vertexAttribPointer(0, 3, TSE.gl.FLOAT, false, 0, 0);
            TSE.gl.enableVertexAttribArray(0);
            TSE.gl.drawArrays(TSE.gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.loop.bind(this));
        }
        loadShaders() {
            let vertexShaderSource = `
            attribute vec3 a_position;

            void main() {
                gl_Position = vec4(a_position,1.0);
            }
            `;
            let fragmentShaderSource = `
            precision mediump float;

            void main() {
                gl_FragColor = vec4(1.0,1.0,1.0,1.0);
            }
            `;
            this._shader = new TSE.Shader('base', vertexShaderSource, fragmentShaderSource);
        }
        createBuffer() {
            this._buffer = TSE.gl.createBuffer();
            let vertices = [
                // x,y,z
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0
            ];
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, this._buffer);
            TSE.gl.vertexAttribPointer(0, 3, TSE.gl.FLOAT, false, 0, 0);
            TSE.gl.enableVertexAttribArray(0);
            TSE.gl.bufferData(TSE.gl.ARRAY_BUFFER, new Float32Array(vertices), TSE.gl.STATIC_DRAW);
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, undefined);
            TSE.gl.disableVertexAttribArray(0);
        }
    }
    TSE.Engine = Engine;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /**
     * 负责设置WebGL渲染上下文
     */
    class GLUtilities {
        /**
         * 初始化WebGL,如果已经定义画布了就是查找.
         * @param elementId 要搜索的元素ID
         */
        static initialize(elementId) {
            let canvas;
            if (elementId !== undefined) {
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("Cannot find a canvas element named:" + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            // 可能浏览器不支持，要做一下检查
            TSE.gl = canvas.getContext("webgl");
            if (TSE.gl === undefined || TSE.gl === null) {
                TSE.gl = canvas.getContext("experimental-webgl");
                if (TSE.gl === undefined || TSE.gl === null) {
                    throw new Error("Unable to initialize WebGL!");
                }
            }
            return canvas;
        }
    }
    TSE.GLUtilities = GLUtilities;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /**
     * Represents a WebGL shader
     */
    class Shader {
        constructor(name, vertexSrc, fragmentSrc) {
            this._name = name;
            /// 1. create shaders both vertex and fragment
            let vertexShader = this.loadShader(vertexSrc, TSE.gl.VERTEX_SHADER);
            let fragmentShader = this.loadShader(fragmentSrc, TSE.gl.FRAGMENT_SHADER);
            /// 2. bind them to program and compile and link
            this.createProgram(vertexShader, fragmentShader);
        }
        /**
         * Get shader's name
         * @param name The name of shader
         */
        get name() {
            return this._name;
        }
        /**
         * Use this shader
         */
        use() {
            TSE.gl.useProgram(this._program);
        }
        loadShader(source, shaderType) {
            let shader = TSE.gl.createShader(shaderType);
            /// bind source to shader
            TSE.gl.shaderSource(shader, source);
            /// compile shader
            TSE.gl.compileShader(shader);
            let error = TSE.gl.getShaderInfoLog(shader).trim();
            if (error !== "") {
                throw new Error("Error compiling shader" + this._name + ":" + error + "shaderType " + " " + source);
            }
            return shader;
        }
        createProgram(vertexShader, fragmentShader) {
            this._program = TSE.gl.createProgram();
            TSE.gl.attachShader(this._program, vertexShader);
            TSE.gl.attachShader(this._program, fragmentShader);
            TSE.gl.linkProgram(this._program);
            let error = TSE.gl.getProgramInfoLog(this._program).trim();
            if (error !== "") {
                throw new Error("Error linking shader " + this._name + ":" + error);
            }
        }
    }
    TSE.Shader = Shader;
})(TSE || (TSE = {}));
