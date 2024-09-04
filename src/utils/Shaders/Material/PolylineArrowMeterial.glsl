
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
    czm_material material=czm_getDefaultMaterial(materialInput);
    
    vec2 st=materialInput.st;
    float t=materialInput.st.t;
    vec2 pos=rotate(v_polylineAngle)*gl_FragCoord.xy;
    vec2 v_st;
    v_st.s=st.s;
    v_st.t=czm_readNonPerspective(st.t,w);
    
    float dashPosition=fract(pos.x/(dashLength*czm_pixelRatio));
    
    vec4 fragColor;
    fragColor=color*texture(image,vec2(dashPosition,t));
    if(fragColor.a==0.){
        fragColor=gapColor;
    }
    
    if(fragColor.a<.005){// matches 0/255 and 1/255
        discard;
    }
    // float fillLength=10.0/v_metersPerPixel;
    // float dashLength=5.0;
    // float markerdelta=(fillLength+dashLength);
    // float halfd=markerdelta/2.;
    // float muvx=mod(st.s,markerdelta);
    // fragColor=gapColor;
    // if(muvx>=halfd&&muvx<=halfd+dashLength){
        //     fragColor=color*texture(image,vec2(dashPosition,t));
        //     if(fragColor.a==0.){
            //         fragColor=gapColor;
        //     }
        
        //     if(fragColor.a<.005){// matches 0/255 and 1/255
            //         discard;
        //     }
    // }
    
    fragColor=czm_gammaCorrect(fragColor);
    material.emission=fragColor.rgb;
    material.alpha=fragColor.a;
    return material;
}