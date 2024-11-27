import { Color, Material } from "cesium";
import DynamicDiffuseMaterialGLSL from "./Shaders/Material/DynamicDiffuseMaterial.glsl";

export class DynamicDiffuseMaterial extends Material {
  constructor(options: any = {}) {
    const newOptions = {
      fabric: {
        type: options.type || "DynamicDiffuse",
        unifoms: options.uniforms || {},
        source: options.shaderSource ?? DynamicDiffuseMaterialGLSL,
      },
      translucent: options.translucent ?? true,
    };
    super(newOptions);
  }
}
