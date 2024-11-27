/// <reference types="vite/client" />
declare interface Window {
  CESIUM_BASE_URL: any;
}
declare module "*.glsl" {
  const value: string;
  export default value;
}
declare module "@mkkellogg/gaussian-splats-3d";
