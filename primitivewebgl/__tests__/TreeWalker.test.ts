import {Queue} from '../src/stl/Queue'

test("Queue test",()=>{
    let queue = new Queue<number>(false)
    expect(queue.length).toBe(0)
    queue.add(1)
    expect(queue.length).toBe(1)
    expect(queue.remove()).toBe(1)
    expect(queue.isEmpty).toBe(true)
})