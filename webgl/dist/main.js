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
            this._projectionMatrix = TSE.Matrix4f.orthorthographic(0, this._canvas.clientWidth, 0, this._canvas.clientHeight, -1, 100);
            this._modelMatrix = TSE.Matrix4f.translation(new TSE.Vector3(200, 0, 0));
            this._sprite = new TSE.Sprite("test");
            this._sprite.load();
            this.resize();
            /// Loop start
            this.loop();
        }
        resize() {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
            }
            TSE.gl.viewport(0, 0, TSE.gl.drawingBufferWidth, TSE.gl.drawingBufferHeight);
        }
        updateMVPMatrix() {
            this._projectionMatrix = TSE.Matrix4f.orthorthographic(0, this._canvas.clientWidth, 0, this._canvas.clientHeight, -1, 100);
            let projectionPos = this._shader.getUniformLocation('u_projection');
            TSE.gl.uniformMatrix4fv(projectionPos, false, new Float32Array(this._projectionMatrix.data));
            let modelMatrix = this._shader.getUniformLocation('u_model');
            TSE.gl.uniformMatrix4fv(modelMatrix, false, new Float32Array(this._modelMatrix.data));
        }
        loop() {
            this._count++;
            document.title = this._count.toString();
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            let colorPosition = this._shader.getUniformLocation('u_color');
            TSE.gl.uniform4f(colorPosition, 1, 0.5, 0, 1);
            this.updateMVPMatrix();
            this._sprite.draw();
            requestAnimationFrame(this.loop.bind(this));
        }
        loadShaders() {
            let vertexShaderSource = `
            attribute vec3 a_position;
            uniform mat4 u_projection;
            uniform mat4 u_model;
            void main() {
                gl_Position = u_projection * u_model *vec4(a_position,1.0);
            }
            `;
            let fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;

            void main() {
                gl_FragColor = u_color;
            }
            `;
            this._shader = new TSE.Shader('base', vertexShaderSource, fragmentShaderSource);
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
     * Represent the information needed for a GLBuffer attribute
     */
    class AttributeInfo {
        constructor() {
            this.offset = 0;
        }
    }
    TSE.AttributeInfo = AttributeInfo;
    class GLBuffer {
        /**
         * Create a new GL buffer
         * @param dataType The data type of this buffer. Default : gl.Float
         * @param tagetBufferType The buffer target type. Can be either gl.ARRAY_BUFFER or
         * gl.ELEMENT_ARRAY_BUFFER. Default : gl.ARRAY_BUFFER
         * @param mode The drawing mode of this buffer.(i.e. gl.TRIANGLES or gl.LINES). Default:
         * gl.TRIANGLES
         */
        constructor(dataType = TSE.gl.FLOAT, targetBufferType = TSE.gl.ARRAY_BUFFER, mode = TSE.gl.TRIANGLES) {
            this._hasAttributeLocation = false;
            this._data = [];
            this._attributes = [];
            this._elementSize = 0;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;
            switch (this._dataType) {
                case TSE.gl.FLOAT:
                case TSE.gl.INT:
                case TSE.gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case TSE.gl.SHORT:
                case TSE.gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case TSE.gl.BYTE:
                case TSE.gl.UNSIGNED_BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecongnized data type: " + dataType.toString());
            }
            this._buffer = TSE.gl.createBuffer();
            if (!this._buffer) {
                throw new Error("Can't allocate buffer from WebGL");
            }
        }
        checkError(funcName, flag) {
            if (TSE.gl.getError() !== TSE.gl.NO_ERROR) {
                console.log(funcName, flag, TSE.gl.getError);
            }
        }
        /**
         * Destroy Buffer
         */
        destroy() {
            TSE.gl.deleteBuffer(this._buffer);
        }
        /**
         * Binds this buffer
         * @param normalized indicates if the data should be normalized. Default : false
         */
        bind(normalized = false) {
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            this.checkError('bind', 'start');
            if (this._hasAttributeLocation) {
                for (let attr of this._attributes) {
                    TSE.gl.vertexAttribPointer(attr.location, attr.size, this._dataType, normalized, this._stride, attr.offset * this._typeSize);
                    TSE.gl.enableVertexAttribArray(attr.location);
                    this.checkError('bind', 'loop');
                }
            }
            this.checkError('bind', 'end');
        }
        /**
         * Unbind this buffer
         */
        unbind() {
            for (let attr of this._attributes) {
                /// disconnect buffer with attr
                TSE.gl.disableVertexAttribArray(attr.location);
                this.checkError('unbind', 'start');
            }
            /// reset to null
            TSE.gl.bindBuffer(this._targetBufferType, undefined);
            this.checkError('unbind', 'end');
        }
        /**
         * Adds an attribute with the provided information to this buffer
         * @param info The information to be added
         */
        addAttributeLocation(info) {
            this._hasAttributeLocation = true;
            info.offset = this._elementSize;
            this._attributes.push(info);
            this._elementSize += info.size;
            this._stride = this._elementSize * this._typeSize;
        }
        /**
         * Replaces the current data in this buffer with the provided data.
         * @param data The data to be loaded in this buffer
         */
        setData(data) {
            this.clearData();
            this.pushBackData(data);
        }
        pushBackData(data) {
            for (let d of data) {
                this._data.push(d);
            }
        }
        clearData() {
            this._data.length = 0;
        }
        upload() {
            /// 状态标记要操作的buffer类型
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            this.checkError('upload', 'start');
            let bufferData;
            switch (this._dataType) {
                case TSE.gl.FLOAT:
                    bufferData = new Float32Array(this._data);
                    break;
                case TSE.gl.INT:
                    bufferData = new Int32Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_INT:
                    bufferData = new Uint32Array(this._data);
                    break;
                case TSE.gl.SHORT:
                    bufferData = new Int16Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data);
                    break;
                case TSE.gl.BYTE:
                    bufferData = new Int8Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data);
                    break;
            }
            ///  根据类型选择要写的buffer;buffer只传入一次,可能需要多次绘制
            TSE.gl.bufferData(this._targetBufferType, bufferData, TSE.gl.STATIC_DRAW);
            this.checkError('upload', 'end');
        }
        draw() {
            if (this._targetBufferType === TSE.gl.ARRAY_BUFFER) {
                TSE.gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
            }
            else if (this._targetBufferType == TSE.gl.ELEMENT_ARRAY_BUFFER) {
                TSE.gl.drawElements(this._mode, this._data.length, this._dataType, 0);
            }
        }
    }
    TSE.GLBuffer = GLBuffer;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    class Matrix4f {
        constructor() {
            this._data = [];
            this._data = [
                1.0, 0, 0, 0,
                0, 1.0, 0, 0,
                0, 0, 1.0, 0,
                0, 0, 0, 1.0
            ];
        }
        static indentity() {
            return new Matrix4f();
        }
        get data() {
            return this._data;
        }
        static orthorthographic(left, right, bottom, top, nearClip, farClip) {
            let m = this.indentity();
            let rml = 1.0 / (left - right);
            let tmb = 1.0 / (bottom - top);
            let nmf = 1.0 / (nearClip - farClip);
            m._data[0] = -2.0 * rml;
            m._data[5] = -2.0 * tmb;
            m._data[10] = -2.0 * nmf;
            /// opengl 是列主
            m._data[12] = rml * (right + left);
            m._data[13] = tmb * (top + bottom);
            m._data[14] = nmf * (nearClip + farClip);
            return m;
        }
        static translation(position) {
            let m = new Matrix4f();
            m._data[12] = position.x;
            m._data[13] = position.y;
            m._data[14] = position.z;
            return m;
        }
    }
    TSE.Matrix4f = Matrix4f;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /**
     * Represents a WebGL shader
     */
    class Shader {
        /**
         *
         * @param name
         * @param vertexSrc
         * @param fragmentSrc
         */
        constructor(name, vertexSrc, fragmentSrc) {
            /// 字典存储
            this._attributes = {};
            this._uniforms = {};
            this._name = name;
            /// 1. create shaders both vertex and fragment
            let vertexShader = this.loadShader(vertexSrc, TSE.gl.VERTEX_SHADER);
            let fragmentShader = this.loadShader(fragmentSrc, TSE.gl.FRAGMENT_SHADER);
            /// 2. bind them to program and compile and link
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
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
        /**
         * 查询属性的slot
         */
        detectAttributes() {
            let attributeCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < attributeCount; ++i) {
                let info = TSE.gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }
                this._attributes[info.name] = TSE.gl.getAttribLocation(this._program, info.name);
            }
        }
        /**
         * 获取具有提供名称的属性的location
         * @param name 要检索location的属性名称
         */
        getAttributeLocation(name) {
            if (this._attributes[name] === undefined) {
                throw new Error(`Unable to find attribute named '${name}' in shader named '${this._name}'`);
            }
            return this._attributes[name];
        }
        /**
         * Gets the locaiton of an uniform with the provided name.
         * @param name The name of the uniform whose location to retrieve
         */
        getUniformLocation(name) {
            if (this._uniforms[name] === undefined) {
                throw new Error(`Unable to find uniform named '${name}' in shader named '${this._name}'`);
            }
            return this._uniforms[name];
        }
        detectUniforms() {
            let uniformCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; ++i) {
                let info = TSE.gl.getActiveUniform(this._program, i);
                if (!info) {
                    break;
                }
                this._uniforms[info.name] = TSE.gl.getUniformLocation(this._program, info.name);
            }
        }
    }
    TSE.Shader = Shader;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    class Sprite {
        /**
         *
         * @param name The name of the material to  use with this sprite
         * @param width The width of this sprite
         * @param height The height of this sprite
         */
        constructor(name, width = 100, height = 100) {
            this.position = new TSE.Vector3();
            this._name = name;
            this._width = width;
            this._height = height;
        }
        load() {
            this._buffer = new TSE.GLBuffer();
            let positionAttribute = new TSE.AttributeInfo();
            positionAttribute.location = 0; //this._shader.getAttributeLocation("a_position")
            positionAttribute.offset = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            /// Drawing follow clockwise order
            let vertices = [
                // x,y,z
                0, 0, 0,
                0, this._height, 0,
                this._width, this._height, 0,
                this._width, this._height, 0,
                this._width, 0, 0,
                0, 0, 0
            ];
            this._buffer.pushBackData(vertices);
            this._buffer.upload();
            this._buffer.unbind();
        }
        /**
        * update
        */
        update() {
        }
        draw() {
            this._buffer.bind();
            this._buffer.draw();
        }
    }
    TSE.Sprite = Sprite;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /** Represents a 3-component vector. */
    class Vector3 {
        /**
         * Creates a new vector 3.
         * @param x The x component.
         * @param y The y component.
         * @param z The z component.
         */
        constructor(x = 0, y = 0, z = 0) {
            this._x = x;
            this._y = y;
            this._z = z;
        }
        /** The x component. */
        get x() {
            return this._x;
        }
        /** The x component. */
        set x(value) {
            this._x = value;
        }
        /** The y component. */
        get y() {
            return this._y;
        }
        /** The y component. */
        set y(value) {
            this._y = value;
        }
        /** The z component. */
        get z() {
            return this._z;
        }
        /** The z component. */
        set z(value) {
            this._z = value;
        }
        static get zero() {
            return new Vector3();
        }
        static get one() {
            return new Vector3(1, 1, 1);
        }
        static distance(a, b) {
            let diff = a.subtract(b);
            return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
        }
        set(x, y, z) {
            if (x !== undefined) {
                this._x = x;
            }
            if (y !== undefined) {
                this._y = y;
            }
            if (z !== undefined) {
                this._z = z;
            }
        }
        /**
         * Check if this vector is equal to the one passed in.
         * @param v The vector to check against.
         */
        equals(v) {
            return (this.x === v.x && this.y === v.y && this.z === v.z);
        }
        /** Returns the data of this vector as a number array. */
        toArray() {
            return [this._x, this._y, this._z];
        }
        /** Returns the data of this vector as a Float32Array. */
        toFloat32Array() {
            return new Float32Array(this.toArray());
        }
        copyFrom(vector) {
            this._x = vector._x;
            this._y = vector._y;
            this._z = vector._z;
        }
        setFromJson(json) {
            if (json.x !== undefined) {
                this._x = Number(json.x);
            }
            if (json.y !== undefined) {
                this._y = Number(json.y);
            }
            if (json.z !== undefined) {
                this._z = Number(json.z);
            }
        }
        add(v) {
            this._x += v._x;
            this._y += v._y;
            this._z += v._z;
            return this;
        }
        subtract(v) {
            this._x -= v._x;
            this._y -= v._y;
            this._z -= v._z;
            return this;
        }
        multiply(v) {
            this._x *= v._x;
            this._y *= v._y;
            this._z *= v._z;
            return this;
        }
        divide(v) {
            this._x /= v._x;
            this._y /= v._y;
            this._z /= v._z;
            return this;
        }
        clone() {
            return new Vector3(this._x, this._y, this._z);
        }
    }
    TSE.Vector3 = Vector3;
})(TSE || (TSE = {}));
