<template>
  <div id="viewContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
import { CesiumThree3DGS, Load3dgsOptions } from "../utils/cesium-three-3dgs";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYTVhNjE0YS02YWVhLTQxNTAtYWI5NS1jYzUwMzliNmRjYjciLCJpZCI6OTc4NDgsImlhdCI6MTY1NTM4NDM0OH0.aT_4OCAgJ95R0l6Tg--u4jo9Ky6TlFa40p-8OxzYy2M";
// 初始化地图
const initMap = async () => {
  const viewer = new Cesium.Viewer("viewContainer", {
    infoBox: false,
    baseLayerPicker: false, //右上角图层选择按钮
    geocoder: false, //搜索框
    homeButton: false, //home按钮
    sceneModePicker: true, //模式切换按钮
    navigationHelpButton: false, //右上角帮助按钮
    fullscreenButton: false, //右下角全屏按钮
    // terrainProvider: await Cesium.createWorldTerrainAsync(),
  });

  const cesiumThree3DGS = new CesiumThree3DGS(viewer);
  const options: Load3dgsOptions = {
    splatUrl: "/public/SuzhouMuseum.splat",
    lat: 39.67611058812877,
    lon: 116.22989511700409,
    height: 0,
    headingPitchRoll: { heading: 65, pitch: 0, roll: 0 },
    scale: 5,
    camera: {
      offset: { x: -5, y: 18, z: 0 },
      headingPitchRoll: { heading: 240, pitch: 5, roll: 0 },
    },
  };
  // 设置相机为俯视视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      116.22989511700409,
      39.67611058812877,
      100
    ), // 设置相机位置
    orientation: {
      heading: 0, // 水平角度为0
      pitch: -Math.PI / 2, // 俯仰角为-90度（向下看）
      roll: 0, // 翻滚角为0
    },
  });
  viewer.scene.postRender.addEventListener(() => {
    cesiumThree3DGS.renderThreeObj();
  });
  cesiumThree3DGS.remove3dgsAll();
  cesiumThree3DGS.load3dgs(options);
};
onMounted(() => {
  initMap();
});
</script>
<style scoped>
#viewContainer {
  position: absolute;
  overflow: hidden;
  padding: 0;
  font-family: sans-serif;
  height: calc(100vh - 100px);
  width: calc(100vw - 260px);
}
#threeContainer {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100vh - 100px);
  width: calc(100vw - 260px);
  position: absolute;
  pointer-events: none;
}
</style>
