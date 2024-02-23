/*
 * @Author: twj
 * @Date: 2024-01-25 11:46:17
 * @LastEditTime: 2024-02-22 11:16:59
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
    path: "/",
    redirect: "/cesiumLoadMap",
  },
];

export const router = createRouter({
  routes: routes,
  history: createWebHistory(),
});

export default router;
