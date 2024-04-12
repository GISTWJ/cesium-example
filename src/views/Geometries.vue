<!-- eslint-disable vue/multi-word-component-names -->
<!--
 * @Author: twj
 * @Date: 2024-01-25 14:26:18
 * @LastEditTime: 2024-02-29 16:45:45
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
  viewer.scene.screenSpaceCameraController.enableCollisionDetection  = true;
  viewer.zoomTo(viewer.entities);
  loadPolygon();
  loadBox();
  loadCirclesAndEllipses();
};
//添加盒子
const loadBox = () => {
  viewer.entities.add({
    name: "box",
    position: Cesium.Cartesian3.fromDegrees(120.2400822, 31.5480772, 40),
    box: {
      dimensions: new Cesium.Cartesian3(40, 30, 50),
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
    position: Cesium.Cartesian3.fromDegrees(120.2400822, 31.5480772, 4000),
    ellipse: {
      semiMajorAxis: 30,
      semiMinorAxis: 30,
      height: 20,
      material: Cesium.Color.GREEN,
      outline: true,
    },
  });
  viewer.entities.add({
    name: "Top and bottom cut out",
    position: Cesium.Cartesian3.fromDegrees(120.2400822, 31.5480772, 40.0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(40.0, 40.0, 40.0),
      innerRadii: new Cesium.Cartesian3(60.0, 60.0, 60.0),
      minimumCone: Cesium.Math.toRadians(60.0),
      maximumCone: Cesium.Math.toRadians(170.0),
      material: Cesium.Color.DARKCYAN.withAlpha(0.3),
      outline: true,
    },
  });
};


const loadPolygon = async () => {
  viewer.entities.add({
    name: "polygon",
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        120.2450822, 31.5480772,
        120.2452152, 31.548077,
        120.245215, 31.5479855,
        120.2450819, 31.5479858,
      ]),
      height: 0,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      extrudedHeight: 15,
      material: Cesium.Color.RED.withAlpha(0.8),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      // outlineWidth: 0,
      arcType: Cesium.ArcType.RHUMB,
    }
  })
  // const outlinePolygon = new Cesium.PolygonOutlineGeometry({
  //   polygonHierarchy: new Cesium.PolygonHierarchy(
  //     Cesium.Cartesian3.fromDegreesArray([
  //       120.2450822, 31.5480772,
  //       120.2452152, 31.548077,
  //       120.245215, 31.5479855,
  //       120.2450819, 31.5479858,
  //     ])
  //   ),
  //   vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT, // 使用PerInstanceColorAppearance以便设置颜色
  //   extrudedHeight: 15,
  //   arcType: Cesium.ArcType.RHUMB,
  // });
  // const outlineGeometry = Cesium.PolygonOutlineGeometry.createGeometry(outlinePolygon) as Cesium.Geometry;

  // console.log("out", calculateHeight(Cesium.Cartesian3.fromDegreesArray([
  //   120.2450822, 31.5480772,
  //   120.2452152, 31.548077,
  //   120.245215, 31.5479855,
  //   120.2450819, 31.5479858,
  // ])));
  const res: number[] = []
  await sampleTerrainMostDetailed(
    Cesium.Cartesian3.fromDegreesArray([
      120.2450822, 31.5480772,
      120.2452152, 31.548077,
      120.245215, 31.5479855,
      120.2450819, 31.5479858,
    ])
  ).then(cartographic => {
    console.log("cartographic", cartographic);
    cartographic.forEach(item => {
      // 获取经度、纬度和高度值
      const longitude = Cesium.Math.toDegrees(item.longitude);
      const latitude = Cesium.Math.toDegrees(item.latitude);
      const height = item.height;
      res.push(longitude, latitude, height)
    })
  })
  console.log("res", res);

  const outlineGeometry = Cesium.PolygonOutlineGeometry.createGeometry(Cesium.PolygonOutlineGeometry.fromPositions({
    positions: Cesium.Cartesian3.fromDegreesArrayHeights(res),
    extrudedHeight: 28,
    perPositionHeight: true
  })) as Cesium.Geometry;
  const outlineInstance = new Cesium.GeometryInstance({
    geometry: outlineGeometry,
    id: "outline",
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE) // 设置颜色为蓝色
    }
  })
  const outlinePrimitive = new Cesium.Primitive({
    geometryInstances: outlineInstance,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      faceForward: true,
      translucent: false,
      closed: false,
    }),
    asynchronous: false,
    show: true,
    modelMatrix: Cesium.Matrix4.IDENTITY,
    vertexCacheOptimize: false,
    interleave: false,
    compressVertices: true,
    releaseGeometryInstances: true,
    allowPicking: true,
    cull: true,
    debugShowBoundingVolume: false,
    shadows: Cesium.ShadowMode.DISABLED,
  })
  viewer.scene.primitives.add(outlinePrimitive);

}

// //根据给定的Cartesian3点数组计算高度
// const calculateHeight = (cartesian3Array: Cesium.Cartesian3[]) => {
//   const resultArray = []
//   console.log(cartesian3Array);

//   for (let i = 0; i < cartesian3Array.length; i++) {
//     // 将Cartesian3点转换为Cartographic点
//     const cartographic = Cesium.Cartographic.fromCartesian(cartesian3Array[i]);
//     console.log(cartographic);

//     // 获取经度、纬度和高度值
//     const longitude = Cesium.Math.toDegrees(cartographic.longitude);
//     const latitude = Cesium.Math.toDegrees(cartographic.latitude);
//     const height = cartographic.height;

//     // 将经纬度+高度信息存入结果数组
//     resultArray.push([longitude, latitude, height]);
//   }
//   return resultArray
// }

const sampleTerrainMostDetailed = async (cartesian3Array: Cesium.Cartesian3[]) => {
  const terrainProvider = await Cesium.createWorldTerrainAsync();
  const cartographicArr: Cesium.Cartographic[] = []
  cartesian3Array.forEach(item => {
    cartographicArr.push(Cesium.Cartographic.fromCartesian(item));
  })
  const updatedPositions = await Cesium.sampleTerrainMostDetailed(terrainProvider, cartographicArr);
  return updatedPositions
}
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
