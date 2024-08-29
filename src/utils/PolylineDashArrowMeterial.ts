//@ts-nocheck
import {
  Color,
  JulianDate,
  Material,
  PolylineDashMaterialProperty,
  Property,
} from "cesium";

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
    source: `
        uniform sampler2D image;
        uniform vec4 color;
        uniform vec4 gapColor;
        uniform float dashLength;
        in float v_polylineAngle;

        mat2 rotate(float rad) {
            float c = cos(rad);
            float s = sin(rad);
            return mat2(
                c, s,
                -s, c
            );
        }
  
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
            czm_material material = czm_getDefaultMaterial(materialInput);
    
            float t = materialInput.st.t;
            vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;
  
            // Get the relative position within the dash from 0 to 1
            float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));
            
            vec4 fragColor;
            fragColor = color * texture(image, vec2(dashPosition, t));
            if (fragColor.a == 0.0) {
                fragColor = gapColor;
            }
            
            if (fragColor.a < 0.005) {   // matches 0/255 and 1/255
                discard;
            }
  
            fragColor = czm_gammaCorrect(fragColor);
            material.emission = fragColor.rgb;
            material.alpha = fragColor.a;
            return material;
        }
      `,
  },
});
