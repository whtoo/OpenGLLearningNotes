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

        private _count : number = 0;

        /**
         * 启动函数
         */
        public start(): void {
            this.loop();
        }

        private loop() : void {
            this._count++;
            document.title = this._count.toString();
            requestAnimationFrame(this.loop.bind(this));
        }        
    }
}