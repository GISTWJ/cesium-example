/*
 * @Author: twj
 * @Date: 2024-01-25 11:46:17
 * @LastEditTime: 2024-03-05 09:31:21
 * @LastEditors: twj
 * @Description:路由导航
 */
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
export const routes: Array<RouteRecordRaw> = [
  {
    path: "/cesiumLoadMap",
    name: "cesiumLoadMap",
    component: () => import("../views/cesiumLoadMap.vue"),
    meta: {
      title: "CesiumMap",
      activePath: "/cesiumLoadMap",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/geometries",
    name: "geometries",
    component: () => import("../views/Geometries.vue"),
    meta: {
      title: "Geometries",
      activePath: "/geometries",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/property",
    name: "property",
    component: () => import("../views/Property.vue"),
    meta: {
      title: "Property",
      activePath: "/property",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/trajectoryTracking",
    name: "trajectoryTracking",
    component: () => import("../views/TrajectoryTracking.vue"),
    meta: {
      title: "TrajectoryTracking",
      activePath: "/trajectoryTracking",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/particleSystem",
    name: "ParticleSystem",
    component: () => import("../views/ParticleSystem.vue"),
    meta: {
      title: "ParticleSystem",
      activePath: "/particleSystem",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/particleSystemPanel",
    name: "particleSystemPanel",
    component: () => import("../views/ParticleSystemPanel.vue"),
    meta: {
      title: "ParticleSystemPanel",
      activePath: "/particleSystemPanel",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/measureTool",
    name: "measureTool",
    component: () => import("../views/MeasureTool.vue"),
    meta: {
      title: "MeasureTool",
      activePath: "/measureTool",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/webgl2DScale",
    name: "webgl2DScale",
    component: () => import("../views/Webgl2DScale.vue"),
    meta: {
      title: "Webgl2DScale",
      activePath: "/webgl2DScale",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/webglMatrix",
    name: "webglMatrix",
    component: () => import("../views/WebglMatrix.vue"),
    meta: {
      title: "WebglMatrix",
      activePath: "/webglMatrix",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/clickToDraw",
    name: "clickToDraw",
    component: () => import("../views/ClickToDraw.vue"),
    meta: {
      title: "ClickToDraw",
      activePath: "/clickToDraw",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/tweenAnimation",
    name: "tweenAnimation",
    component: () => import("../views/TweenAnimation.vue"),
    meta: {
      title: "TweenAnimation",
      activePath: "/tweenAnimation",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/mouseDrawLine",
    name: "mouseDrawLine",
    component: () => import("../views/MouseDrawLine.vue"),
    meta: {
      title: "MouseDrawLine",
      activePath: "/mouseDrawLine",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/drawConstellation",
    name: "drawConstellation",
    component: () => import("../views/DrawConstellation.vue"),
    meta: {
      title: "DrawConstellation",
      activePath: "/drawConstellation",
      showInMenu: true,
      icon: "el-icon-house",
    },
  },
  {
    path: "/",
    redirect: "/cesiumLoadMap",
  },
];

export const router = createRouter({
  routes: routes,
  history: createWebHistory(),
});

export default router;
