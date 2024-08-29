import Poly from "./Poly";
export default class Sky {
  gl!: WebGLRenderingContext;
  children: Poly[];
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.children = [];
  }
  add(obj: Poly) {
    obj.gl = this.gl;
    this.children.push(obj);
  }
  updateVertices(params: string[]) {
    this.children.forEach((ele) => {
      ele.updateVertices(params);
    });
  }
  draw() {
    this.children.forEach((ele) => {
      ele.init();
      ele.draw();
    });
  }
}
