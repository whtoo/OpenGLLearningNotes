import "reflect-metadata"
 class Point {
        x: number;
        y: number;
        public constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }
    }

     class Line {
        private _p0: Point;
        private _p1: Point;

        public constructor(p0: Point, p1: Point) {
            this._p0 = p0
            this._p1 = p1
        }

        @validate
        @Reflect.metadata("design:type", Point)
        set p0(value: Point | null) { this._p0 = value; }
        get p0() { return this._p0; }

        @validate
        @Reflect.metadata("design:type", Point)
        set p1(value: Point | null) { this._p1 = value; }
        get p1() { return this._p1; }
    }


    function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
        let set = descriptor.set;
        descriptor.set = function (value: T) {

            let type = Reflect.getMetadata("design:type", target, propertyKey);
            if (!(value instanceof type)) {
                throw new TypeError("Invalid type.");
            }
            set(value);
        }
    }
    export { Line , Point}
