import * as THREE from "three";
import { Object3D, Mesh } from "three";
class Dir extends Object3D {
  obj: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
  qua: THREE.Quaternion;
  sca: THREE.Vector3;
  len: number;
  isShow: boolean;
  constructor(camera: THREE.PerspectiveCamera) {
    super();
    this.camera = camera;
    this.obj = new THREE.Object3D();
    this.qua = new THREE.Quaternion();
    this.sca = new THREE.Vector3();
    this.len = 3;
    this.isShow = false;
    const textureLoader = new THREE.TextureLoader();
    const dirMap = textureLoader.load("./imgs/freemove_x.png");
    dirMap.minFilter = 1006;
    dirMap.magFilter = 1006;

    const dirMaterial = new THREE.MeshStandardMaterial({
      map: dirMap,
      side: THREE.DoubleSide,
      transparent: true,
      visible: true,
      depthTest: false,
    });
    const plane = new THREE.PlaneGeometry(0.2, 0.1, 1, 1);

    // 前后
    const matG = dirMaterial.clone();
    matG.color.setHex(0x00ff00);
    const forwardAxis = new Mesh(plane, matG);
    const backwardAxis = new Mesh(plane, matG);

    // 左右
    const matR = dirMaterial.clone();
    matR.color.setHex(0xff0000);
    const leftAxis = new Mesh(plane, matR);
    const rightAxis = new Mesh(plane, matR);

    // 上下
    const matB = dirMaterial.clone();
    matB.color.setHex(0x0000ff);
    const upwardAxis = new Mesh(plane, matB);
    const downwardAxis = new Mesh(plane, matB);

    this.add(forwardAxis);
    this.add(backwardAxis);
    this.add(leftAxis);
    this.add(rightAxis);
    this.add(upwardAxis);
    this.add(downwardAxis);
    for (const i in this.children) {
      this.children[i].visible = false;
    }
  }

  attach(object: THREE.Object3D<THREE.Event>): this {
    this.obj = object;
    return this;
  }
  detach(): void {
    this.obj = undefined!;
  }
  setVisual(flag: boolean) {
    this.isShow = flag;
    for (const i in this.children) {
      this.children[i].visible = flag;
    }
  }

  updateMatrixWorld(force?: boolean | undefined): void {
    if (this.obj) {
      this.obj.updateMatrixWorld();
      this.obj.matrixWorld.decompose(
        this.position,
        // this.quaternion,
        new THREE.Quaternion(),
        // this.qua,
        this.sca
      );
      this.qua.copy(this.obj.quaternion);
      // this.quaternion.copy(this.obj.quaternion);
      this.scale.set(1, 1, 1);

      const factor =
        this.position.distanceTo(this.camera.position) *
        Math.min(
          ((1.9 * Math.tan((Math.PI * this.camera.fov) / 360)) /
            this.camera.zoom,
          7)
        );
      for (const i in this.children) {
        this.children[i].scale.set(1, 1, 1).multiplyScalar(factor / 16);
      }
      this.len = this.children[0].scale.x;
      // this.showDirection(1);
      super.updateMatrixWorld(true);
    }
  }

  showDirection(num: number) {
    // 2d视角只用考虑和空间纵轴垂直的方向
    // 其实就是和地面平行的方向
    // 2d视角的相机和3d的不是同一个
    const v1 = new THREE.Vector3(1, 0, 0).applyQuaternion(this.qua).normalize();
    const v2 = new THREE.Vector3(0, 1, 0).applyQuaternion(this.qua).normalize();
    const v3 = new THREE.Vector3(0, 0, 1).applyQuaternion(this.qua).normalize();

    const eye = new THREE.Vector3()
      .copy(this.camera.position)
      .sub(this.obj.position)
      .normalize();

    const align = new THREE.Vector3();
    const dirvt = new THREE.Vector3();
    const tmpMat = new THREE.Matrix4();
    const orivt = new THREE.Vector3(0, 0, 0);
    switch (num) {
      case 0: {
        // 前
        align.copy(eye).cross(v3);
        dirvt.copy(align).cross(v3);
        tmpMat.lookAt(orivt, dirvt, align);
        this.children[0].quaternion.setFromRotationMatrix(tmpMat);
        this.children[0].position
          .set(0, 0, this.len / 2)
          .applyQuaternion(this.qua);
        this.children[0].visible = true;
        break;
      }
      case 1: {
        // 后
        align.copy(eye).cross(v3);
        dirvt.copy(v3).cross(align);
        tmpMat.lookAt(orivt, dirvt, align);
        this.children[1].quaternion.setFromRotationMatrix(tmpMat);
        this.children[1].position
          .set(0, 0, -this.len / 2)
          .applyQuaternion(this.qua);
        this.children[1].visible = true;
        break;
      }
      case 2: {
        // 左
        align.copy(eye).cross(v1);
        dirvt.copy(v1).cross(align);
        tmpMat.lookAt(orivt, dirvt, align);
        this.children[2].quaternion.setFromRotationMatrix(tmpMat);
        this.children[2].position
          .set(-this.len / 2, 0, 0)
          .applyQuaternion(this.qua);
        this.children[2].visible = true;
        break;
      }
      case 3: {
        // 右
        align.copy(eye).cross(v1);
        dirvt.copy(align).cross(v1);
        tmpMat.lookAt(orivt, dirvt, align);
        this.children[3].quaternion.setFromRotationMatrix(tmpMat);
        this.children[3].position
          .set(this.len / 2, 0, 0)
          .applyQuaternion(this.qua);
        this.children[3].visible = true;
        break;
      }
      case 4: {
        // 上
        align.copy(eye).cross(v2);
        dirvt.copy(align).cross(v2);
        tmpMat.lookAt(orivt, dirvt, align);
        this.children[4].quaternion.setFromRotationMatrix(tmpMat);
        this.children[4].position
          .set(0, this.len / 2.5, 0)
          .applyQuaternion(this.qua);
        this.children[4].visible = true;
        break;
      }
      case 5: {
        // 下
        align.copy(eye).cross(v2);
        dirvt.copy(v2).cross(align);
        tmpMat.lookAt(orivt, dirvt, align);
        this.children[5].quaternion.setFromRotationMatrix(tmpMat);
        this.children[5].position
          .set(0, -this.len / 2.5, 0)
          .applyQuaternion(this.qua);
        this.children[5].visible = true;
        break;
      }
      default:
        break;
    }
  }
}

export { Dir };
