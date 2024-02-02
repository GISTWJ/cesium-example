/*
 * @Author: twj
 * @Date: 2024-01-25 09:19:02
 * @LastEditTime: 2024-01-25 14:27:40
 * @LastEditors: twj
 * @Description:
 */
import { createApp } from "vue";
import "./style.css";
import "cesium/Source/Widgets/widgets.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import App from "./App.vue";

window.CESIUM_BASE_URL = "/cesium"; //添加Cesium静态资源路径


const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.mount("#app");
