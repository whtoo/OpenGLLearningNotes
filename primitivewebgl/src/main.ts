
import {Point,Line} from './point'

window.onload = () => {
    let l1 = new Line(new Point(1,2),new Point(3,2))
    l1.p0 = null
    console.log(l1)
}
