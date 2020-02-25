window.onload = function () {
    var engine = new TSE.Engine();
    engine.start();
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
            console.log("hello world");
        }
        /**
         * 启动函数
         */
        start() {
            this.loop();
        }
        loop() {
            this._count++;
            document.title = this._count.toString();
            requestAnimationFrame(this.loop.bind(this));
        }
    }
    TSE.Engine = Engine;
})(TSE || (TSE = {}));
