import { vec3, mat4 } from 'gl-matrix'
var cubeRotation = 0.0;
// will set to true when video can be copied to texture
var copyVideo = false;

//
// Start here
//
function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');
  
    // If we don't have a GL context, give up now
  
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }
  
    // Vertex shader program
  
    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec3 aVertexNormal;
      attribute vec2 aTextureCoord;
  
      uniform mat4 uNormalMatrix;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
  
      varying highp vec2 vTextureCoord;
      varying highp vec3 vLighting;
  
      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
  
        // Apply lighting effect
  
        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
  
        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
  
        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
      }
    `;
  
    // Fragment shader program
  
    const fsSource = `
      varying highp vec2 vTextureCoord;
      varying highp vec3 vLighting;
  
      uniform sampler2D uSampler;
  
      void main(void) {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
  
        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
      }
    `;
  
    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVertexNormal, aTextureCoord,
    // and look up uniform locations.
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };

main()

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
const texture: WebGLTexture = null //initTexture(gl)
const video = setupVideo('Firefox.mp4')
let then = 0
let programeInfo: WebGLProgram = null
let buffers: Uint8Array = null

// Initialize a shader program; this is where all the lighting
// for the vertices and so forth is established.
const shaderProgram = new BaseProgram(gl, 'BaseShader', BasicShader.defaultFragmentSrc(), BasicShader.defaultFragmentSrc()).program();

// Collect all the info needed to use the shader program.
// Look up which attributes our shader program is using
// for aVertexPosition, aVertexNormal, aTextureCoord,
// and look up uniform locations.
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
};

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

function drawScene(gl: WebGLRenderingContext, programeInfo: WebGLProgram, buffers: Uint8Array, texture: WebGLTexture, deltaTime: number) {

}


window.onload = () => {

}
