<template>
    <canvas width="500" height="500"></canvas>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { initProgram, getMousePosInWebgl } from "../utils/WebGLUtils"
import Poly from '../utils/Poly'
import Sky from '../utils/Sky'

const vertex = `
    attribute vec4 a_Position;
      void main(){
          gl_Position=a_Position;
          gl_PointSize=20.0;
      }
    `

const fragment = `
    precision mediump float;
      uniform vec4 u_FragColor;
      void main(){
        float dist=distance(gl_PointCoord,vec2(0.5,0.5));
        if(dist<0.5){
          gl_FragColor=vec4(1,1,0,1);
        }else{
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
let gl: WebGLRenderingContext
//夜空
let sky: Sky | null = null
//正在绘制的多边形
let poly: Poly | null = null

const addCanvasListener = (canvas: HTMLCanvasElement) => {
    canvas.oncontextmenu = function () {
        return false
    }
    // 鼠标点击事件
    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 2) {
            popVertice()
        } else {
            const { x, y } = getMousePosInWebgl(event, canvas)
            if (poly) {
                poly.addVertice(x, y)
            } else {
                crtPoly(x, y)
            }
        }
        render()
    })

    canvas.addEventListener('mousemove', (event) => {
        if (poly) {
            const { x, y } = getMousePosInWebgl(event, canvas)
            poly.setVertice(poly.count - 1, x, y)
            render()
        }
    })
}
let program: WebGLProgram
const crtPoly = (x: number, y: number) => {
    poly = new Poly({
        vertices: [x, y, x, y],
        types: ['POINTS', 'LINE_STRIP'],
        program:program
    })
    sky?.add(poly)
}
const popVertice = () => {
    poly?.popVertice()
    poly = null
}
const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    sky?.draw()
}

const main = () => {
    const canvas = initCanvas()
    gl = canvas.getContext("webgl") as WebGLRenderingContext;
    program= initProgram(gl, vertex, fragment);

    sky = new Sky(gl);
    //声明颜色 rgba
    gl.clearColor(0, 0, 0, 1);
    //刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);
    addCanvasListener(canvas);
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