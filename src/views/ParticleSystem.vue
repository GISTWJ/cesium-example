<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-02-22 18:23:05
 * @LastEditors: twj
 * @Description: 
-->
<template>
  <div id="viewContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYTVhNjE0YS02YWVhLTQxNTAtYWI5NS1jYzUwMzliNmRjYjciLCJpZCI6OTc4NDgsImlhdCI6MTY1NTM4NDM0OH0.aT_4OCAgJ95R0l6Tg--u4jo9Ky6TlFa40p-8OxzYy2M";

let viewer: Cesium.Viewer;
let scene: Cesium.Scene;

// 初始化地图
const initMap = () => {
  viewer = new Cesium.Viewer("viewContainer", {
    infoBox: false,
    baseLayerPicker: false, //右上角图层选择按钮
    geocoder: false, //搜索框
    homeButton: false, //home按钮
    sceneModePicker: true, //模式切换按钮
    navigationHelpButton: false, //右上角帮助按钮
    fullscreenButton: false, //右下角全屏按钮
    shouldAnimate: true,
    terrain: Cesium.Terrain.fromWorldTerrain(),
  });

  scene = viewer.scene;
  scene.globe.depthTestAgainstTerrain = true;
  resetCameraFunction();
  startSnow();
  startRain();
};
const resetCameraFunction = () => {
  scene.camera.setView({
    destination: new Cesium.Cartesian3(
      277096.634865404,
      5647834.481964232,
      2985563.7039122293
    ),
    orientation: {
      heading: 4.731089976107251,
      pitch: -0.32003481981370063,
    },
  });
};

let snowGravityScratch = new Cesium.Cartesian3();
const snowParticleSize = 12.0;
const snowRadius = 100000.0;
const minimumSnowImageSize = new Cesium.Cartesian2(
  snowParticleSize,
  snowParticleSize
);
const maximumSnowImageSize = new Cesium.Cartesian2(
  snowParticleSize * 2.0,
  snowParticleSize * 2.0
);
//定义雪花更新函数
const snowUpdate = (particle: {
  position: Cesium.Cartesian3;
  velocity: Cesium.Cartesian3;
  endColor: { alpha: number };
}) => {
  // console.log(particle.velocity);

  //根据传入坐标创建归一化向量（方向单位向量）
  snowGravityScratch = Cesium.Cartesian3.normalize(
    particle.position,
    snowGravityScratch
  );
  //单位向量乘以随机标量
  Cesium.Cartesian3.multiplyByScalar(
    snowGravityScratch,
    -8,
    snowGravityScratch
  );
  //粒子的速度矢量
  particle.velocity = Cesium.Cartesian3.add(
    particle.velocity,
    snowGravityScratch,
    particle.velocity
  );
};
let snowParticlePrimitives: any;
const startSnow = () => {
  scene.primitives.removeAll(); //为什么要移除全部？？？会不会有不好的影响？因为entity也是转换为primitive
  console.log(Cesium.Matrix4.fromTranslation(scene.camera.position));

  snowParticlePrimitives = scene.primitives.add(
    new Cesium.ParticleSystem({
      modelMatrix: Cesium.Matrix4.fromTranslation(scene.camera.position), //4*4变换矩阵，将粒子系统从模型坐标转换为世界坐标的 4x4 变换矩阵。
      minimumSpeed: -1.0, //设置最小限度（以米/秒为单位），超过该限值将随机选择粒子的实际速度。
      maximumSpeed: 0.0, //设置最大界限（以米/秒为单位），低于该界限将随机选择粒子的实际速度。
      lifetime: 15.0, //粒子系统发射粒子的时间，以秒为单位。
      emitter: new Cesium.BoxEmitter(
        new Cesium.Cartesian3(10000, 10000, 10000)
      ), //粒子发射器。
      startScale: 0.5,
      endScale: 1.0,
      image: "/snowflake_particle.png",
      emissionRate: 3000, //每秒发射的粒子数
      startColor: Cesium.Color.WHITE.withAlpha(0.0),
      endColor: Cesium.Color.WHITE.withAlpha(1.0),
      minimumImageSize: minimumSnowImageSize,
      maximumImageSize: maximumSnowImageSize,
      updateCallback: snowUpdate,
    })
  );
  scene.skyAtmosphere.hueShift = -0.8;
  scene.skyAtmosphere.saturationShift = -0.7;
  scene.skyAtmosphere.brightnessShift = -0.33;
  scene.fog.density = 0.001;
  scene.fog.minimumBrightness = 0.8;
};

// rain
const rainParticleSize = 15.0;
const rainRadius = 100000.0;
const rainImageSize = new Cesium.Cartesian2(
  rainParticleSize,
  rainParticleSize * 2.0
);
let rainGravityScratch = new Cesium.Cartesian3();
//定义雨水更新函数
const rainUpdate = (particle: {
  velocity: Cesium.Cartesian3;
  position: Cesium.Cartesian3;
  endColor: { alpha: number };
}) => {
  rainGravityScratch = Cesium.Cartesian3.normalize(
    particle.position,
    rainGravityScratch
  );
  rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(
    rainGravityScratch,
    -8,
    rainGravityScratch
  );
  particle.velocity = Cesium.Cartesian3.add(
    particle.velocity,
    rainGravityScratch,
    particle.velocity
  );
};
const emitterModelMatrix = new Cesium.Matrix4();
const translation = new Cesium.Cartesian3();
const rotation = new Cesium.Quaternion();
let hpr = new Cesium.HeadingPitchRoll();
const trs = new Cesium.TranslationRotationScale(); //由平移、旋转和缩放定义的仿射变换。

//如何利用矩阵进行变换？？？
const computeEmitterModelMatrix = () => {
  hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, hpr);
  trs.translation = Cesium.Cartesian3.fromElements(0, 0, 20000, translation);
  trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);
  return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
};
//计算模型矩阵
const computeModelMatrix = (primitive: { modelMatrix: any }) => {
  return primitive.modelMatrix;
};
const startRain = () => {
  scene.primitives.add(
    new Cesium.ParticleSystem({
      modelMatrix: computeModelMatrix(snowParticlePrimitives),
      emitterModelMatrix: computeEmitterModelMatrix(),
      minimumSpeed: -1.0, //设置最小限度（以米/秒为单位），超过该限值将随机选择粒子的实际速度。
      maximumSpeed: 0.0, //设置最大界限（以米/秒为单位），低于该界限将随机选择粒子的实际速度。
      lifetime: 1.0, //粒子系统发射粒子的时间，以秒为单位。
      emitter: new Cesium.BoxEmitter(
        new Cesium.Cartesian3(10000, 10000, 10000)
      ), //粒子发射器。
      startScale: 0.5,
      endScale: 1.0,
      image: "/circular_particle.png",
      emissionRate: 3000,
      startColor: Cesium.Color.BLUE.withAlpha(0.2),
      endColor: Cesium.Color.BLUE.withAlpha(1),
      imageSize: rainImageSize,
      updateCallback: rainUpdate,
    })
  );
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
</style>
