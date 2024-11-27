import {
  WebGLRenderer as ThreeWebGLRenderer,
  PerspectiveCamera as ThreePerspectiveCamera,
  Scene as ThreeScene,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Viewer as GSViewer,
  SceneRevealMode as GSSceneRevealMode,
} from "@mkkellogg/gaussian-splats-3d";
import {
  Viewer as CesiumViewer,
  Cartesian3 as CesiumCartesian3,
  Matrix4 as CesiumMatrix4,
  Math as CesiumMath,
  PerspectiveFrustum as CesiumPerspectiveFrustum,
  Transforms as CesiumTransforms,
  Quaternion as CesiumQuaternion,
  Matrix3 as CesiumMatrix3,
  HeadingPitchRoll as CesiumHeadingPitchRoll,
} from "cesium";

// 加载3dgs选项类型
export type Load3dgsOptions = {
  splatUrl: string; // Splat资源的URL
  lat: number; // 纬度
  lon: number; // 经度
  height: number; // 高度
  headingPitchRoll: HeadingPitchRoll; // 方向、俯仰和滚转
  scale: Scale; // 缩放
  camera?: CameraOptions; // 相机选项（可选）
};

// 方向、俯仰和滚转类型
type HeadingPitchRoll = {
  heading: number; // 方向
  pitch: number; // 俯仰
  roll: number; // 滚转
};

// 缩放类型
type Scale = number | { x: number; y: number; z: number }; // 数字或三维缩放对象

// 相机选项类型
type CameraOptions = {
  offset?: Offset; // 偏移（可选）
  headingPitchRoll?: HeadingPitchRoll; // 方向、俯仰和滚转（可选）
};

// 偏移类型
type Offset = { x: number; y: number; z: number }; // 三维偏移

const SCALE_BASE = 1 / 1; // 缩放基数

//cesium中加载3dgs
export class CesiumThree3DGS {
  private cesiumViewer: CesiumViewer | null = null; // Cesium 视图对象
  private threeContainer: HTMLElement | null = null; // Three.js 容器元素

  private three: {
    renderer: ThreeWebGLRenderer | null; // WebGL 渲染器
    camera: ThreePerspectiveCamera | null; // 透视相机
    scene: ThreeScene | null; // 场景
    controls: OrbitControls | null; // 控制器
    splatViewer: any; // Splat 视图对象
  } = {
    renderer: null,
    camera: null,
    scene: null,
    controls: null,
    splatViewer: null,
  };

  tc: HTMLElement | null = null; //three容器

  constructor(
    cesiumViewer: CesiumViewer | null = null,
    threeContainer: HTMLElement | null = null
  ) {
    let tc: HTMLElement | null;
    if (cesiumViewer) {
      this.initCesium(cesiumViewer);
    }

    //获取或创建three容器
    if (!threeContainer) {
      tc = document.createElement("div");
      tc.id = "threeContainer";
      const cesiumContainer = cesiumViewer?.container;
      const rect = cesiumContainer?.getBoundingClientRect();

      // 添加样式，使用绝对定位并与 cesium 容器位置对齐
      tc.style.position = "absolute";
      tc.style.top = `${rect?.top || 0}px`;
      tc.style.left = `${rect?.left || 0}px`;
      tc.style.width = `${rect?.width || window.innerWidth}px`;
      tc.style.height = `${rect?.height || window.innerHeight}px`;
      tc.style.pointerEvents = "none";

      // 将 three 容器添加为 cesium 容器的子元素，而不是相邻元素
    //   cesiumViewer?.container.appendChild(tc);
    cesiumViewer?.container.insertAdjacentElement("afterend", tc);
    } else if (typeof threeContainer === "string") {
      tc = document.getElementById(threeContainer);
    } else {
      tc = threeContainer;
    }

    if (tc) {
      this.threeContainer = tc;

      const fov = 45;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      const near = 0.1;
      const far = 5000;

      this.three.scene = new ThreeScene();
      this.three.camera = new ThreePerspectiveCamera(fov, aspect, near, far);
      this.three.renderer = new ThreeWebGLRenderer({ alpha: true });
      this.threeContainer.appendChild(this.three.renderer.domElement);

      const onResize = () => {
        //获取cesium中相机的视椎体的垂直视角，并设置为three中相机的垂直视角
        this.three.camera!.fov = CesiumMath.toDegrees(
          (this.cesiumViewer?.camera.frustum as CesiumPerspectiveFrustum).fovy!
        );
        this.three.camera?.updateProjectionMatrix();

        //获取three容器宽高
        const widthTC = this.threeContainer!.clientWidth;
        const heightTC = this.threeContainer!.clientHeight;
        // 调整渲染器的大小
        this.three.renderer?.setPixelRatio(window.devicePixelRatio);
        this.three.renderer?.setSize(widthTC, heightTC);
        // 更新相机的宽高比
        this.three.camera!.aspect = widthTC / heightTC;
        this.three.camera!.updateProjectionMatrix();
      };
      onResize();
      window.addEventListener("resize", onResize);
    }
    this.three.camera!.matrixAutoUpdate = false; //禁止自动更新
  }

  /**
   * @description: 初始化cesium
   * @param {CesiumViewer} cesiumViewer
   * @return {*}
   */
  private initCesium(cesiumViewer: CesiumViewer) {
    this.cesiumViewer = cesiumViewer;
  }

  /**
   * @description: 初始化three
   * @return {*}
   */
  private async initThree() {
    this.three.splatViewer = new GSViewer({
      selfDrivenMode: false,
      renderer: this.three.renderer,
      camera: this.three.camera,
      useBuiltInControls: false,
      threeScene: this.three.scene,
      sceneRevealMode: GSSceneRevealMode.Instant,
      integerBasedSort: true, // 整数排序
      gpuAcceleratedSort: false,
      sharedMemoryForWorkers: false,
    });
  }

  /**
   * @description: 移除所有3dgs
   * @param {*} showLoadingUI
   * @return {*}
   */
  public async remove3dgsAll(showLoadingUI = true) {
    if (!this.three.splatViewer) return;
    const indexesToRemove = [];
    for (let i = 0; i < this.three.splatViewer.getSceneCount(); i++) {
      indexesToRemove.push(i); // 收集要移除的场景索引
    }
    if (indexesToRemove.length > 0) {
      await this.three.splatViewer.removeSplatScenes(
        indexesToRemove,
        showLoadingUI
      ); //根据索引移除场景
    } else {
      if (this.three.splatViewer.isLoadingOrUnloading()) {
        throw new Error("另一个加载或卸载正在进行时无法添加 splat 场景"); // 抛出错误
      }
    }
    this.three.splatViewer.update(); // 更新 Splat 视图
    this.three.splatViewer.render(); // 渲染 Splat 视图

    await this.dispose(); // 清理资源
    delete this.three.splatViewer; // 删除 Splat 视图
  }

  /**
   * @description: 释放资源
   * @return {*}
   */
  private async dispose() {
    if (this.three.splatViewer) {
      await this.three.splatViewer.dispose(); // 释放 Splat 视图资源
    }
  }

  public async load3dgs(options: Load3dgsOptions) {
    let { splatUrl, lat, lon, height, headingPitchRoll, scale, camera } =
      options; //解构参数
    await this.initThree();
    if (typeof scale === "number") {
      scale = { x: scale, y: scale, z: scale };
    }

    const position = CesiumCartesian3.fromDegrees(lon, lat, height);
    const p = CesiumCartesian3.multiplyByScalar(
      position,
      SCALE_BASE,
      new CesiumCartesian3()
    );
    const enuTransform = CesiumTransforms.eastNorthUpToFixedFrame(position);
    const rotationMatrix = CesiumMatrix4.getRotation(
      enuTransform,
      new CesiumMatrix3()
    );
    const quaternion = CesiumQuaternion.fromRotationMatrix(rotationMatrix); // 从旋转矩阵创建四元数
    const q5 = CesiumQuaternion.fromHeadingPitchRoll(
      new CesiumHeadingPitchRoll(
        CesiumMath.toRadians(headingPitchRoll.heading),
        CesiumMath.toRadians(headingPitchRoll.pitch),
        CesiumMath.toRadians(headingPitchRoll.roll)
      )
    ); // 创建四元数
    let q = CesiumQuaternion.multiply(quaternion, q5, new CesiumQuaternion()); // 组合四元数
    // 将 Z 轴向上旋转 90 度以适应 Three.js
    let q6 = CesiumQuaternion.fromAxisAngle(
      new CesiumCartesian3(1, 0, 0),
      CesiumMath.toRadians(90)
    );
    q = CesiumQuaternion.multiply(q, q6, new CesiumQuaternion());
    if (!(camera && camera.offset && camera.headingPitchRoll)) {
      this.cesiumViewer?.camera.moveBackward(10); // 向后移动相机
    }

    await this.three.splatViewer.addSplatScene(splatUrl, {
      // 添加位置、旋转和缩放参数
    });
    const splatMesh = this.three.splatViewer.getSplatMesh(); // 获取 Splat 网格
    splatMesh.position.set(p.x, p.y, p.z); // 设置位置
    splatMesh.quaternion.set(q.x, q.y, q.z, q.w); // 设置旋转
    splatMesh.scale.set(
      SCALE_BASE * scale.x,
      SCALE_BASE * scale.y,
      SCALE_BASE * scale.z
    ); // 设置缩放
    // 处理相机位置
    if (camera && camera.offset && camera.headingPitchRoll) {
      const nloc = [lon, lat];
      const targetCartesian = CesiumCartesian3.fromDegrees(
        nloc[0],
        nloc[1],
        height
      );
      const enuMatrix =
        CesiumTransforms.eastNorthUpToFixedFrame(targetCartesian); // 获取 ENU 转换矩阵

      const localPosition = new CesiumCartesian3(
        camera.offset.x,
        camera.offset.y,
        camera.offset.z
      ); // 本地坐标
      const worldPosition = CesiumMatrix4.multiplyByPoint(
        enuMatrix,
        localPosition,
        new CesiumCartesian3()
      ); // 转换为世界坐标

      await this.cesiumViewer?.camera.flyTo({
        destination: worldPosition,
        orientation: {
          heading: CesiumMath.toRadians(
            camera.headingPitchRoll?.heading - headingPitchRoll.heading
          ),
          pitch: CesiumMath.toRadians(camera.headingPitchRoll?.pitch),
          roll: CesiumMath.toRadians(camera.headingPitchRoll?.roll),
        },
        duration: 3,
      });
    } else {
      this.cesiumViewer?.camera.moveForward(10); // 向前移动相机
    }

    return 0; // 返回 0
  }
  public renderThreeObj() {
    if (
      !this.three.camera ||
      !this.cesiumViewer ||
      !this.threeContainer ||
      !this.three.renderer
    ) {
      return; // 如果没有相机、Cesium 视图或渲染器则返回
    }

    const civm = this.cesiumViewer.camera.inverseViewMatrix; // 获取逆视图矩阵

    // 创建缩放矩阵
    const scaleMatrix = CesiumMatrix4.fromScale(
      new CesiumCartesian3(SCALE_BASE, SCALE_BASE, SCALE_BASE)
    );
    // 计算新的视图矩阵
    const scaledViewMatrix = CesiumMatrix4.multiply(
      scaleMatrix,
      civm,
      new CesiumMatrix4()
    );

    this.three.camera.matrixWorld.set(
      scaledViewMatrix[0],
      scaledViewMatrix[4],
      scaledViewMatrix[8],
      scaledViewMatrix[12],
      scaledViewMatrix[1],
      scaledViewMatrix[5],
      scaledViewMatrix[9],
      scaledViewMatrix[13],
      scaledViewMatrix[2],
      scaledViewMatrix[6],
      scaledViewMatrix[10],
      scaledViewMatrix[14],
      scaledViewMatrix[3],
      scaledViewMatrix[7],
      scaledViewMatrix[11],
      scaledViewMatrix[15]
    );

    // 解构矩阵以获取位置、旋转和缩放
    this.three.camera.matrixWorld.decompose(
      this.three.camera.position,
      this.three.camera.quaternion,
      this.three.camera.scale
    );

    if (this.three.splatViewer) {
      this.three.splatViewer.update(); // 更新 Splat 视图
      this.three.splatViewer.render(); // 渲染 Splat 视图
    }
  }
}
