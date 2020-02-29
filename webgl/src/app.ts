var engine : TSE.Engine;
import * as THREE from "three";
import {vec2} from "gl-matrix"

window.onload = function() {
    engine = new TSE.Engine()
    engine.start()
}
window.onresize = function() {
    engine.resize()
}