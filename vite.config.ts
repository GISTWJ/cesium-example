/*
 * @Author: twj
 * @Date: 2024-01-25 09:19:02
 * @LastEditTime: 2024-02-29 16:12:32
 * @LastEditors: twj
 * @Description:
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import eslint from 'vite-plugin-eslint' // 新增

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // eslint()
  ],
});
