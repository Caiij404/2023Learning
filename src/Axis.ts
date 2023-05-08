import * as THREE from "three";
import {
  Object3D,
  Vector3,
  Quaternion,
  Mesh,
  Euler,
  Matrix4,
  Raycaster,
} from "three";
const _raycaster = new Raycaster();

const _tempVector = new Vector3();
const _tempVector2 = new Vector3();
const _tempQuaternion = new Quaternion();
const _unit = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1),
};

const _changeEvent = { type: "change" };
const _mouseDownEvent = { type: "mouseDown" };
const _mouseUpEvent = { type: "mouseUp", mode: null };
const _objectChangeEvent = { type: "objectChange" };

class Property {
  camera: THREE.PerspectiveCamera;
  object: Mesh;
  enable: boolean;
  axis: string;
  mode: string;
  // translationSnap:
  // rotationSnap:
  // scaleSnap:
  space: string;
  size: number;
  dragging: boolean;
  showX: boolean;
  showY: boolean;
  showZ: boolean;
  worldPosition: Vector3;
  worldPositionStart: Vector3;
  worldQuaternion: Quaternion;
  worldQuaternionStart: Quaternion;
  cameraPosition: Vector3;
  cameraQuaternion: Quaternion;
  pointStart: Vector3;
  pointEnd: Vector3;
  rotationAxis: Vector3;
  rotationAngle: Vector3;
  eye: Vector3;
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.object = new Mesh();
    this.enable = false;
    this.axis = "";
    this.mode = "translate";
    // this.translationSnap =
    // this.rotationSnap =
    // this.scaleSnap =
    this.space = "world";
    this.size = 1;
    this.dragging = false;
    this.showX = true;
    this.showY = true;
    this.showZ = true;

    this.worldPosition = new Vector3();
    this.worldPositionStart = new Vector3();
    this.worldQuaternion = new Quaternion();
    this.worldQuaternionStart = new Quaternion();
    this.cameraPosition = camera.position;
    this.cameraQuaternion = camera.quaternion;
    this.pointStart = new Vector3();
    this.pointEnd = new Vector3();
    this.rotationAxis = new Vector3();
    this.rotationAngle = new Vector3();
    this.eye = new Vector3();
  }
}

class TransformControls extends Object3D {
  visible: boolean;
  axis = new Object3D();
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  _gizmo: TransformControlsGizmo;
  _plane: TransformControlsPlane;
  object: Object3D | THREE.Mesh;
  property: Property;
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    super();
    this.visible = false;
    this.scene = scene;
    this.camera = camera;
    this.object = new THREE.Object3D();
    this.property = new Property(camera);

    // this._gizmo 有个child
    this._gizmo = new TransformControlsGizmo(camera);
    this.add(this._gizmo);

    this._plane = new TransformControlsPlane(camera, scene);
    // this.add(this._plane);
  }

  updateMatrixWorld(): void {
    if (this.object) {
      this.object.updateMatrixWorld();

      // 将object的矩阵，decompose 分解给this的position quaternion scale
      // 所以三轴的位置才会是object的位置
      this.object.matrixWorld.decompose(
        this.position,
        // new Quaternion(),
        this.quaternion,
        new Vector3()
      );
      // 三轴的缩放不要跟着物体
      this.scale.set(1, 1, 1);
      // 四元数是物体旋转角度的体现方法之一，如果三轴的四元数和物体一样，可以实现墙面物体三轴坐标系
      // this.quaternion.set()
    }

    // this.updateProperty(this.property);
    this.updateProperty(this._gizmo.property);
    this.updateProperty(this._plane.property);

    // 更新相机的矩阵 不可省略  gizmo和plane也会更新
    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose(
      this.camera.position,
      this.camera.quaternion,
      this.camera.scale
    );
    super.updateMatrixWorld(true);
  }

  updateProperty(pro: Property): void {
    pro.cameraPosition = this.camera.position;
    pro.cameraQuaternion = this.camera.quaternion;
    pro.object = <Mesh>this.object;
  }
  attach(object: THREE.Object3D<THREE.Event>): this {
    this.object = object;
    this.visible = true;
    return this;
  }
}

const _tempEuler = new Euler();
const _alignVector = new Vector3(0, 0, 0);
const _zeroVector = new Vector3(0, 0, 0);
const _lookAtMatrix = new Matrix4();
const _tempQuaternion2 = new Quaternion();
const _identityQuaternion = new Quaternion();
const _dirVector = new Vector3();
const _tempMatrix = new Matrix4();

const _unitX = new Vector3(1, 0, 0);
const _unitY = new Vector3(0, 1, 0);
const _unitZ = new Vector3(0, 0, 1);

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

const xV = new Vector3(0, 1, 0);
const yV = new Vector3(0, 0, 1);
const zV = new Vector3(0, 1, 0);
let flag = true;

class TransformControlsGizmo extends Object3D {
  // 构造函数要赋值，或者在声明时初始化、断言
  isTransformControlsGizmo: boolean;
  gizmo: { translate: THREE.Object3D };
  // gizmo: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
  property: Property;
  constructor(camera: THREE.PerspectiveCamera) {
    super();
    this.camera = camera;
    this.isTransformControlsGizmo = true;
    this.property = new Property(camera);
    this.gizmo = { translate: new THREE.Object3D() };

    const textureLoader = new THREE.TextureLoader();
    const xmap = textureLoader.load("./imgs/freemove_x.png");
    const ymap = textureLoader.load("./imgs/freemove_y.png");

    const xMaterial = new THREE.MeshStandardMaterial({
      map: xmap,
      transparent: true,
      side: THREE.DoubleSide,
      visible: true,
      color: 0xff0000,
    });
    const xPlane = new THREE.PlaneGeometry(0.2, 0.1, 100, 100);

    const yMaterial = new THREE.MeshStandardMaterial({
      map: ymap,
      transparent: true,
      side: THREE.DoubleSide,
      visible: true,
      color: 0x00ff00,
    });
    const yPlane = new THREE.PlaneGeometry(0.1, 0.2, 100, 100);

    const zMaterial = xMaterial.clone();
    zMaterial.color.setHex(0x0000ff);
    const zPlane = xPlane.clone();

    // interface gizmoAxisX {
    //   X: [THREE.Mesh, THREE.Vector3, THREE.Vector3];
    // }
    // interface gizmoAxis1{[THREE.Mesh, THREE.Vector3, THREE.Vector3]};
    const gizmoTranslate: Map<
      string,
      [THREE.Mesh, THREE.Vector3, THREE.Vector3]
    > = new Map();

    gizmoTranslate.set("X", [
      new THREE.Mesh(xPlane, xMaterial),
      new THREE.Vector3(0.5, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    gizmoTranslate.set("Y", [
      new THREE.Mesh(yPlane, yMaterial),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    gizmoTranslate.set("Z", [
      new THREE.Mesh(zPlane, zMaterial),
      new THREE.Vector3(0, 0, 0.5),
      new THREE.Vector3(-Math.PI / 2, 0, -Math.PI / 2),
    ]);

    // 读取 强转
    const my = <[THREE.Mesh, THREE.Vector3, THREE.Vector3]>(
      gizmoTranslate.get("Y")
    );
    const m = my[0];
    const ve3 = new Vector3(0, 0, 1);
    // console.log(m);

    function setupGizmo(
      gizmoMap: Map<string, [THREE.Mesh, THREE.Vector3, THREE.Vector3]>
    ) {
      const gizmo = new Object3D();
      // });
      for (const [key, value] of gizmoMap) {
        const object = value[0].clone();
        const pos = value[1];
        const rot = value[2];
        object.name = key;

        if (pos) {
          object.position.set(pos.x, pos.y, pos.z);
        }
        if (rot) {
          object.rotation.set(rot.x, rot.y, rot.z);
        }

        object.updateMatrix();

        const tmpGeomotry = object.geometry.clone();
        tmpGeomotry.applyMatrix4(object.matrix);
        object.geometry = tmpGeomotry;
        object.renderOrder = Infinity;

        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);

        object.visible = true;

        gizmo.add(object);
      }
      return gizmo;
    }

    this.add((this.gizmo["translate"] = setupGizmo(gizmoTranslate)));
    // this.add((this.gizmo = setupGizmo(gizmoTranslate)));
  }

  updateMatrixWorld(force?: boolean | undefined): void {
    this.gizmo["translate"].visible = true;
    // this.gizmo.visible = true;

    let handles: THREE.Mesh[] = [];
    handles = handles.concat(this.gizmo["translate"].children as THREE.Mesh[]);
    // handles = handles.concat(this.gizmo.children as THREE.Mesh[]);
    for (let i = 0; i < handles.length; ++i) {
      const handle = handles[i];

      handle.visible = true;
      handle.rotation.set(0, 0, 0);
      handle.position.copy(this.position);

      const factor =
        this.position.distanceTo(this.camera.position) *
        Math.min(
          (1.9 * Math.tan((Math.PI * this.camera.fov) / 360)) /
            this.camera.zoom,
          7
        );
      handle.scale.set(1, 1, 1).multiplyScalar(factor / 4);
    }
    // this.updateAxis();
    super.updateMatrixWorld(force);
  }

  updateAxis(): void {
    const eye = new Vector3();
    eye
      .copy(this.property.cameraPosition)
      .sub(this.property.object.position)
      .normalize();
    const v1 = new Vector3(1, 0, 0);
    const v2 = new Vector3(0, 1, 0);
    const v3 = new Vector3(0, 0, 1);

    // 这个操作会把平面绕z轴旋转90度
    function dealAxis(v: Vector3, obj: Object3D): Object3D {
      const align = new Vector3();
      const dir = new Vector3();
      align.copy(eye).cross(v);
      dir.copy(v).cross(align);
      const tmpMat = new Matrix4();
      const tmpVec = new Vector3();
      tmpMat.lookAt(tmpVec.set(0, 0, 0), dir, align);
      obj.quaternion.setFromRotationMatrix(tmpMat);
      return obj;
    }
    const x = this.gizmo["translate"].children[0];
    this.gizmo["translate"].children[0].copy(dealAxis(v1, x));

    const z = this.gizmo.translate.children[2];
    this.gizmo.translate.children[2].copy(dealAxis(v1, z));

    if (flag) {
      flag = false;
      console.log(x);
      console.log(z);
    }

    // _alignVector.copy(eye).cross(v1);
    // _dirVector.copy(v1).cross(_alignVector);
    // const x = this.gizmo.translate.children[0];
    // const tmpMat = new Matrix4();
    // tmpMat.lookAt(x.position, _dirVector, _alignVector);
    // x.quaternion.setFromRotationMatrix(tmpMat);
    // // x.lookAt(_dirVector);
    // this.gizmo.translate.children[0].copy(x);
  }
}

// 参考面
class TransformControlsPlane extends THREE.Mesh {
  isTransformControlsPlane: boolean;
  type: string;
  property: Property;
  scene: THREE.Scene;
  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    super(
      new THREE.PlaneGeometry(5, 10, 20, 20),
      new THREE.MeshBasicMaterial({
        visible: true,
        wireframe: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.1,
        toneMapped: false,
      })
    );
    this.scene = scene;
    this.isTransformControlsPlane = true;
    this.type = "TransformControlsPlane";
    this.property = new Property(camera);
  }

  updateMatrixWorld(force?: boolean | undefined): void {
    let space = this.property.space;
    this.position.copy(this.property.worldPosition);

    if (this.property.mode === "scale") space = "local";

    _v1
      .copy(_unitX)
      .applyQuaternion(
        space === "local" ? this.property.worldQuaternion : _identityQuaternion
      );
    _v2
      .copy(_unitY)
      .applyQuaternion(
        space === "local" ? this.property.worldQuaternion : _identityQuaternion
      );
    _v3
      .copy(_unitZ)
      .applyQuaternion(
        space === "local" ? this.property.worldQuaternion : _identityQuaternion
      );

    _alignVector.copy(_v2);

    this.property.eye
      .copy(this.property.cameraPosition)
      .sub(this.property.object.position)
      .normalize();

    this.property.mode = "translate";
    this.property.axis = "X";
    switch (this.property.mode) {
      case "translate":
      case "scale":
        switch (this.property.axis) {
          case "X":
            _alignVector.copy(this.property.eye).cross(_v1);
            _dirVector.copy(_v1).cross(_alignVector);
            break;
          case "Y":
            _alignVector.copy(this.property.eye).cross(_v2);
            _dirVector.copy(_alignVector).cross(_v2);
            break;
          case "Z":
            _alignVector.copy(this.property.eye).cross(_v3);
            _dirVector.copy(_v3).cross(_alignVector);
            break;
        }
        break;
      case "rotate":
      default:
        _dirVector.set(0, 0, 0);
    }

    // 平面始终平行屏幕
    // this.quaternion.copy(this.property.cameraQuaternion);

    /*{
      // 绕x轴转
      {
        const quax = new Quaternion();
        quax.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 4);
        this.quaternion.copy(quax);
      }
      // 绕y轴转
      {
        const quay = new Quaternion();
        quay.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
        this.quaternion.copy(quay);
      }
      // 绕z轴转
      {
        // 平面默认垂直地板，面向屏幕
        // 先旋转到水平，再绕y轴旋转 ？  这个还要再看看
        const qua = new Quaternion();
        qua.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
        const qua2 = new Quaternion();
        qua2.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
        qua.multiply(qua2);
        this.quaternion.copy(qua);
      }
    } */
    if (_dirVector.length() === 0) {
      // this.quaternion.copy(this.cameraQuaternion);
    } else {
      _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector);
      this.quaternion.setFromRotationMatrix(_tempMatrix);
    }

    super.updateMatrixWorld(force);
  }
}

export {
  TransformControls,
  TransformControlsGizmo,
  TransformControlsPlane,
  Property,
};
