<template>
    <canvas width="500" height="500"></canvas>
</template>
<script setup lang="ts">
import { GUI } from 'dat.gui';
import { onMounted, onBeforeUnmount } from 'vue';


const gui = new GUI();
let gl: WebGLRenderingContext


let vertex: string = `
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;
varying vec4 v_color;

void main(){
    // Scale the position
  vec2 scaledPosition = a_position * u_scale;

  // Rotate the position
  vec2 rotatedPosition = vec2(
     scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
     scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x);

  // Add in the translation.
  vec2 position = rotatedPosition + u_translation;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color=gl_Position*.5+.5;
}
`
let fragment: string = `
precision mediump float;

uniform vec4 u_color;
varying vec4 v_color;

void main(){
    // gl_FragColor=u_color;
    gl_FragColor=v_color;

}
`
const creatSlider = (gl: WebGLRenderingContext, gui: GUI) => {
    const canvasWidth = gl.canvas.width;
    const canvasHeight = gl.canvas.height;
    const xSliderConfig = {
        value: 0,
        min: 0,
        max: canvasWidth,
        label: 'X'
    }
    const ySliderConfig = {
        value: 0,
        min: 0,
        max: canvasHeight,
        label: 'Y'
    }
    const angelSliderConfig = {
        value: 0,
        min: 0,
        max: 360,
        label: 'Angle',
    }
    const xscaleSliderConfig = {
        value: 1,
        min: -5,
        max: 5,
        label: 'scaleX',
    }
    const yscaleSliderConfig = {
        value: 1,
        min: -5,
        max: 5,
        label: 'scaleY',
    }
    const xSlider = gui.add(xSliderConfig, 'value', xSliderConfig.min, xSliderConfig.max).name(xSliderConfig.label);
    const ySlider = gui.add(ySliderConfig, 'value', ySliderConfig.min, ySliderConfig.max).name(ySliderConfig.label);
    const angelSlider = gui.add(angelSliderConfig, 'value', angelSliderConfig.min, angelSliderConfig.max).name(angelSliderConfig.label);
    const xScaleSlider = gui.add(xscaleSliderConfig, 'value', xscaleSliderConfig.min, xscaleSliderConfig.max).name(xscaleSliderConfig.label);
    const yScaleSlider = gui.add(yscaleSliderConfig, 'value', yscaleSliderConfig.min, yscaleSliderConfig.max).name(yscaleSliderConfig.label);
    xSlider.onChange((value) => {
        updatePosition(0, value);//更新X位置
    })
    ySlider.onChange((value) => {
        updatePosition(1, value);//更新Y位置
    })
    angelSlider.onChange((value) => {
        console.log(value);
        updateRotation(value);
    })
    xScaleSlider.onChange((value) => {
        updateScale(0, value)
    })
    yScaleSlider.onChange((value) => {
        updateScale(1, value)
    })
}
const initWebGLContext = () => {
    gl = document.querySelector('canvas')?.getContext('webgl') as WebGLRenderingContext
}
//创建WebGLProgram
const initProgram = (gl: WebGLRenderingContext): WebGLProgram => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(vertexShader, vertex);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(fragmentShader, fragment);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    return program;
}
let programInstance: WebGLProgram;
let positionLocation: number;
let resolutionLocation: WebGLUniformLocation;
let translationLocation: WebGLUniformLocation;
let rotationLocation: WebGLUniformLocation;
let scaleLocation: WebGLUniformLocation;
let positionBuffer: WebGLBuffer;

const bindBufferData = (gl: WebGLRenderingContext) => {
    programInstance = initProgram(gl);
    positionLocation = gl.getAttribLocation(programInstance, "a_position") as number;
    resolutionLocation = gl.getUniformLocation(programInstance, "u_resolution") as WebGLUniformLocation;
    translationLocation = gl.getUniformLocation(programInstance, "u_translation") as WebGLUniformLocation;
    rotationLocation = gl.getUniformLocation(programInstance, 'u_rotation') as WebGLUniformLocation;
    scaleLocation = gl.getUniformLocation(programInstance, 'u_scale') as WebGLUniformLocation;
    positionBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
}
const translation = [0, 0];
const rotation = [0, 1];//初始旋转角度正、余弦值，sin -A =u_rotation.x = 0，cos -A =u_rotation.y = 1
const scale = [1, 1]
//更新位置
const updatePosition = (index: number, value: number) => {
    translation[index] = value;
    drawScene(programInstance, gl)
}
//更新旋转角度
const updateRotation = (value: number) => {
    rotation[0] = Math.sin((360 - value) * Math.PI / 180);//u_x = sin A
    rotation[1] = Math.cos((360 - value) * Math.PI / 180);//u_y = cos A
    drawScene(programInstance, gl)
}

const updateScale = (index: number, value: number) => {
    scale[index] = value;
    drawScene(programInstance, gl)
}
//绘制场景
const drawScene = (p: WebGLProgram | null, gl: WebGLRenderingContext) => {
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(p);
    gl.enableVertexAttribArray(positionLocation);
    // 设置位置属性的大小、类型、是否归一化等
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
        positionLocation,
        size,
        type,
        normalize,
        stride,
        offset
    );


    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    // gl.uniform4fv(colorLocation, color);
    // 设置平移
    gl.uniform2fv(translationLocation, translation);
    //设置旋转
    gl.uniform2fv(rotationLocation, rotation);
    // 设置缩放
    gl.uniform2fv(scaleLocation, scale);
    // 绘制三角形
    const primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, 0, 18);
}

//调整canvas大小
const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement, multiplier: number | undefined) => {
    multiplier = multiplier || 1;
    const width = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}


//设置几何图形的顶点数据
const setGeometry = () => {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,

            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,

            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
}

const updateDisplayGUI = (gui: GUI) => {
    console.log("销毁了GUI");

    if (gui) gui.destroy();

}
onMounted(() => {
    initWebGLContext();//初始化webgl上下文对象
    creatSlider(gl, gui);
    bindBufferData(gl);
    setGeometry();
    drawScene(programInstance, gl);//绘制场景
})

onBeforeUnmount(() => {
    updateDisplayGUI(gui)
})
</script>
<style scoped>
canvas {
    border: 1px dashed salmon;
    height: calc(100vh - 100px);
    width: calc(100vw - 260px);
}
</style>