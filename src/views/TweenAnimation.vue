<template>
    <canvas width="500" height="500"></canvas>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { initProgram } from "../utils/WebGLUtils"
import Compose from '../utils/Compose.ts'
import Track from '../utils/Track.ts'
const vertex = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
        //点位
        gl_Position=a_Position;
        //尺寸
        gl_PointSize=a_PointSize;
    }
    `

const fragment = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main(){
        float dist = distance(gl_PointCoord,vec2(0.5,0.5));
        if(dist < 0.5) {
            gl_FragColor = u_FragColor;
        } else {
            discard;
        }
      }
    `
const initCanvas = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

let a_Position: number
let a_PointSize: number;
let u_FragColor: WebGLUniformLocation;
//绘制场景
const draw = (
    gl: WebGLRenderingContext,
    points: {
        x: number,
        y: number,
        size: number,
        a: number;
    }[]) => {
    const program = initProgram(gl, vertex, fragment);
    a_Position = gl.getAttribLocation(program, "a_Position");
    a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    u_FragColor = gl.getUniformLocation(program, 'u_FragColor') as WebGLUniformLocation;
    gl.clear(gl.COLOR_BUFFER_BIT);
    points.forEach(({ x, y, size, a }) => {
        gl.vertexAttrib2f(a_Position, x, y);
        gl.vertexAttrib1f(a_PointSize, size);
        const arr = new Float32Array([Math.random(), Math.random(), Math.random(), a]);
        gl.uniform4fv(u_FragColor, arr);
        gl.drawArrays(gl.POINTS, 0, 1)
    });
}

const stars: { x: number; y: number; size: number; a: number; }[] = [];
const compose = new Compose();

const addCanvasListener = (canvas: HTMLCanvasElement, gl: WebGLRenderingContext,) => {
    // 鼠标点击事件
    canvas.addEventListener("click", ({ clientX, clientY }) => {
        const { left, top, width, height } = canvas.getBoundingClientRect();
        const [cssX, cssY] = [clientX - left, clientY - top];

        //解决坐标原点位置的差异
        const [halfWidth, halfHeight] = [width / 2, height / 2];
        const [xBaseCenter, yBaseCenter] = [
            cssX - halfWidth,
            cssY - halfHeight,
        ];
        // 解决y 方向的差异
        const yBaseCenterTop = -yBaseCenter;
        //解决坐标基底的差异
        const [x, y] = [xBaseCenter / halfWidth, yBaseCenterTop / halfHeight];
        const size = Math.random() * 10 + 10;
        const a = 1;//透明度
        const obj = { x, y, size, a }
        stars.push(obj)
        const track = new Track(obj)
        track.start = new Date();
        track.timeLen = 2000;
        track.loop = true;

        track.keyMap = new Map([
            [
                "a",
                [
                    [5, 1],
                    [1005, 0],
                    [2005, 1],
                ],
            ],
        ]);
        compose.add(track);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        draw(gl, stars)
    });
}
const main = () => {
    const canvas = initCanvas()
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;
    addCanvasListener(canvas, gl,);
    (function ani() {
        compose.update(new Date());
        draw(gl, stars);
        requestAnimationFrame(ani);
    })();
}

onMounted(() => {
    main();
})
</script>
<style scoped>
canvas {
    border: 1px dashed salmon;
    /* overflow: hidden; */
    height: calc(100vh - 100px);
    width: calc(100vw - 260px);
}
</style>