
uniform vec4 u_highlightColor;
uniform sampler2D image;
// uniform float my;

in vec2 v_st;
in float v_fillLength;// 填充区域像素长度 自定义
in float v_dashLength;// 填充区域像素宽度 自定义
in float v_metersPerPixel;// 当前状态下每像素代表多少米
in vec2 v_uv;// u代表当前顶点距离起点的长度（单位米）外面用Cartesian3.distance计算

void main()
{
    czm_materialInput materialInput;
    
    vec2 st=v_st;
    st.t=czm_readNonPerspective(st.t,gl_FragCoord.w);
    
    materialInput.s=st.s;
    materialInput.st=st;
    materialInput.str=vec3(st,0.);
    // 每一段总长度
    float markerdelta=(v_fillLength+v_dashLength)*v_metersPerPixel;
    float halfd=markerdelta/2.;
    float muvx=mod(v_st.s,markerdelta);
    if(muvx>=halfd&&muvx<=halfd+v_dashLength){
        discard;
    }
    czm_material material=czm_getMaterial(materialInput);
    out_FragColor=vec4(material.diffuse+material.emission,material.alpha);

    czm_writeLogDepth();
}