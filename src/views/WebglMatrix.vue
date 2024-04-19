<template>
    <canvas width="1205" height="832"></canvas>
</template>
<script setup lang="ts">
import { GUI } from 'dat.gui';
import { onMounted, onBeforeUnmount } from 'vue';


const gui = new GUI();
let gl: WebGLRenderingContext


let vertex: string = `
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_matrix;
varying vec4 v_color;

void main(){
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
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
        value: 60,
        min: 0,
        max: canvasWidth,
        label: 'X'
    }
    const ySliderConfig = {
        value: 40,
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
        value: 0.85,
        min: -5,
        max: 5,
        label: 'scaleX',
    }
    const yscaleSliderConfig = {
        value: 0.85,
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
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
let matrixLocation: WebGLUniformLocation;
let positionBuffer: WebGLBuffer;

const bindBufferData = (gl: WebGLRenderingContext) => {
    programInstance = initProgram(gl);
    positionLocation = gl.getAttribLocation(programInstance, "a_position") as number;
    matrixLocation = gl.getUniformLocation(programInstance, "u_matrix") as WebGLUniformLocation;
    positionBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
}
const translation = [60, 40];
let angleInRadians: number = 0;
const scale = [0.85, 0.85]
//更新位置
const updatePosition = (index: number, value: number) => {
    translation[index] = value;
    drawScene(programInstance, gl)
}
//更新旋转角度
const updateRotation = (value: number) => {
    angleInRadians = (360 - value) * Math.PI / 180
    drawScene(programInstance, gl)
}

const updateScale = (index: number, value: number) => {
    scale[index] = value;
    drawScene(programInstance, gl)
}
//绘制场景
const drawScene = (p: WebGLProgram | null, gl: WebGLRenderingContext) => {
    console.log(111);
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



    let matrix = m3.projection((gl.canvas as HTMLCanvasElement).clientWidth, (gl.canvas as HTMLCanvasElement).clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);


    gl.uniformMatrix3fv(matrixLocation, false, matrix);
    const primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, 0, 18);

}
const m3 = {
    identity: function () {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ];
    },

    translation: function (tx: number, ty: number) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },

    rotation: function (angleInRadians: number) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },

    scaling: function (sx: number, sy: number) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },

    multiply: function (a: number[], b: number[]) {
        const a00 = a[0 * 3 + 0];
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];
        const b00 = b[0 * 3 + 0];
        const b01 = b[0 * 3 + 1];
        const b02 = b[0 * 3 + 2];
        const b10 = b[1 * 3 + 0];
        const b11 = b[1 * 3 + 1];
        const b12 = b[1 * 3 + 2];
        const b20 = b[2 * 3 + 0];
        const b21 = b[2 * 3 + 1];
        const b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
    projection: function (width: number, height: number) {
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ]
    },
    translate: function (m: number[], tx: number, ty: number) {
        return m3.multiply(m, m3.translation(tx, ty));
    },

    rotate: function (m: number[], angleInRadians: number) {
        return m3.multiply(m, m3.rotation(angleInRadians));
    },

    scale: function (m: number[], sx: number, sy: number) {
        return m3.multiply(m, m3.scaling(sx, sy));
    },
};

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
    /* background-color: aqua; */
    height: calc(100vh - 100px);
    width: calc(100vw - 260px);
    display: block;
    /* width: 100%;
    height: 100%; */
}
</style>