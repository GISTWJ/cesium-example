
uniform vec4 color;
uniform sampler2D image;
uniform vec4 gapColor;
uniform float dashLength;
in float v_polylineAngle;
in float v_fillLength;// 填充区域像素长度 自定义
in float v_dashLength;// 填充区域像素宽度 自定义
in float v_metersPerPixel;// 当前状态下每像素代表多少米
in float w;

mat2 rotate(float rad){
    float c=cos(rad);
    float s=sin(rad);
    return mat2(
        c,s,
        -s,c
    );
}
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    // czm_material material=czm_getDefaultMaterial(materialInput);
    // vec4 c=gapColor;
    // vec2 st=materialInput.st;
    // float t=materialInput.st.t;
    // float fillLength=15.*v_metersPerPixel;
    // float dashLength=5.*v_metersPerPixel;
    // // 每一段总长度
    // float markerdelta=fillLength+dashLength;
    // //总长度一半
    // float halfd=markerdelta/2.;
    // float l=st.s*lineLength;
    // float muvx=mod(l,markerdelta);

    // if(muvx>=halfd&&muvx<=halfd+dashLength){
    //     float u=(muvx-halfd)/dashLength;
    //     vec4 imageC=texture(image,vec2(u,10.));
    //     c.xyzw=mix(c,imageC,imageC.w);
    // }
    
    // vec4 fragColor=czm_gammaCorrect(c);

    // material.emission=fragColor.rgb;
    // material.alpha=fragColor.a;
    // return material;
    czm_material material=czm_getDefaultMaterial(materialInput);
    
    vec2 st=materialInput.st;
    float t=materialInput.st.t;
    vec2 pos=rotate(v_polylineAngle)*gl_FragCoord.xy;
    float dashPosition=fract(pos.x/(dashLength*czm_pixelRatio));
    vec4 fragColor;
    fragColor=color*texture(image,vec2(dashPosition,t));
    if(fragColor.a==0.){
        fragColor=gapColor;
    }
    
    if(fragColor.a<.005){// matches 0/255 and 1/255
        discard;
    }
    fragColor=czm_gammaCorrect(fragColor);
    material.emission=fragColor.rgb;
    material.alpha=fragColor.a;
    return material;
}