import { Color, Material, JulianDate } from "cesium";
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
          width:options.width??0.004,
        },
        source:
          options.shaderSource ??
          `
          uniform vec4 color;
          uniform vec4 sectorColor;
          uniform vec4 backgroundColor;
          uniform float width;
          uniform float radians;
          uniform float offset;
          uniform float count;
          
          czm_material czm_getMaterial(czm_materialInput materialInput)
          {
              czm_material material=czm_getDefaultMaterial(materialInput);
              vec2 st=materialInput.st;
              float dis=distance(st,vec2(.5));
              
              float alpha;
              vec3 diffuse;
              float sp=.5/count;
              float m=mod(dis,sp);
              
              alpha=step(sp*(1.-width*10.),m);
              
              material.alpha=alpha;
  
            //   material.diffuse=vec3(color.rgb.r,color.rgb.g * czm_frameNumber /60.0,color.rgb.b);
            //   if(alpha<backgroundColor.a){
            //       alpha=backgroundColor.a;
            //       diffuse=backgroundColor.rgb;
            //   }else{
            //       diffuse=color.rgb;
            //   }
              material.alpha=alpha;
              material.diffuse=diffuse;
              
              // 绘制十字线
              if((st.s>.5-width/2.&&st.s<.5+width/2.)||(st.t>.5-width/2.&&st.t<.5+width/2.)){
                  alpha=color.a;
                  
                  material.alpha=alpha;
                  material.diffuse=color.rgb;
              }
              
              // 绘制光晕
              float ma=mod(dis+offset,.5);
              if(ma<.25){
                  alpha=ma*3.+alpha;
              }else{
                  alpha=3.*(.5-ma)+alpha;
              }
              material.alpha=alpha;
              material.diffuse=sectorColor.rgb;
              
              // 绘制扇区
              vec2 xy=materialInput.st;
              float rx=xy.x-.5;
              float ry=xy.y-.5;
              float at=atan(ry,rx);
              // 半径
              float radius=sqrt(rx*rx+ry*ry);
              // 扇区叠加旋转角度
              float sur =1.0* czm_frameNumber / 10.0;
              float current_radians=at+radians+sur;
              xy=vec2(cos(current_radians)*radius,sin(current_radians)*radius);
              xy=vec2(xy.x+.5,xy.y+.5);
              
              // 扇区渐变色渲染
              if(xy.y-xy.x<0.&&xy.x>.5&&xy.y>.5){
                  material.alpha=alpha+backgroundColor.a;
                  material.diffuse=sectorColor.rgb;
              }
              return material;
          }
        `,
      },
      translucent: options.translucent ?? true,
    };
    super(newOptions);
  }
}
