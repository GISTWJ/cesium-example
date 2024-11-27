<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-03-01 09:32:58
 * @LastEditors: twj
 * @Description: 
-->
<template>
  <div id="viewContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import { onMounted } from "vue";
import road from "../assets/road.json";

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

  addRoad(road, viewer);
  // 调整视角以适应所有的多边形
  viewer.zoomTo(viewer.entities);
};
const addRoad = (json: any, viewer: Cesium.Viewer) => {
  let roadEntity: Cesium.Entity = new Cesium.Entity();
  // 遍历数据并创建多边形
  json.forEach((item: any) => {
    // 解析 box 字符串为数组
    const positions = item.box.split("],[").map((coords: string) => {
      const [lon, lat, alt] = coords
        .replace(/[\[\]]/g, "")
        .split(",")
        .map(Number);
      return Cesium.Cartesian3.fromDegrees(lon, lat, alt);
    });

    // 添加实体到Cesium Viewer
    roadEntity = new Cesium.Entity({
  
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        height: parseFloat(item.height), // 设置高度
        heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND,
        outline: true, // 启用轮廓
        outlineColor: Cesium.Color.RED, // 设置轮廓为红色
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.RED.withAlpha(0.2)
        ), // 红色透明填充
      },
    });
    viewer.entities.add(roadEntity);
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
