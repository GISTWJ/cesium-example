export default class Sky{
    gl!: WebGLRenderingContext;
    children:any[];
    constructor(gl:WebGLRenderingContext){
      this.gl=gl
      this.children=[]
    }
    add(obj: { gl: WebGLRenderingContext; }){
      obj.gl=this.gl
      this.children.push(obj)
    }
    updateVertices(params: any){
      this.children.forEach(ele=>{
        ele.updateVertices(params)
      })
    }
    draw(){
      this.children.forEach(ele=>{
        ele.init()
        ele.draw()
      })
    }
  }