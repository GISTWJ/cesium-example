<template>
  <div id="viewContainer"></div>
</template>
<script setup lang="ts">
import * as Cesium from "cesium";
import {
  Cartesian3,
  Color,
  EllipseGeometry,
  EllipsoidGeometry,
  GeometryInstance,
  Material,
  MaterialAppearance,
  PolylineGeometry,
  PolylineMaterialAppearance,
  Primitive,
  Transforms,
  Viewer,
} from "cesium";
import { onMounted } from "vue";
import { RadarScanCircleMaterial } from "../utils/RadarScanCircleMaterial";
import PolylineArrowMeterialVS from "../utils/Shaders/Material/PolylineArrowMeterialVS.glsl";
import PolylineArrowMeterialFS from "../utils/Shaders/Material/PolylineArrowMeterialFS.glsl";
import PolylineArrowMeterial from "../utils/Shaders/Material/PolylineArrowMeterial.glsl";
import Arrow from "../assets/arrow.png";

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
    // terrainProvider: await Cesium.createWorldTerrainAsync(),
    // contextOptions: {
    //   requestWebgl1: true,
    // },
  });
  // addEllipse(viewer);
  // addSpherr(viewer);
  addLine(viewer);
};
//primitive添加圆
const addEllipse = (viewer: Viewer) => {
  const position = Cartesian3.fromDegrees(80, 40, 5000);
  const radius = 40000.0;
  viewer.scene.primitives.add(
    new Primitive({
      geometryInstances: [
        new GeometryInstance({
          geometry: new EllipseGeometry({
            center: position,
            semiMajorAxis: radius,
            semiMinorAxis: radius,
          }),
        }),
      ],
      appearance: new MaterialAppearance({
        material: new RadarScanCircleMaterial({
          color: Color.fromCssColorString("#03a9f4"),
          sectorColor: Color.fromCssColorString("#e91e63"),
          radians: Math.PI,
          offset: 0.2,
          width: 0.008,
        }),
        flat: false,
        faceForward: false,
        translucent: true,
        closed: false,
      }),
      asynchronous: false,
    })
  );
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(80, 40, 500000),
  });
  // viewer.scene.postRender.addEventListener(() => {
  //   // this.updatePosition(coordinates)
  //   console.log('a',a);

  // })
};
//primitive添加球体
const addSpherr = (viewer: Viewer) => {
  // 定义球体的几何体
  const ellipsoid = new Primitive({
    geometryInstances: new GeometryInstance({
      geometry: new EllipsoidGeometry({
        radii: new Cartesian3(45000.0, 45000.0, 45000.0), // 球体的半径
      }),
      modelMatrix: Transforms.eastNorthUpToFixedFrame(
        Cartesian3.fromDegrees(78, 40, 45000) // 球体的位置
      ),
    }),
    appearance: new MaterialAppearance({
      material: new RadarScanCircleMaterial({
        color: Color.fromCssColorString("#03a9f4"),
        sectorColor: Color.fromCssColorString("#e91e63"),
        radians: Math.PI,
        offset: 0.2,
        width: 0.008,
      }),
    }),
  });
  viewer.scene.primitives.add(ellipsoid);
};

const addLine = (viewer: Viewer) => {
  const lineGeometryInstances = new GeometryInstance({
    geometry: new PolylineGeometry({
      positions: Cartesian3.fromDegreesArray([78, 39, 78, 40, 77, 39]),
      width: 10.0,
    }),
  });
  const lineAppearance = new PolylineMaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: Color.fromCssColorString("#fff"),
          image: Arrow,
          gapColor: Color.fromCssColorString("#03a9f4"),
          dashLength: 16,
        },
        source: PolylineArrowMeterial,
      },
    }),
    vertexShaderSource: PolylineArrowMeterialVS,
    // fragmentShaderSource: PolylineArrowMeterialFS,
  });
  const line = new Primitive({
    geometryInstances: lineGeometryInstances,
    appearance: lineAppearance,
    asynchronous: false, // 确保同步生成几何体（非异步)
  });
  console.log("GLSL", lineAppearance.material.shaderSource);

  console.log("VS", lineAppearance.vertexShaderSource);
  console.log("FS", lineAppearance.fragmentShaderSource);

  viewer.scene.primitives.add(line);
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(80, 40, 500000),
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
