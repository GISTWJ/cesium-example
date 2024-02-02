<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-01-30 14:07:36
 * @LastEditors: twj
 * @Description: 轨迹回放
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
  