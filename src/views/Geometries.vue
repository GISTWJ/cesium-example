<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-01-26 14:58:33
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
// 初始化地图
const initMap = async () => {
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
  (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none"; //隐藏LOGO
  const positionDefault = Cesium.Cartesian3.fromDegrees(
    113.264499,
    23.130061,
    4000000
  );
  //设置相机默认位置
  viewer.camera.setView({
    destination: positionDefault,
    //拖动地球打印相机位置，获取这三个参数
    orientation: {
      heading: 6.0373382332844185,
      pitch: -1.4389277777548877,
      roll: 6.279925019467049,
    },
  });
  viewer.zoomTo(viewer.entities);
  loadBox();
  loadCirclesAndEllipses();
};
//添加盒子
const loadBox = () => {
  viewer.entities.add({
    name: "box",
    position: Cesium.Cartesian3.fromDegrees(114, 23, 4000),
    box: {
      dimensions: new Cesium.Cartesian3(40000, 30000, 50000),
      material: Cesium.Color.BLUE,
      outline: true,
      outlineColor: Cesium.Color.RED,
    },
  });
};

//添加圆与椭圆
const loadCirclesAndEllipses = () => {
  viewer.entities.add({
    name: "Circles",
    position: Cesium.Cartesian3.fromDegrees(114, 23, 4000),
    ellipse: {
      semiMajorAxis: 30000,
      semiMinorAxis: 30000,
      height: 4000,
      material: Cesium.Color.GREEN,
      outline: true,
    },
  });
  viewer.entities.add({
    name: "Top and bottom cut out",
    position: Cesium.Cartesian3.fromDegrees(114.0, 23.0, 140000.0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(200000.0, 200000.0, 200000.0),
      innerRadii: new Cesium.Cartesian3(100000.0, 100000.0, 100000.0),
      minimumCone: Cesium.Math.toRadians(60.0),
      maximumCone: Cesium.Math.toRadians(170.0),
      material: Cesium.Color.DARKCYAN.withAlpha(0.3),
      outline: true,
    },
  });
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
