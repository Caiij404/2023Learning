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
// camera.up.set(0, 0, 1);
camera.position.set(0, 75, 75);
scene.add(camera);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

const axisHelper = new THREE.AxesHelper(50);
axisHelper.position.y += 1;
scene.add(axisHelper);

// 画布网格线
const gridHelper = new THREE.GridHelper(1000, 100, 100);
scene.add(gridHelper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
