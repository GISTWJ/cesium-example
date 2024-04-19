//创建WebGLProgram
export const initProgram = (
  gl: WebGLRenderingContext,
  vertexString: string,
  fragmentString: string
): WebGLProgram => {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
  gl.shaderSource(vertexShader, vertexString);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
  gl.shaderSource(fragmentShader, fragmentString);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
};

//调整canvas大小
export const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement,
  multiplier: number | undefined
) => {
  multiplier = multiplier || 1;
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
};

export const getMousePosInWebgl = (
  clientXY: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement
) => {
  //鼠标在画布中的css位置
  const { left, top, width, height } = canvas.getBoundingClientRect();
  const [cssX, cssY] = [clientXY.clientX - left, clientXY.clientY - top];
  //解决坐标原点位置的差异
  const [halfWidth, halfHeight] = [width / 2, height / 2];
  const [xBaseCenter, yBaseCenter] = [cssX - halfWidth, cssY - halfHeight];
  // 解决y 方向的差异
  const yBaseCenterTop = -yBaseCenter;
  //解决坐标基底的差异
  return {
    x: xBaseCenter / halfWidth,
    y: yBaseCenterTop / halfHeight,
  };
};

export function glToCssPos({ x, y }, { width, height }) {
  const [halfWidth, halfHeight] = [width / 2, height / 2];
  return {
    x: x * halfWidth,
    y: -y * halfHeight,
  };
}
