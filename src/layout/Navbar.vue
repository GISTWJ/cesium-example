<template>
  <el-menu default-active="1" class="el-menu-vertical-demo" router>
    <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
      <template #title>{{ item.meta?.title }}</template>
    </el-menu-item>
  </el-menu>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
// 过滤出需要显示在菜单中的路由
const menuItems = computed(() => {
  return router.options.routes.filter(
    (item) => item.meta && item.meta.showInMenu
  );
});
onMounted(() => {
  console.log(menuItems.value);
});
</script>
<style>
.el-menu-vertical-demo {
  width: 200px;
}
</style>
