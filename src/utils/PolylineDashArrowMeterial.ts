//@ts-nocheck
import {
  Color,
  JulianDate,
  Material,
  PolylineDashMaterialProperty,
  Property,
} from "cesium";
import PolylineDashArrowMaterialGLSL from  "./Shaders/Material/PolylineDashArrowMaterial.glsl";

const createArrow = (width = 512, height = 512) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  const path = new Path2D();
  path.moveTo(0, 0);
  path.lineTo(10, 0);
  path.lineTo(width, height / 2);
  path.lineTo(10, height);
  path.lineTo(0, height);
  path.lineTo(width / 2, height / 2);
  path.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill(path);

  return canvas;
};

export const PolylineDashArrowType = "PolylineDashArrow";

export class PolylineDashArrowMaterialProperty extends PolylineDashMaterialProperty {
  static Arrow = createArrow();

  constructor(options?: {
    color?: Property | Color;
    gapColor?: Property | Color;
    dashLength?: Property | number;
  }) {
    super(options);
  }

  getType(): string {
    return PolylineDashArrowType;
  }

  getValue(time: JulianDate, result?: any) {
    result = super.getValue(time, result);
    result.image = PolylineDashArrowMaterialProperty.Arrow;

    return result;
  }
}

Material.PolylineDashArrowType = PolylineDashArrowType;
Material._materialCache.addMaterial(PolylineDashArrowType, {
  strict: true,
  translucent: true,
  fabric: {
    uniforms: {
      image: "",
      color: Color.WHITE,
      gapColor: Color.TRANSPARENT,
      dashLength: 16,
    },
    source:PolylineDashArrowMaterialGLSL,
  },
});
