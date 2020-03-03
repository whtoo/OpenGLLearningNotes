import { vec3, mat4 } from 'gl-matrix'

var copyVideo = false

function setupVideo(url: string): HTMLVideoElement {
    const video = document.createElement('video') as HTMLVideoElement

    let playing = false
    let timeUpdate = false

    video.autoplay = true
    video.muted = true
    video.loop = true

    video.addEventListener('playing', function () {
        playing = true
        checkReady()
    }, true)

    video.addEventListener('timeupdate', function () {
        timeUpdate = true
        checkReady()
    }, true)

    video.src = url
    video.play()

    function checkReady() {
        if (playing && timeUpdate) {
            copyVideo = true
        }
    }
    return video
}

function initTexture(gl: WebGLRenderingContext) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    const level = 0
    const internalFormat = gl.RGBA
    const width = 1
    const height = 1
    const boarder = 0
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, boarder, srcFormat, srcType, pixel)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    return texture
}

function updateTexture(gl: WebGLRenderingContext, texture: WebGLTexture, video: HTMLVideoElement) {
    const level = 0
    const internalFormat = gl.RGBA
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video)
}
const gl: WebGLRenderingContext = null
const texture = initTexture(gl)
const video = setupVideo('Firefox.mp4')
let then = 0
function render(now: number) {
    now *= 0.001
    const deltaTime = now - then
    then = now
    if (copyVideo) {
        updateTexture(gl, texture, video)
    }

    drawScene(gl, programeInfo, buffers, texture, deltaTime)
    requestAnimationFrame(render)
}

requestAnimationFrame(render)

window.onload = () => {

}
