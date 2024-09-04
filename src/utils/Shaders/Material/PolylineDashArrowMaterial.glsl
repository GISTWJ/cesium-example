uniform sampler2D image;
uniform vec4 color;
uniform vec4 gapColor;
uniform float dashLength;
in float v_polylineAngle;

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
    
    float t=materialInput.st.t;
    vec2 pos=rotate(v_polylineAngle)*gl_FragCoord.xy;
    
    // Get the relative position within the dash from 0 to 1
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