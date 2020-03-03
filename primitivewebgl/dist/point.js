var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import "reflect-metadata";
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Line {
    constructor(p0, p1) {
        this._p0 = p0;
        this._p1 = p1;
    }
    set p0(value) { this._p0 = value; }
    get p0() { return this._p0; }
    set p1(value) { this._p1 = value; }
    get p1() { return this._p1; }
}
__decorate([
    validate,
    Reflect.metadata("design:type", Point),
    __metadata("design:type", Point),
    __metadata("design:paramtypes", [Point])
], Line.prototype, "p0", null);
__decorate([
    validate,
    Reflect.metadata("design:type", Point),
    __metadata("design:type", Point),
    __metadata("design:paramtypes", [Point])
], Line.prototype, "p1", null);
function validate(target, propertyKey, descriptor) {
    let set = descriptor.set;
    descriptor.set = function (value) {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        if (!(value instanceof type)) {
            throw new TypeError("Invalid type.");
        }
        set(value);
    };
}
export { Line, Point };
