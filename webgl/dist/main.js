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
            TSE.MessageBus.update(0);
            this._canvas = TSE.GLUtilities.initialize();
            TSE.AssetManager.initialize();
            TSE.gl.clearColor(0.5, 0.5, 0.5, 1);
            /// Draw flow
            this.loadShaders();
            this._shader.use();
            this._projectionMatrix = TSE.Matrix4f.orthorthographic(0, this._canvas.clientWidth, 0, this._canvas.clientHeight, -1, 100);
            this._sprite = new TSE.Sprite("test", 'texturezero.png');
            this._sprite.position.x = 100;
            this._sprite.position.y = 200;
            this._modelMatrix = TSE.Matrix4f.translation(this._sprite.position);
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
            let delta = performance.now() - this._previousTime;
            this.update(delta);
            /// Render cmd
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            let colorPosition = this._shader.getUniformLocation('u_tint');
            TSE.gl.uniform4f(colorPosition, 1, 1, 1, 1);
            this.updateMVPMatrix();
            this._sprite.draw(this._shader);
            this._previousTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        }
        update(delta) {
            TSE.MessageBus.update(delta);
        }
        loadShaders() {
            this._shader = new TSE.BasicShader();
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
                console.log(funcName, flag, TSE.gl.getError());
                throw new Error("The " + funcName + ":::" + flag + "::" + TSE.gl.getError());
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
    class Sprite {
        /**
         *
         * @param name The name of the material to  use with this sprite
         * @param width The width of this sprite
         * @param height The height of this sprite
         */
        constructor(name, textureName, width = 100, height = 100) {
            this.position = new TSE.Vector3();
            this._name = name;
            this._width = width;
            this._height = height;
            this._textureName = textureName;
            this._texture = TSE.TextureManager.getTexture(textureName);
        }
        get textureName() {
            return this._textureName;
        }
        get name() {
            return this._name;
        }
        destroy() {
            this._buffer.destroy();
            TSE.TextureManager.releaseTexture(this.textureName);
        }
        load() {
            this._buffer = new TSE.GLBuffer();
            let positionArribute = new TSE.AttributeInfo();
            positionArribute.location = 0;
            positionArribute.offset = 0;
            positionArribute.size = 3;
            this._buffer.addAttributeLocation(positionArribute);
            let texCoordArribute = new TSE.AttributeInfo();
            texCoordArribute.location = 1;
            texCoordArribute.offset = 3;
            texCoordArribute.size = 2;
            this._buffer.addAttributeLocation(texCoordArribute);
            /// Drawing follow clockwise order
            let vertices = [
                // x,y,z,u,v
                // x, y, z , u, v
                0, 0, 0, 0, 0,
                0, this._height, 0, 0, 1.0,
                this._width, this._height, 0, 1.0, 1.0,
                this._width, this._height, 0, 1.0, 1.0,
                this._width, 0, 0, 1.0, 0,
                0, 0, 0, 0, 0
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
        draw(shader) {
            this._texture.activateAndBind(0);
            let diffuseLocation = shader.getUniformLocation('u_sampler');
            TSE.gl.uniform1i(diffuseLocation, 0);
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

var TSE;
(function (TSE) {
    TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    class AssetManager {
        constructor() {
        }
        static initialize() {
            AssetManager._loaders.push(new TSE.ImageAssetLoader());
        }
        static registLoader(loader) {
            AssetManager._loaders.push(loader);
        }
        static onAssetLoaded(asset) {
            AssetManager._loadedAssets[asset.name] = asset;
            TSE.Message.send(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        }
        static loadAsset(assetName) {
            let extension = assetName.split('.').pop().toLowerCase();
            for (const loader of AssetManager._loaders) {
                if (loader.supportedExtensions.indexOf(extension) !== -1) {
                    loader.loadAsset(assetName);
                    return;
                }
            }
            console.warn("Unable to load asset with extension" + extension + "because there is no loader associated with it");
        }
        static isAssetLoaded(assetName) {
            return AssetManager._loadedAssets[assetName] !== undefined;
        }
        static getAsset(assetName) {
            if (AssetManager.isAssetLoaded(assetName)) {
                return AssetManager._loadedAssets[assetName];
            }
            else {
                AssetManager.loadAsset(assetName);
            }
            return undefined;
        }
    }
    AssetManager._loaders = [];
    AssetManager._loadedAssets = {};
    TSE.AssetManager = AssetManager;
})(TSE || (TSE = {}));



var TSE;
(function (TSE) {
    /** Represents an image asset */
    class ImageAsset {
        /**
         * Creates a new image asset.
         * @param name The name of this asset.
         * @param data The data of this asset.
         */
        constructor(name, data) {
            this.name = name;
            this.data = data;
        }
        /** The width of this image asset. */
        get width() {
            return this.data.width;
        }
        /** The height of this image asset. */
        get height() {
            return this.data.height;
        }
    }
    TSE.ImageAsset = ImageAsset;
    /** Represents an image asset loader. */
    class ImageAssetLoader {
        /** The extensions supported by this asset loader. */
        get supportedExtensions() {
            return ["png", "gif", "jpg"];
        }
        /**
         * Loads an asset with the given name.
         * @param assetName The name of the asset to be loaded.
         */
        loadAsset(assetName) {
            let image = new Image();
            image.onload = this.onImageLoaded.bind(this, assetName, image);
            image.src = assetName;
        }
        onImageLoaded(assetName, image) {
            console.log("onImageLoaded: assetName/image", assetName, image);
            let asset = new ImageAsset(assetName, image);
            TSE.AssetManager.onAssetLoaded(asset);
        }
    }
    TSE.ImageAssetLoader = ImageAssetLoader;
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
    /** Represents a message which can be sent and processed across the system. */
    class Message {
        /**
         * Creates a new message.
         * @param code The code for this message, which is subscribed to and listened for.
         * @param sender The class instance which sent this message.
         * @param context Free-form context data to be included with this message.
         * @param priority The priority of this message.
         */
        constructor(code, sender, context, priority = TSE.MessagePriority.NORMAL) {
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }
        /**
         * Sends a normal-priority message with the provided parameters.
         * @param code The code for this message, which is subscribed to and listened for.
         * @param sender The class instance which sent this message.
         * @param context Free-form context data to be included with this message.
         */
        static send(code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, TSE.MessagePriority.NORMAL));
        }
        /**
         * Sends a high-priority message with the provided parameters.
         * @param code The code for this message, which is subscribed to and listened for.
         * @param sender The class instance which sent this message.
         * @param context Free-form context data to be included with this message.
         */
        static sendPriority(code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, TSE.MessagePriority.HIGH));
        }
        /**
         * Subscribes the provided handler to listen for the message code provided.
         * @param code The code to listen for.
         * @param handler The message handler to be called when a message containing the provided code is sent.
         */
        static subscribe(code, handler) {
            TSE.MessageBus.addSubscription(code, handler);
        }
        /**
         * Unsubscribes the provided handler from listening for the message code provided.
         * @param code The code to no longer listen for.
         * @param handler The message handler to unsubscribe.
         */
        static unsubscribe(code, handler) {
            TSE.MessageBus.removeSubscription(code, handler);
        }
    }
    TSE.Message = Message;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /** The message manager responsible for sending messages across the system. */
    class MessageBus {
        /** Constructor hidden to prevent instantiation. */
        constructor() {
        }
        /**
         * Adds a subscription to the provided code using the provided handler.
         * @param code The code to listen for.
         * @param handler The handler to be subscribed.
         */
        static addSubscription(code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                MessageBus._subscriptions[code] = [];
            }
            if (MessageBus._subscriptions[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". Subscription not added.");
            }
            else {
                MessageBus._subscriptions[code].push(handler);
            }
        }
        /**
         * Removes a subscription to the provided code using the provided handler.
         * @param code The code to no longer listen for.
         * @param handler The handler to be unsubscribed.
         */
        static removeSubscription(code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + " Because that code is not subscribed to.");
                return;
            }
            let nodeIndex = MessageBus._subscriptions[code].indexOf(handler);
            if (nodeIndex !== -1) {
                MessageBus._subscriptions[code].splice(nodeIndex, 1);
            }
        }
        /**
         * Posts the provided message to the message system.
         * @param message The message to be sent.
         */
        static post(message) {
            console.log("Message posted:", message);
            let handlers = MessageBus._subscriptions[message.code];
            if (handlers === undefined) {
                return;
            }
            for (let h of handlers) {
                if (message.priority === TSE.MessagePriority.HIGH) {
                    h.onMessage(message);
                }
                else {
                    MessageBus._normalMessageQueue.push(new TSE.MessageSubscriptionNode(message, h));
                }
            }
        }
        /**
         * Performs update routines on this message bus.
         * @param time The delta time in milliseconds since the last update.
         */
        static update(time) {
            if (MessageBus._normalMessageQueue.length === 0) {
                return;
            }
            let messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._normalMessageQueue.length);
            for (let i = 0; i < messageLimit; ++i) {
                let node = MessageBus._normalMessageQueue.pop();
                node.handler.onMessage(node.message);
            }
        }
    }
    MessageBus._subscriptions = {};
    MessageBus._normalQueueMessagePerUpdate = 10;
    MessageBus._normalMessageQueue = [];
    TSE.MessageBus = MessageBus;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /** Represents message priorities. */
    let MessagePriority;
    (function (MessagePriority) {
        /** Normal message priority, meaning the message is sent as soon as the queue allows. */
        MessagePriority[MessagePriority["NORMAL"] = 0] = "NORMAL";
        /** High message priority, meaning the message is sent immediately. */
        MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    })(MessagePriority = TSE.MessagePriority || (TSE.MessagePriority = {}));
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    class MessageSubscriptionNode {
        constructor(message, handler) {
            this.message = message;
            this.handler = handler;
        }
    }
    TSE.MessageSubscriptionNode = MessageSubscriptionNode;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    const LEVEL = 0;
    const BORDER = 0;
    const TEMP_IMAGE_DATA = new Uint8Array([255, 255, 255, 255]);
    /**
     * Represents a texture to be used in a material. These typically should not be created manually, but
     * instead via the texture manager.
     */
    class Texture {
        /**
         * Creates a new Texture.
         * @param name The name of this texture.
         * @param width The width of this texture.
         * @param height The height of this texture.
         */
        constructor(name, width = 1, height = 1) {
            this._isLoaded = false;
            this._name = name;
            this._width = width;
            this._height = height;
            this._handle = TSE.gl.createTexture();
            this.bind();
            TSE.gl.texImage2D(TSE.gl.TEXTURE_2D, LEVEL, TSE.gl.RGBA, 1, 1, BORDER, TSE.gl.RGBA, TSE.gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);
            let asset = TSE.AssetManager.getAsset(this.name);
            if (asset !== undefined) {
                this.loadTextureFromAsset(asset);
            }
            else {
                TSE.Message.subscribe(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);
            }
        }
        /** The name of this texture. */
        get name() {
            return this._name;
        }
        /** Indicates if this texture is loaded. */
        get isLoaded() {
            return this._isLoaded;
        }
        /** The width of this  texture. */
        get width() {
            return this._width;
        }
        /** The height of this texture. */
        get height() {
            return this._height;
        }
        /** Destroys this texture. */
        destroy() {
            if (this._handle) {
                TSE.gl.deleteTexture(this._handle);
            }
        }
        /**
         * Activates the provided texture unit and binds this texture.
         * @param textureUnit The texture unit to activate on. Default: 0
         */
        activateAndBind(textureUnit = 0) {
            TSE.gl.activeTexture(TSE.gl.TEXTURE0 + textureUnit);
            this.bind();
        }
        /** Binds this texture. */
        bind() {
            TSE.gl.bindTexture(TSE.gl.TEXTURE_2D, this._handle);
        }
        /** Binds this texture. */
        unbind() {
            TSE.gl.bindTexture(TSE.gl.TEXTURE_2D, undefined);
        }
        /**
         * The message handler.
         * @param message The message to be handled.
         */
        onMessage(message) {
            if (message.code === TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
                this.loadTextureFromAsset(message.context);
            }
        }
        loadTextureFromAsset(asset) {
            this._width = asset.width;
            this._height = asset.height;
            this.bind();
            TSE.gl.texImage2D(TSE.gl.TEXTURE_2D, LEVEL, TSE.gl.RGBA, TSE.gl.RGBA, TSE.gl.UNSIGNED_BYTE, asset.data);
            if (this.isPowerof2()) {
                TSE.gl.generateMipmap(TSE.gl.TEXTURE_2D);
            }
            else {
                // Do not generate a mip map and clamp wrapping to edge.
                TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_WRAP_S, TSE.gl.CLAMP_TO_EDGE);
                TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_WRAP_T, TSE.gl.CLAMP_TO_EDGE);
            }
            // TODO:  Set text ure filte r ing based on configuration.
            TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_MIN_FILTER, TSE.gl.NEAREST);
            TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_MAG_FILTER, TSE.gl.NEAREST);
            this._isLoaded = true;
        }
        isPowerof2() {
            return (this.isValuePowerOf2(this._width) && this.isValuePowerOf2(this.height));
        }
        isValuePowerOf2(value) {
            return (value & (value - 1)) == 0;
        }
    }
    TSE.Texture = Texture;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    class TextureManager {
        constructor() {
        }
        static getTexture(textureName) {
            if (TextureManager._texture[textureName] === undefined) {
                let texture = new TSE.Texture(textureName);
                TextureManager._texture[textureName] = new TSE.TextureReferenceNode(texture);
            }
            else {
                TextureManager._texture[textureName].referenceCount++;
            }
            return TextureManager._texture[textureName].texture;
        }
        static releaseTexture(textureName) {
            if (TextureManager._texture[textureName] === undefined) {
                console.warn(`A texture named ${textureName} dosent exist before you delete it.`);
            }
            else {
                let textureRef = TextureManager._texture[textureName];
                textureRef.referenceCount--;
                if (textureRef.referenceCount < 1) {
                    textureRef.texture.destroy();
                    TextureManager._texture[textureName] = undefined;
                    delete TextureManager._texture[textureName];
                }
            }
        }
    }
    TextureManager._texture = {};
    TSE.TextureManager = TextureManager;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    class TextureReferenceNode {
        constructor(texture) {
            this.referenceCount = 1;
            this.texture = texture;
        }
    }
    TSE.TextureReferenceNode = TextureReferenceNode;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    /**
     * Represents a WebGL shader
     */
    class BaseShader {
        /**
         *
         * @param name
         * @param vertexSrc
         * @param fragmentSrc
         */
        constructor(name) {
            /// 字典存储
            this._attributes = {};
            this._uniforms = {};
            this._name = name;
        }
        loadShaders(vertexSrc, fragmentSrc) {
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
    TSE.BaseShader = BaseShader;
})(TSE || (TSE = {}));

var TSE;
(function (TSE) {
    class BasicShader extends TSE.BaseShader {
        constructor() {
            super("basic");
            this.loadShaders(this.getVertexShaderSource(), this.getFragmentShaderSource());
        }
        getVertexShaderSource() {
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
            `;
            return vertexShaderSource;
        }
        getFragmentShaderSource() {
            let fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_tint;
            uniform sampler2D u_sampler;

            varying vec2 v_texCoord;

            void main() {
                gl_FragColor = u_tint * texture2D(u_sampler,v_texCoord);
            }
            `;
            return fragmentShaderSource;
        }
    }
    TSE.BasicShader = BasicShader;
})(TSE || (TSE = {}));
