// 导出默认类 Poly
export default class Poly {
  // 声明 gl 属性，并使用断言确保其不为空
  gl!: WebGLRenderingContext;
  // 声明 program 属性，并使用断言确保其不为空
  program!: WebGLProgram; //赋值类型断言，表示一定会有值
  attrName: string = "a_Position"; // 声明 attrName 属性，并赋值为 "a_Position"
  uniName: string = "u_IsPOINTS"; // 声明 uniName 属性，并赋值为 "u_IsPOINTS"
  u_IsPOINTS: WebGLUniformLocation | null = null; // 声明 u_IsPOINTS 属性，类型为 WebGLUniformLocation 或 null，并赋值为 null
  vertices: number[] = []; // 声明 vertices 属性，类型为 number 数组，并赋值为空数组
  count: number = 0; // 声明 count 属性，并赋值为 0
  size: number = 2; // 声明 size 属性，并赋值为 2
  geoData: pointType[] = []; // 声明 geoData 属性，类型为二维数组，并赋值为空数组
  types: Array<keyof WebGLRenderingContext> = ["POINTS"]; // 声明 types 属性，类型为 WebGLRenderingContext 中的键组成的数组，并赋值为 ["POINTS"]
  circleDot: boolean = false; // 声明 circleDot 属性，并赋值为 false

  // 构造函数，接收一个对象参数 attr
  constructor(attr: object) {
    // 调用 Object.assign 方法，将 defAttr() 返回的对象和传入的 attr 对象的属性值复制给当前对象
    Object.assign(this, defAttr(), attr); //复制属性值
    // 调用 init 方法初始化对象
    this.init();
  }

  // 初始化方法
  init() {
    // 从当前对象中获取属性值
    const { attrName, size, gl, circleDot } = this;
    // 如果 gl 为空，直接返回
    if (!gl) {
      return;
    }
    // 创建顶点缓冲区
    const vertexBuffer = gl.createBuffer();
    // 绑定顶点缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 更新缓冲区数据
    this.updateBuffer(); //更新缓冲区域数据
    // 获取顶点着色器变量位置
    const a_Position = gl.getAttribLocation(this.program, attrName); //获取顶点着色器变量
    // 指定顶点属性数据格式
    gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0);
    // 激活顶点属性
    gl.enableVertexAttribArray(a_Position); //激活批处理
    // 如果 circleDot 为 true，则获取 u_IsPOINTS 的位置
    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(this.program, "u_IsPOINTS");
    }
  }

  // 更新缓冲区数据方法
  updateBuffer() {
    // 从当前对象中获取属性值
    const { gl, vertices } = this;
    // 更新顶点数量
    this.updateCount();
    // 将顶点数据传入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }

  // 更新顶点数量方法
  updateCount() {
    // 计算顶点数量
    this.count = this.vertices.length / this.size;
  }

  // 添加顶点方法，接收任意数量的参数
  addVertice(...params: number[]) {
    // 将参数添加到顶点数组中
    this.vertices.push(...params);
    // 更新缓冲区数据
    this.updateBuffer();
  }

  // 删除最后一个顶点方法
  popVertice() {
    // 从当前对象中获取属性值
    const { vertices, size } = this;
    // 计算要删除的顶点位置
    const len = vertices.length;
    // 删除最后一个顶点
    vertices.splice(len - size, len);
    // 更新顶点数量
    this.updateCount();
  }

  // 设置顶点方法，接收索引和任意数量的参数
  setVertice(ind: number, ...params: number[]) {
    // 从当前对象中获取属性值
    const { vertices, size } = this;
    // 计算要设置的顶点位置
    const i = ind * size;
    // 设置顶点数据
    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param;
    });
  }

  // 更新顶点数据方法，接收参数数组
  updateVertices(params: string[]) {
    // 从当前对象中获取属性值
    const { geoData } = this;
    // 定义新的顶点数组
    const vertices: number[] = [];
    // 遍历地理数据数组
    geoData.forEach((data) => {
      // 根据参数数组提取顶点数据，并添加到新的顶点数组中
      params.forEach((key) => {
        if (isValidKey(key, data)) vertices.push(data[key]);
      });
    });
    // 更新顶点数组
    this.vertices = vertices;
  }

  // 绘制方法，接收绘制类型数组作为参数，默认为 this.types
  draw(types = this.types) {
    // 从当前对象中获取属性值
    const { gl, count, circleDot, u_IsPOINTS } = this;
    // 遍历绘制类型数组
    for (const type of types) {
      // 如果 circleDot 为 true，则设置 u_IsPOINTS 的值
      circleDot && gl.uniform1f(u_IsPOINTS, type === "POINTS" ? 1 : 0);
      // 获取绘制类型对应的常量值
      const glType = gl[type] as number;
      // 绘制图形
      gl.drawArrays(glType, 0, count);
    }
  }
}
//优雅解决字符串当对象的key报错
export function isValidKey(
  key: string | number | symbol,
  object: object
): key is keyof typeof object {
  return key in object;
}
// 默认属性值函数
const defAttr = () => ({
  gl: null,
  vertices: [],
  geoData: [],
  size: 2,
  attrName: "a_Position",
  uniName: "u_IsPOINTS",
  count: 0,
  types: ["POINTS"],
  circleDot: false,
  u_IsPOINTS: null,
});

export type pointType = {
  x: number;
  y: number;
  pointSize: number;
  alpha: number;
};
