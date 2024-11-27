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

    
    // 绘制十字线
    // if((st.s>.5-width/2.&&st.s<.5+width/2.)||(st.t>.5-width/2.&&st.t<.5+width/2.)){
    //     alpha=color.a;
    // }
    
    // 绘制光晕
    float ma=mod(dis+offset,.5);
    if(ma<.25){
        alpha=ma*3.+alpha;
    }else{
        alpha=3.*(.5-ma)+alpha;
    }
    material.alpha=alpha;
    material.diffuse=color.rgb;
    
    // 绘制扇区
    vec2 xy=materialInput.st;
    float rx=xy.x-.5;
    float ry=xy.y-.5;
    float at=atan(ry,rx);
    // 半径
    float radius=sqrt(rx*rx+ry*ry);
    // 扇区叠加旋转角度
    float sur=1.*czm_frameNumber/30.;
    float current_radians=at+radians+sur;
    xy=vec2(cos(current_radians)*radius,sin(current_radians)*radius);
    xy=vec2(xy.x+.5,xy.y+.5);
    
    // 扇区渐变色渲染
    if(xy.y-xy.x<0.&&xy.x>.5&&xy.y>.5){
        material.alpha=alpha;
        material.diffuse=sectorColor.rgb;
    }
    return material;
}