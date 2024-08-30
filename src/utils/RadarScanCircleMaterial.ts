import { Color, Material, JulianDate } from "cesium";
import RadarScanCircleMaterialGLSL from "./Shaders/Material/RadarScanCircleMaterial.glsl";
export const RadarScanCircleMaterialType = "RadarScanCircle";

export class RadarScanCircleMaterial extends Material {
  constructor(options: any = {}) {
    const newOptions = {
      fabric: {
        type: options.type || "RadarScanCircle",
        uniforms: options.uniforms || {
          type: options.type ?? 0.0,
          radians: options.radians ?? 0.0,
          color: options.color || new Color(0, 1, 1),
          sectorColor: options.sectorColor || new Color(0, 1, 1),
          backgroundColor: options.backgroundColor || new Color(0, 0, 255),
          time: options.time ?? 0.0,
          count: options.count ?? 5.0,
          gradient: options.gradient ?? 0.01,
          offset: options.offset,
          width: options.width ?? 0.004,
        },
        source: options.shaderSource ?? RadarScanCircleMaterialGLSL,
      },
      translucent: options.translucent ?? true,
    };
    super(newOptions);
  }
}
