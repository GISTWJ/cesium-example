<!--
 * @Author: twj
 * @Date: 2024-01-25 09:19:02
 * @LastEditTime: 2024-01-25 12:00:28
 * @LastEditors: twj
 * @Description: cesium-example
-->
<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <Navbar></Navbar>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import Navbar from "./layout/Navbar.vue";
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  margin: 0;
  padding: 0;
}
</style>
