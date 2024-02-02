<!--
 * @Author: twj
 * @Date: 2024-01-25 10:48:06
 * @LastEditTime: 2024-01-30 11:37:09
 * @LastEditors: twj
 * @Description: property详解
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
let blueBox: Cesium.Entity;
let redBox: Cesium.Entity;
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
  viewer.zoomTo(viewer.entities);
  addBlueBox();
  changeBoxHight(); //样本插值改变盒子高度状态
  changeBoxColor(); //
  refenceBoxChange();
};

//add a box
const addBlueBox = () => {
  blueBox = viewer.entities.add({
    name: "blue BOX",
    position: Cesium.Cartesian3.fromDegrees(113, 23, 4000),
    box: {
      dimensions: new Cesium.Cartesian3(40000, 30000, 50000),
      material: Cesium.Color.BLUE,
      outline: true,
      outlineColor: Cesium.Color.RED,
    },
  });
};

const changeBoxHight = () => {
  const propertyBox = new Cesium.SampledProperty(Cesium.Cartesian3); //构造函数的使用,传入插值类型
  propertyBox.addSample(
    Cesium.JulianDate.fromIso8601("2024-01-29T09:30:00.00Z"),
    new Cesium.Cartesian3(40000.0, 30000.0, 20000.0)
  );

  propertyBox.addSample(
    Cesium.JulianDate.fromIso8601("2024-01-30T09:30:02.00Z"),
    new Cesium.Cartesian3(40000.0, 30000.0, 70000.0)
  );
  //   if (blueBox.box) blueBox.box.dimensions = propertyBox;
  blueBox.box && (blueBox.box.dimensions = propertyBox);
};

const changeBoxColor = () => {
  const colorProperty = new Cesium.SampledProperty(Cesium.Color);

  colorProperty.addSample(
    Cesium.JulianDate.fromIso8601("2024-01-29T00:00:00.00Z"),
    new Cesium.Color(0, 1, 0)
  );

  colorProperty.addSample(
    Cesium.JulianDate.fromIso8601("2024-01-30T00:00:00.00Z"),
    new Cesium.Color(0, 0, 1)
  );

  const color = new Cesium.ColorMaterialProperty(colorProperty);
  blueBox.box && (blueBox.box.material = color);

  console.log(
    color.getType(Cesium.JulianDate.fromIso8601("2024-01-29T09:30:00.00Z"))
  );
  console.log(
    color.getType(Cesium.JulianDate.fromIso8601("2024-01-29T01:30:00.00Z"))
  );
};

const refenceBoxChange = () => {
  redBox = viewer.entities.add({
    name: "red BOX",
    position: Cesium.Cartesian3.fromDegrees(112, 23, 4000),
    box: {
      dimensions: new Cesium.Cartesian3(40000, 30000, 50000),
      material: Cesium.Color.RED,
      outline: true,
      outlineColor: Cesium.Color.BLUE,
    },
  });
  const collection = viewer.entities;
  redBox.box &&
    (redBox.box.dimensions = new Cesium.ReferenceProperty(
      collection,
      blueBox.id,
      ["box", "dimensions"]
    ));
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
