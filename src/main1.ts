import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Composer } from "./Composer";
import { TransformControls } from "./Axis";
import { Dir } from "./Dir";
import { Drag } from "./drag";
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcdcdc);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 10);
scene.add(camera);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const planeGeometry = new THREE.PlaneGeometry(80, 80, 80);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x838b83,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.name = "PLANE";
plane.rotation.x = -Math.PI / 2;
plane.position.set(0, -1.5, 0);
scene.add(plane);

const vet1 = new Float32Array([-1, 0, 2, -1, 0, 0, 1, 0, 0]);
const mat1 = new THREE.MeshBasicMaterial({
  color: 0x00cdcd,
  side: THREE.DoubleSide,
});
const geo1 = new THREE.BufferGeometry();
geo1.setAttribute("position", new THREE.BufferAttribute(vet1, 3));
const door_fan = new THREE.Mesh(geo1, mat1);
door_fan.position.set(0, 0, 2);
door_fan.name = "door_fan";

const vet2 = new Float32Array([
  -1, 0, 2, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 2, -1, 0, 2,
]);
const mat2 = mat1.clone();
mat2.color.setHex(0xbdb76b);
const geo2 = new THREE.BufferGeometry();
geo2.setAttribute("position", new THREE.BufferAttribute(vet2, 3));
const door = new THREE.Mesh(geo2, mat2);
door.position.set(0, 3, 0);
door.name = "door";

scene.add(door);
door.add(door_fan);
door.rotation.set(0, Math.PI / 4, 0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

const axisHelper = new THREE.AxesHelper(10);
scene.add(axisHelper);

let mirror_XorZ = "";

// 属性面板移动 ------------- Q2
{
  const vx = new THREE.Vector3(1, 0, 0);
  const vy = new THREE.Vector3(0, 1, 0);
  const vz = new THREE.Vector3(0, 0, 1);
  /*   window.addEventListener("mousedown", (ev) => {
    const num = ev.button;
    const mesh = square;
    if (num == 10) {
      const rx = mesh.rotation.x;
      mesh.rotation.set(
        rx + 10 * (Math.PI / 180),
        mesh.rotation.y,
        mesh.rotation.z
        );
      } else if (num == 11) {
        const ry = mesh.rotation.y;
        mesh.rotation.set(
          mesh.rotation.x,
          ry + 10 * (Math.PI / 180),
          mesh.rotation.z
          );
        } else if (num == 12) {
          const rz = mesh.rotation.z;
      mesh.rotation.set(
        mesh.rotation.x,
        mesh.rotation.y,
        rz + 10 * (Math.PI / 180)
        );
      }
      const qua = mesh.quaternion.clone();
      vx.set(1, 0, 0).applyQuaternion(qua);
    vy.set(0, 1, 0).applyQuaternion(qua);
    vz.set(0, 0, 1).applyQuaternion(qua);
    mesh.updateMatrix();
  }); */

  window.addEventListener("keydown", (ev) => {
    const key = ev.key;
    const mesh = door;
    const pos = mesh.position;
    const len = 0.1;
    const vv = new THREE.Vector3();
    if (key == "w" || key == "W") {
      vv.copy(vy).multiplyScalar(len);
    } else if (key == "s" || key == "S") {
      vv.copy(vy).multiplyScalar(-len);
    } else if (key == "d" || key == "D") {
      vv.copy(vx).multiplyScalar(len);
    } else if (key == "a" || key == "A") {
      vv.copy(vx).multiplyScalar(-len);
    } else if (key == "q" || key == "Q") {
      vv.copy(vz).multiplyScalar(len);
    } else if (key == "e" || key == "E") {
      vv.copy(vz).multiplyScalar(-len);
    }
    pos.add(vv);
    if (key == "x") {
      const x = mesh.scale.x;
      const y = mesh.scale.y;
      const z = mesh.scale.z;
      mesh.scale.set(x, -y, z);
    }
    if (key == "c") {
      const x = mesh.scale.x;
      const y = mesh.scale.y;
      const z = mesh.scale.z;
      mesh.scale.set(-x, y, z);
    }
    if (key == "z") {
      const x = mesh.scale.x;
      const y = mesh.scale.y;
      const z = mesh.scale.z;
      mesh.scale.set(x, y, -z);
    }
    if (key == "r") {
      if (mirror_XorZ == "" || mirror_XorZ == "mirror_Z") {
        mirror_x();
        mirror_XorZ = "mirror_X";
      } else if (mirror_XorZ == "mirror_X") {
        mirror_z();
        mirror_XorZ = "mirror_Z";
      }
    }
  });
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function render() {
  controls.update();
  renderer.render(scene, camera);
  door.updateMatrixWorld(true);
  requestAnimationFrame(render);
}
render();

const drag = new Drag(scene, camera);
let obj: THREE.Object3D = undefined!;
let isChs = false;
const door_dir = new THREE.Vector3();
const door_pos = new THREE.Vector3();
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();

const plane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xcdcd00,
    side: THREE.DoubleSide,
  })
);
plane2.position.set(0, 6, 0);
plane2.rotation.set(Math.PI / 2, 0, 0);
scene.add(plane2);

window.addEventListener("mousedown", (ev) => {
  const intersects = drag.getIntersects(ev);
  if (intersects.length != 0 && intersects[0].object.name == "door_fan") {
    obj = intersects[0].object;
    isChs = true;
    const doorfan_pos = new THREE.Vector3();
    if (obj.parent != undefined) {
      obj.parent.getWorldPosition(door_pos);
      obj.getWorldPosition(doorfan_pos);
      door_dir.copy(doorfan_pos).sub(door_pos).normalize();
      /* door_dir.copy(
        new THREE.Vector3(1, 0, 0).applyQuaternion(door.quaternion)
      ); */
    }
    drag.setHeight(obj);
    v1.copy(drag.getPos(ev)).sub(door_pos).normalize();
    controls.enabled = false;
  } else {
    obj = undefined!;
    isChs = false;
  }
});

window.addEventListener("mousemove", (ev) => {
  if (!isChs || obj === undefined) return;
  let flag = false;
  v2.copy(drag.getPos(ev)).sub(door_pos).normalize();
  const vtcross1 = new THREE.Vector3().copy(door_dir).cross(v1);
  const vtcross2 = new THREE.Vector3().copy(door_dir).cross(v2);
  const vtcross = new THREE.Vector3().copy(vtcross1).dot(vtcross2);
  if (vtcross < 0) {
    flag = true;
    mirror_x();
  }
  const vtdot1 = new THREE.Vector3().copy(door_dir).dot(v1);
  const vtdot2 = new THREE.Vector3().copy(door_dir).dot(v2);
  const vtdot = vtdot1 * vtdot2;
  if (vtdot < 0) {
    flag = true;
    mirror_z();
  }
  if (flag) {
    v1.copy(v2);
  }
});

window.addEventListener("mouseup", (ev) => {
  controls.enabled = true;
  isChs = false;
  obj = undefined!;
});

function mirror_x() {
  console.log("mirror_x");
  const x = door.scale.x;
  const y = door.scale.y;
  const z = door.scale.z;
  door.scale.set(-x, y, z);
}

function mirror_z() {
  console.log("mirror_z");
  const x = door.scale.x;
  const y = door.scale.y;
  const z = door.scale.z;
  door.scale.set(x, y, -z);
}
