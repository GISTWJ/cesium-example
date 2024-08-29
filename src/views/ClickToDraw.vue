<template>
  <canvas width="500" height="500"></canvas>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { initProgram } from "../utils/WebGLUtils";
const vertex = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main(){
        //点位
        gl_Position=a_Position;
        //尺寸
        gl_PointSize=a_PointSize;
    }
    `;

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
    `;
const initCanvas = () => {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
};

const a_points: {
  x: number;
  y: number;
  size: number;
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}[] = []; //存储所有点的坐标与信息
let a_Position: number;
let a_PointSize: number;
let u_FragColor: WebGLUniformLocation;
//绘制场景
const draw = (
  gl: WebGLRenderingContext,
  points: {
    x: number;
    y: number;
    size: number;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }[]
) => {
  const program = initProgram(gl, vertex, fragment);
  a_Position = gl.getAttribLocation(program, "a_Position");
  a_PointSize = gl.getAttribLocation(program, "a_PointSize");
  u_FragColor = gl.getUniformLocation(
    program,
    "u_FragColor"
  ) as WebGLUniformLocation;
  gl.clear(gl.COLOR_BUFFER_BIT);
  points.forEach(({ x, y, size, color: { r, g, b, a } }) => {
    gl.vertexAttrib2f(a_Position, x, y);
    gl.vertexAttrib1f(a_PointSize, size);
    const arr = new Float32Array([r, g, b, a]);
    gl.uniform4fv(u_FragColor, arr);
    gl.drawArrays(gl.POINTS, 0, 1);
  });
};
const addCanvasListener = (
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext
) => {
  // 鼠标点击事件
  canvas.addEventListener("click", ({ clientX, clientY }) => {
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const [cssX, cssY] = [clientX - left, clientY - top];

    //解决坐标原点位置的差异
    const [halfWidth, halfHeight] = [width / 2, height / 2];
    const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight];
    // 解决y 方向的差异
    const yBaseCenterTop = -yBaseCenter;
    //解决坐标基底的差异
    const [x, y] = [xBaseCenter / halfWidth, yBaseCenterTop / halfHeight];
    const size = Math.random() * 50 + 10;
    const color = {
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
      a: 1,
    };
    a_points.push({ x, y, size, color });
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    draw(gl, a_points);
  });
};
const main = () => {
  const canvas = initCanvas();
  const gl = canvas.getContext("webgl") as WebGLRenderingContext;
  addCanvasListener(canvas, gl);
};

onMounted(() => {
  main();
});
</script>
<style scoped>
canvas {
  border: 1px dashed salmon;
  /* overflow: hidden; */
  height: calc(100vh - 100px);
  width: calc(100vw - 260px);
}
</style>
