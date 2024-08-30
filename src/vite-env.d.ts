
/// <reference types="vite/client" />
declare interface Window {
  CESIUM_BASE_URL: any;
}
declare module "*.glsl" {
  const value: string;
  export default value;
}