czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material=czm_getDefaultMaterial(materialInput);
    material.diffuse=1.5*color.rgb;
    vec2 st=materialInput.st;
    vec3 str=materialInput.str;
    float dis=distance(st,vec2(.5,.5));
    float per=fract(time);
    if(abs(str.z)>.001){
        discard;
    }
    if(dis>.5){
        discard;
    }else{
        float perDis=.5/count;
        float disNum;
        float bl=.0;
        for(int i=0;i<=9;i++){
            if(float(i)<=count){
                disNum=perDis*float(i)-dis+per/count;
                if(disNum>0.){
                    if(disNum<perDis){
                        bl=1.-disNum/perDis;
                    }else if(disNum-perDis<perDis){
                        bl=1.-abs(1.-disNum/perDis);
                    }
                    material.alpha=pow(bl,gradient);
                }
            }
        }
    }
    return material;
}
