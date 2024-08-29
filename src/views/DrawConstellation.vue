<template>
    <canvas width="500" height="500"></canvas>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { initProgram, getMousePosInWebgl, glToCssPos } from "../utils/WebGLUtils"
import Poly from '../utils/Poly'
import { pointType } from "../utils/Poly"
import Sky from '../utils/Sky'
import Compose from "../utils/Compose";
import Track from "../utils/Track";

const vertex = `
attribute vec4 a_Attr;
      varying float v_Alpha;
      void main(){
          gl_Position=vec4(a_Attr.x,a_Attr.y,0.0,1.0);
          gl_PointSize=a_Attr.z;
          v_Alpha=a_Attr.w;
      }
    `

const fragment = `
precision mediump float;    
    uniform bool u_IsPOINTS;
    varying float v_Alpha;
    void main(){ 
      if(u_IsPOINTS){
        float dist=distance(gl_PointCoord,vec2(0.5,0.5));
        if(dist<0.5){
          gl_FragColor=vec4(0.87,0.91,1,v_Alpha);
        }else{
          discard;
        }
      }else{
        gl_FragColor=vec4(0.87,0.91,1,v_Alpha);
      }
    }  
    `
let gl: WebGLRenderingContext;//webgl上下文
let sky: Sky | null = null//夜空背景容器
let compose = new Compose();//绘制组合
let point: pointType | null = null
let poly: Poly | null = null//正在绘制的多边形
//初始化并获取canvas
const initCanvas = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}


//绑定监听
const bindCanvasListener = (canvas: HTMLCanvasElement) => {
    //取消右键事件
    canvas.oncontextmenu = function () {
        return false
    }
    // 鼠标点击事件
    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 2) {
            popVertice();//取消绘制
        } else {
            const { x, y } = getMousePosInWebgl(event, canvas)
            if (poly) {
                addVertice(x, y);//添加顶点数据
            } else {
                crtPoly(x, y);//创建多边形对象
            }
        }
        render()
    })
    //鼠标移动事件
    canvas.addEventListener('mousemove', (event) => {
        const { x, y } = getMousePosInWebgl(event, canvas)
        point = hoverPoint(x, y, canvas)
        canvas.style.cursor = point ? 'pointer' : 'default'
        if (poly) {
            // debugger
            const obj = poly.geoData[poly.geoData.length - 1]
            obj.x = x
            obj.y = y
        }
    })
}

let program: WebGLProgram

const addVertice = (x: number, y: number) => {
    const { geoData } = poly as Poly
    if (point) {
        geoData[geoData.length - 1] = point
    }
    let obj = { x, y, pointSize: random(), alpha: 1 } as pointType
    geoData.push(obj)
    crtTrack(obj)
}
const crtPoly = (x: number, y: number) => {
    let o1 = point ? point : { x, y, pointSize: random(), alpha: 1 }
    const o2 = { x, y, pointSize: random(), alpha: 1 }
    poly = new Poly({
        size: 4,
        attrName: 'a_Attr',
        geoData: [o1, o2],
        types: ['POINTS', 'LINE_STRIP'],
        circleDot: true,
        program: program
    })
    sky?.add(poly)
    crtTrack(o1)
    crtTrack(o2)
}

const popVertice = () => {
    poly?.popVertice()
    poly = null
}

const crtTrack = (obj: pointType) => {
    const { pointSize } = obj
    const track = new Track(obj)
    track.start = new Date()
    track.timeLen = 2000
    track.loop = true
    track.keyMap = new Map([
        [
            "pointSize",
            [
                [500, pointSize],
                [1000, 0],
                [1500, pointSize],
            ],
        ],
        [
            "alpha",
            [
                [500, 1],
                [1000, 0],
                [1500, 1],
            ],
        ],
    ]);
    compose.add(track)
}

const hoverPoint = (mx: number, my: number, canvas: HTMLCanvasElement) => {
    if (!sky) return null
    for (let { geoData } of sky.children) {
        for (let obj of geoData) {
            if (poly && obj === poly.geoData[poly.geoData.length - 1]) {
                continue
            }
            const delta = {
                x: mx - obj.x,
                y: my - obj.y
            }
            const { x, y } = glToCssPos(delta, canvas)
            const dist = x * x + y * y
            if (dist < 100) {
                return obj
            }
        }
    }
    return null
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    sky?.draw()
}

//计算一个随机数
const random = () => {
    return Math.random() * 8 + 3
}
const main = () => {
    const canvas = initCanvas()
    gl = canvas.getContext("webgl") as WebGLRenderingContext;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    program = initProgram(gl, vertex, fragment);

    sky = new Sky(gl);
    //声明颜色 rgba
    gl.clearColor(0, 0, 0, 1);
    //刷底色
    gl.clear(gl.COLOR_BUFFER_BIT);
    bindCanvasListener(canvas);
    (function ani() {
        compose.update(new Date())
        sky.updateVertices(['x', 'y', 'pointSize', 'alpha'])
        render()
        requestAnimationFrame(ani)
    })()
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