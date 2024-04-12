<template>
    <canvas width="500" height="500"></canvas>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { initProgram } from "../utils/WebGLUtils"
const vertex = `
    attribute vec4 a_Position;
    void main(){
        //点位
        gl_Position=a_Position;
        //尺寸
        gl_PointSize=50.0;
    }
    `

const fragment = `
    void main(){
          gl_FragColor=vec4(1,1,0,1);
      }
    `
const initCanvas = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

const main = () => {
    const canvas = initCanvas()
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;

    const program = initProgram(gl, vertex, fragment)

    const a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttrib1f(a_Position, 0.1);

    gl.clearColor(0, 0, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
    // 鼠标点击事件
    canvas.addEventListener("click", ({ clientX, clientY }) => {
        console.log(clientX, clientY);
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
        gl.vertexAttrib2f(a_Position, x, y);
        gl.drawArrays(gl.POINTS, 0, 1);
        gl.clearColor(0, 0, 1, 1);
    });
}
onMounted(() => {
    main();
})
</script>
<style scoped>
canvas {
    border: 1px dashed salmon;
    /* background-color: aqua; */
    /* width: 100vw;
    height: 100vh; */
    display: block;
    /* width: 100%;
    height: 100%; */
}
</style>