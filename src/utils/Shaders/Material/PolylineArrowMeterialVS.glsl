
void clipLineSegmentToNearPlane(
   vec3 p0,
   vec3 p1,
   out vec4 positionWC,
   out bool clipped,
   out bool culledByNearPlane,
out vec4 clippedPositionEC)
{
   culledByNearPlane=false;
   clipped=false;
   
   vec3 p0ToP1=p1-p0;
   float magnitude=length(p0ToP1);
   vec3 direction=normalize(p0ToP1);
   
   float endPoint0Distance=czm_currentFrustum.x+p0.z;
   
   float denominator=-direction.z;
   
   if(endPoint0Distance>0.&&abs(denominator)<czm_epsilon7)
   {
      
      culledByNearPlane=true;
   }
   else if(endPoint0Distance>0.)
   {
      float t=endPoint0Distance/denominator;
      if(t<0.||t>magnitude)
      {
         
         culledByNearPlane=true;
      }
      else
      {
         
         p0=p0+t*direction;
         
         p0.z=min(p0.z,-czm_currentFrustum.x);
         
         clipped=true;
      }
   }
   
   clippedPositionEC=vec4(p0,1.);
   positionWC=czm_eyeToWindowCoordinates(clippedPositionEC);
}

vec4 getPolylineWindowCoordinatesEC(vec4 positionEC,vec4 prevEC,vec4 nextEC,float expandDirection,float width,bool usePrevious,out float angle)
{
   
   #ifdef POLYLINE_DASH
   vec4 positionWindow=czm_eyeToWindowCoordinates(positionEC);
   vec4 previousWindow=czm_eyeToWindowCoordinates(prevEC);
   vec4 nextWindow=czm_eyeToWindowCoordinates(nextEC);
   
   vec2 lineDir;
   if(usePrevious){
      lineDir=normalize(positionWindow.xy-previousWindow.xy);
   }
   else{
      lineDir=normalize(nextWindow.xy-positionWindow.xy);
   }
   angle=atan(lineDir.x,lineDir.y)-1.570796327;// precomputed atan(1,0)
   
   angle=floor(angle/czm_piOverFour+.5)*czm_piOverFour;
   #endif
   
   vec4 clippedPrevWC,clippedPrevEC;
   bool prevSegmentClipped,prevSegmentCulled;
   clipLineSegmentToNearPlane(prevEC.xyz,positionEC.xyz,clippedPrevWC,prevSegmentClipped,prevSegmentCulled,clippedPrevEC);
   
   vec4 clippedNextWC,clippedNextEC;
   bool nextSegmentClipped,nextSegmentCulled;
   clipLineSegmentToNearPlane(nextEC.xyz,positionEC.xyz,clippedNextWC,nextSegmentClipped,nextSegmentCulled,clippedNextEC);
   
   bool segmentClipped,segmentCulled;
   vec4 clippedPositionWC,clippedPositionEC;
   clipLineSegmentToNearPlane(positionEC.xyz,usePrevious?prevEC.xyz:nextEC.xyz,clippedPositionWC,segmentClipped,segmentCulled,clippedPositionEC);
   
   if(segmentCulled)
   {
      return vec4(0.,0.,0.,1.);
   }
   
   vec2 directionToPrevWC=normalize(clippedPrevWC.xy-clippedPositionWC.xy);
   vec2 directionToNextWC=normalize(clippedNextWC.xy-clippedPositionWC.xy);
   if(prevSegmentCulled)
   {
      directionToPrevWC=-directionToNextWC;
   }
   else if(nextSegmentCulled)
   {
      directionToNextWC=-directionToPrevWC;
   }
   
   vec2 thisSegmentForwardWC,otherSegmentForwardWC;
   if(usePrevious)
   {
      thisSegmentForwardWC=-directionToPrevWC;
      otherSegmentForwardWC=directionToNextWC;
   }
   else
   {
      thisSegmentForwardWC=directionToNextWC;
      otherSegmentForwardWC=-directionToPrevWC;
   }
   
   vec2 thisSegmentLeftWC=vec2(-thisSegmentForwardWC.y,thisSegmentForwardWC.x);
   
   vec2 leftWC=thisSegmentLeftWC;
   float expandWidth=width*.5;
   if(!czm_equalsEpsilon(prevEC.xyz-positionEC.xyz,vec3(0.),czm_epsilon1)&&!czm_equalsEpsilon(nextEC.xyz-positionEC.xyz,vec3(0.),czm_epsilon1))
   {
      vec2 otherSegmentLeftWC=vec2(-otherSegmentForwardWC.y,otherSegmentForwardWC.x);
      
      vec2 leftSumWC=thisSegmentLeftWC+otherSegmentLeftWC;
      float leftSumLength=length(leftSumWC);
      leftWC=leftSumLength<czm_epsilon6?thisSegmentLeftWC:(leftSumWC/leftSumLength);
      vec2 u=-thisSegmentForwardWC;
      vec2 v=leftWC;
      float sinAngle=abs(u.x*v.y-u.y*v.x);
      expandWidth=clamp(expandWidth/sinAngle,0.,width*2.);
   }
   
   vec2 offset=leftWC*expandDirection*expandWidth*czm_pixelRatio;
   return vec4(clippedPositionWC.xy+offset,-clippedPositionWC.z,1.)*(czm_projection*clippedPositionEC).w;
}

vec4 getPolylineWindowCoordinates(vec4 position,vec4 previous,vec4 next,float expandDirection,float width,bool usePrevious,out float angle)
{
   vec4 positionEC=czm_modelViewRelativeToEye*position;
   vec4 prevEC=czm_modelViewRelativeToEye*previous;
   vec4 nextEC=czm_modelViewRelativeToEye*next;
   
   return getPolylineWindowCoordinatesEC(positionEC,prevEC,nextEC,expandDirection,width,usePrevious,angle);
}

in vec3 position3DHigh;
in vec3 position3DLow;
in vec3 prevPosition3DHigh;
in vec3 prevPosition3DLow;
in vec3 nextPosition3DHigh;
in vec3 nextPosition3DLow;
in vec2 expandAndWidth;
in vec2 st;
in float batchId;

out float v_fillLength;// 填充区域像素长度 自定义
out float v_dashLength;// 填充区域像素宽度 自定义
out float v_metersPerPixel;// 当前状态下每像素代表多少米
out float v_width;
out vec2 v_st;
out float v_polylineAngle;
out float w;

void main()
{
   float expandDir=expandAndWidth.x;
   float width=abs(expandAndWidth.y)+.5;
   bool usePrev=expandAndWidth.y<0.;
   
   vec4 p=czm_computePosition();
   vec4 prev=czm_computePrevPosition();
   vec4 next=czm_computeNextPosition();
   
   float angle;
   vec4 positionWC=getPolylineWindowCoordinates(p,prev,next,expandDir,width,usePrev,angle);
   vec4 positionEC=czm_modelViewRelativeToEye*czm_computePosition();
   v_metersPerPixel=max(0.,czm_metersPerPixel(positionEC));
   
   gl_Position=czm_viewportOrthographic*positionWC;
   v_width=width;
   w=gl_Position.w;
   v_st.s=st.s;
   v_st.t=czm_writeNonPerspective(st.t,gl_Position.w);
   v_polylineAngle=angle;
}