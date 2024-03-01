<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-03-01 11:35:59
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
    destination: Cesium.Cartesian3.fromDegrees(113, 27, 5000),
    orientation: {
      heading: 4.731089976107251,
      pitch: -0.32003481981370063,
    },
  });
};

let snowGravityScratch = new Cesium.Cartesian3();
const snowParticleSize = 12.0;
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

//局部旋转矩阵
const ratationAngle = Cesium.Math.toRadians(30);
const ratationMatrix = Cesium.Matrix4.fromRotationTranslation(
  Cesium.Matrix3.fromRotationX(ratationAngle)
);
const computeEmitterModelMatrixSnow = Cesium.Matrix4.multiplyByMatrix3(
  ratationMatrix,
  Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(20)),
  new Cesium.Matrix4()
);

const emitterModelMatrix = new Cesium.Matrix4();
const translation = new Cesium.Cartesian3();
const rotation = new Cesium.Quaternion();
let hpr = new Cesium.HeadingPitchRoll();
const trs = new Cesium.TranslationRotationScale(); //由平移、旋转和缩放定义的仿射变换。

//计算发射器模型矩阵
const computeEmitterModelMatrixRain = () => {
  //设置头、俯仰角、旋转角度和旋转轴
  hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0, 60, hpr);
  //设置平移
  trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0, translation);
  //设置旋转
  trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);
  //返回仿射变换矩阵
  return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
};

let snowParticlePrimitives: Cesium.Primitive;
const startSnow = () => {
  scene.primitives.removeAll(); //为什么要移除全部？？？会不会有不好的影响？因为entity也是转换为primitive

  snowParticlePrimitives = scene.primitives.add(
    new Cesium.ParticleSystem({
      modelMatrix: Cesium.Matrix4.fromTranslation(
        Cesium.Cartesian3.fromDegrees(113, 27, 10000)
      ),
      emitterModelMatrix: computeEmitterModelMatrixSnow,
      minimumSpeed: -1.0,
      maximumSpeed: 0.0,
      lifetime: 15.0,
      emitter: new Cesium.BoxEmitter(
        new Cesium.Cartesian3(10000, 10000, 10000)
      ), //粒子发射器。
      startScale: 0.5,
      endScale: 1.0,
      image: "/snowflake_particle.png",
      emissionRate: 7000, //每秒发射的粒子数
      startColor: Cesium.Color.WHITE.withAlpha(0.0),
      endColor: Cesium.Color.WHITE.withAlpha(1.0),
      minimumImageSize: minimumSnowImageSize,
      maximumImageSize: maximumSnowImageSize,
      updateCallback: snowUpdate,
    })
  );
};

// rain
const rainParticleSize = 15.0;
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

//计算模型矩阵
const computeModelMatrixRain = (primitive: Cesium.Primitive) => {
  return primitive.modelMatrix;
};
const startRain = () => {
  scene.primitives.add(
    new Cesium.ParticleSystem({
      modelMatrix: computeModelMatrixRain(snowParticlePrimitives),
      emitterModelMatrix: computeEmitterModelMatrixRain(),
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
