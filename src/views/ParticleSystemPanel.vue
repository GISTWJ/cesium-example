<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-02-29 16:37:27
 * @LastEditors: twj
 * @Description: 
-->
<template>
  <div id="viewContainer"></div>
  <div id="toolbar" class="toolbar">
    <table>
      <tbody>
        <tr>
          <td>emissionRate：粒子数目</td>
          <td>
            <input
              type="range"
              min="0.0"
              max="100.0"
              step="1"
              v-model="emissionRate"
              @change="changeParticleSystem('emissionRate')"
            />
            <input
              type="text"
              size="5"
              v-model="emissionRate"
              @change="changeParticleSystem('emissionRate')"
            />
          </td>
        </tr>

        <tr>
          <td>particleSize：粒子尺寸</td>
          <td>
            <input
              type="range"
              min="2"
              max="60.0"
              step="1"
              v-model="particleSize"
              @change="changeParticleSystem('particleSize')"
            />
            <input
              type="text"
              size="5"
              v-model="particleSize"
              @change="changeParticleSystem('particleSize')"
            />
          </td>
        </tr>

        <tr>
          <td>minimumParticleLife：最小生命界限</td>
          <td>
            <input
              type="range"
              min="0.1"
              max="30.0"
              step="1"
              v-model="minimumParticleLife"
              @change="changeParticleSystem('minimumParticleLife')"
            />
            <input
              type="text"
              size="5"
              v-model="minimumParticleLife"
              @change="changeParticleSystem('minimumParticleLife')"
            />
          </td>
        </tr>

        <tr>
          <td>maximumParticleLife：最大生命界限</td>
          <td>
            <input
              type="range"
              min="0.1"
              max="30.0"
              step="1"
              v-model="maximumParticleLife"
              @change="changeParticleSystem('maximumParticleLife')"
            />
            <input
              type="text"
              size="5"
              v-model="maximumParticleLife"
              @change="changeParticleSystem('maximumParticleLife')"
            />
          </td>
        </tr>

        <tr>
          <td>minimumSpeed：最小速度</td>
          <td>
            <input
              type="range"
              min="0.0"
              max="30.0"
              step="1"
              v-model="minimumSpeed"
              @change="changeParticleSystem('minimumSpeed')"
            />
            <input
              type="text"
              size="5"
              v-model="minimumSpeed"
              @change="changeParticleSystem('minimumSpeed')"
            />
          </td>
        </tr>

        <tr>
          <td>maximumSpeed：最大速度</td>
          <td>
            <input
              type="range"
              min="0.0"
              max="30.0"
              step="1"
              v-model="maximumSpeed"
              @change="changeParticleSystem('maximumSpeed')"
            />
            <input
              type="text"
              size="5"
              v-model="maximumSpeed"
              @change="changeParticleSystem('maximumSpeed')"
            />
          </td>
        </tr>
        <tr>
          <td>startScale：初始比例</td>
          <td>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="1"
              v-model="startScale"
              @change="changeParticleSystem('startScale')"
            />
            <input
              type="text"
              size="5"
              v-model="startScale"
              @change="changeParticleSystem('startScale')"
            />
          </td>
        </tr>

        <tr>
          <td>endScale：最终比例</td>
          <td>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="1"
              v-model="endScale"
              @change="changeParticleSystem('endScale')"
            />
            <input
              type="text"
              size="5"
              v-model="endScale"
              @change="changeParticleSystem('endScale')"
            />
          </td>
        </tr>

        <tr>
          <td>gravity：重力</td>
          <td>
            <input
              type="range"
              min="-20.0"
              max="20.0"
              step="1"
              v-model="gravity"
              @change="changeParticleSystem('gravity')"
            />
            <input
              type="text"
              size="5"
              v-model="gravity"
              @change="changeParticleSystem('gravity')"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted, ref } from "vue";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYTVhNjE0YS02YWVhLTQxNTAtYWI5NS1jYzUwMzliNmRjYjciLCJpZCI6OTc4NDgsImlhdCI6MTY1NTM4NDM0OH0.aT_4OCAgJ95R0l6Tg--u4jo9Ky6TlFa40p-8OxzYy2M";

let viewer: Cesium.Viewer;
let scene: Cesium.Scene;
//粒子系统属性
const emissionRate = ref(5);
const particleSize = ref(25);
const minimumParticleLife = ref(1.2);
const maximumParticleLife = ref(1.2);
const minimumSpeed = ref(1);
const maximumSpeed = ref(4);
const startScale = ref(1);
const endScale = ref(5);
const gravity = ref(0);
let entityAir: Cesium.Entity; //飞机模型实体
const startTime = Cesium.JulianDate.fromDate(new Date()); //动画开始时间
//动画结束时间
const stopTime = Cesium.JulianDate.addSeconds(
  startTime,
  120,
  new Cesium.JulianDate()
);

// 初始化地图
const initMap = async () => {
  // 初始化cesium地图，并设置一些参数
  viewer = new Cesium.Viewer("viewContainer", {
    infoBox: false,
    baseLayerPicker: false, //右上角图层选择按钮
    geocoder: false, //搜索框
    homeButton: false, //home按钮
    sceneModePicker: true, //模式切换按钮
    navigationHelpButton: false, //右上角帮助按钮
    fullscreenButton: false, //右下角全屏按钮
    terrainProvider: await Cesium.createWorldTerrainAsync(),
  });
  // 获取场景
  scene = viewer.scene;
  // 添加实体
  addEntity();
  // 添加粒子系统
  addParticleSystem();
  // 监听场景更新，更新粒子系统的模型矩阵
  scene.preUpdate.addEventListener((_scene, time) => {
    particleSystem.modelMatrix = computeModelMatrix(entityAir, time);
    particleSystem.emitterModelMatrix = computeEmitterModelMatrix();
  });
};
//添加飞机模型
const addEntity = () => {
  const positionAir = new Cesium.SampledPositionProperty();
  const positionStart = Cesium.Cartesian3.fromDegrees(
    -75.15787310614596,
    39.97862668312678
  );
  const positionStop = Cesium.Cartesian3.fromDegrees(
    -75.1633691390455,
    39.95355089912078
  );
  positionAir.addSample(startTime, positionStart);
  positionAir.addSample(stopTime, positionStop);
  entityAir = viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: startTime,
        stop: stopTime,
      }),
    ]),
    model: {
      uri: "/Cesium_Air.glb",
      minimumPixelSize: 64,
    },
    position: positionAir,
    orientation: new Cesium.VelocityOrientationProperty(positionAir),
  });
  viewer.trackedEntity = entityAir;
  viewer.clock.startTime = startTime.clone();
  viewer.clock.stopTime = stopTime.clone();
  viewer.clock.currentTime = startTime.clone();
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
  viewer.clock.multiplier = 1;
  viewer.clock.shouldAnimate = true;
  viewer.timeline.zoomTo(startTime, stopTime);
};

//计算模型矩阵
const computeModelMatrix = (entity: Cesium.Entity, time: Cesium.JulianDate) => {
  return entity.computeModelMatrix(time, new Cesium.Matrix4());
};

let particleSystem: Cesium.ParticleSystem; //粒子系统
const addParticleSystem = () => {
  particleSystem = scene.primitives.add(
    new Cesium.ParticleSystem({
      image: "/smoke.png",
      startColor: Cesium.Color.BLACK.withAlpha(0.7),
      endColor: Cesium.Color.WHITE.withAlpha(0),
      startScale: startScale.value,
      endScale: endScale.value,
      minimumParticleLife: minimumParticleLife.value,
      maximumParticleLife: maximumParticleLife.value,
      minimumSpeed: minimumSpeed.value,
      maximumSpeed: maximumSpeed.value,
      imageSize: new Cesium.Cartesian2(particleSize.value, particleSize.value),
      emissionRate: emissionRate.value,

      bursts: [
        new Cesium.ParticleBurst({
          time: 5.0,
          minimum: 10,
          maximum: 100,
        }),
        new Cesium.ParticleBurst({
          time: 10.0,
          minimum: 50,
          maximum: 100,
        }),
        new Cesium.ParticleBurst({
          time: 15.0,
          minimum: 200,
          maximum: 300,
        }),
      ],
      lifetime: 16.0,
      emitter: new Cesium.CircleEmitter(2.0),
      emitterModelMatrix: computeEmitterModelMatrix(),
      updateCallback: applyGravity,
    })
  );
};
const emitterModelMatrix = new Cesium.Matrix4();
const translation = new Cesium.Cartesian3();
const rotation = new Cesium.Quaternion();
let hpr = new Cesium.HeadingPitchRoll();
const trs = new Cesium.TranslationRotationScale();

//计算发射器模型矩阵
const computeEmitterModelMatrix = () => {
  hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0, 0.0, hpr);
  trs.translation = Cesium.Cartesian3.fromElements(-15.0, 0.0, 0, translation);
  trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);
  return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
};

const gravityScratch = new Cesium.Cartesian3();
//粒子系统的更新的回调函数
const applyGravity = (
  p: { position: Cesium.Cartesian3; velocity: Cesium.Cartesian3 },
  dt: number
) => {
  const position = p.position;
  //计算粒子位置的归一化向量
  Cesium.Cartesian3.normalize(position, gravityScratch);
  //归一化向量乘以重力标量
  Cesium.Cartesian3.multiplyByScalar(
    gravityScratch,
    gravity.value * -dt,
    gravityScratch
  );
  //向量之和
  p.position = Cesium.Cartesian3.add(p.position, gravityScratch, p.position);
};

//监听面板数值变化，更改粒子系统属性
const changeParticleSystem = (particleProperty: string) => {
  switch (particleProperty) {
    case "emissionRate":
      particleSystem.emissionRate = +emissionRate.value;
      break;
    case "particleSize":
      particleSystem.minimumImageSize.x = +particleSize.value;
      particleSystem.minimumImageSize.y = +particleSize.value;
      particleSystem.maximumImageSize.x = +particleSize.value;
      particleSystem.maximumImageSize.y = +particleSize.value;
      break;
    case "minimumParticleLife":
      particleSystem.minimumParticleLife = +minimumParticleLife.value;
      break;
    case "maximumParticleLife":
      particleSystem.maximumParticleLife = +maximumParticleLife.value;
      break;
    case "minimumSpeed":
      particleSystem.minimumSpeed = +minimumSpeed.value;
      break;
    case "maximumSpeed":
      particleSystem.maximumSpeed = +maximumSpeed.value;
      break;
    case "startScale":
      particleSystem.startScale = +startScale.value;
      break;
    case "endScale":
      particleSystem.endScale = +endScale.value;
      break;
    case "gravity":
      gravity.value = +gravity.value;
      break;
  }
};
onMounted(() => {
  initMap();
});
</script>
<style scoped>
#viewContainer {
  height: calc(100vh - 100px);
  width: calc(100vw - 260px);
}
.toolbar {
  position: absolute;
  top: 30px;
  background-color: rgba(42, 42, 42, 0.8);
  color: aliceblue;
}
</style>
