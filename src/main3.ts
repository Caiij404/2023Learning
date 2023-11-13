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

// 初始化渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);
// 轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置阻尼 需要每一帧都update
controls.enableDamping = true;

// const helper = new THREE.CameraHelper(camera);
// scene.add(helper);
const planeGeometry = new THREE.PlaneGeometry(80, 80, 80);
const planeMaterial = new THREE.MeshStandardMaterial({
	color: 0x838b83,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.name = "PLANE";
plane.rotation.x = -Math.PI / 2;
plane.position.set(0, -1.5, 0);
scene.add(plane);

// 立方体
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshBasicMaterial({
	color: 0x7ac5cd,
});
const cubeMaterials = [];
for (let i = 0; i < 6; i++) {
	cubeMaterials.push(
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(Math.random() * 0xffffff),
			visible: true,
			side: THREE.DoubleSide,
			// opacity: 0.5,
			// transparent: true,
		})
	);
}
const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
cube.name = "CUBE";
cube.position.set(0, 2, 0);
// cube.rotation.set(0, Math.PI / 4, 0);
// scene.add(cube);

cube.geometry.computeBoundingBox();
// 旋转管体
const toruskgeo = new THREE.TorusKnotGeometry(1, 0.2, 100, 16);
const toruskmat = new THREE.MeshBasicMaterial({
	color: new THREE.Color(Math.random() * 0xffffff),
});
const torusKnot = new THREE.Mesh(toruskgeo, toruskmat);
torusKnot.position.set(0, 5, 0);
// scene.add(torusKnot);

// 锥体
const gizmoMaterial = new THREE.MeshBasicMaterial({
	depthTest: false,
	depthWrite: false,
	fog: false,
	toneMapped: false,
	transparent: false,
	visible: true,
	color: new THREE.Color(Math.random() * 0xffffff),
});
const arrowGeometry = new THREE.CylinderGeometry(0, 1, 2, 12);
const arrow = new THREE.Mesh(arrowGeometry, gizmoMaterial);
arrow.position.set(0, 2, 0);
arrow.rotation.set(Math.PI / 4, 0, 0);
// scene.add(arrow);
// cube.add(arrow);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const plane2 = new THREE.Mesh(
	new THREE.PlaneGeometry(5, 5),
	new THREE.MeshStandardMaterial()
);

// 组
// const group = new THREE.Group();
// group.add(cube);
// group.add(arrow);
// scene.add(group);
// group.position.set(0, 5, 0);
// // 获取arrow在组内的位置
// console.log(arrow.position);
// // 获取arrow在世界坐标中的位置
// const vtmp = new THREE.Vector3();
// arrow.getWorldPosition(vtmp);
// console.log(vtmp);

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
});

const drag = new Drag(scene, camera);
window.addEventListener("mousedown", (ev) => {
	if (ev.button == 0) drag.getIntersects(ev);
});

const dir = new Dir(camera);
dir.attach(cube);
// dir.detach();
// scene.add(dir);

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);
//坐标辅助器的方向为cube的方向
// cube.add(axesHelper);

const axisHelper = new THREE.AxesHelper(10);
// scene.add(axisHelper);

// 属性面板移动 ------------- Q2
{
	const vx = new THREE.Vector3(1, 0, 0);
	const vy = new THREE.Vector3(0, 1, 0);
	const vz = new THREE.Vector3(0, 0, 1);
	window.addEventListener("mousedown", (ev) => {
		const num = ev.button;
		const mesh = cube;
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
		// console.log(mesh.matrix.decompose);
		vx.set(1, 0, 0).applyQuaternion(qua);
		vy.set(0, 1, 0).applyQuaternion(qua);
		vz.set(0, 0, 1).applyQuaternion(qua);
		mesh.updateMatrix();
		// console.log(mesh.scale);
		// console.log(mesh.matrix);
		// console.log(mesh.quaternion);
		// console.log(qua);
		// const ang = (qua.angleTo(new THREE.Quaternion()) * 180) / Math.PI;
		// console.log(ang);
		// console.log(new THREE.Vector3(0, 1, 0).applyQuaternion(qua));
		// console.log(new THREE.Vector3(0, 1, 0).applyQuaternion(mesh.quaternion));
		// console.log(mesh);
		// console.log(cube.matrix);
		// console.log(dir.qua);
	});

	window.addEventListener("keydown", (ev) => {
		const key = ev.key;
		const mesh = square;
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
		if (key == "p") {
			controls.enabled = !controls.enabled;
		}
	});
}

function render() {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}
render();

const vet1 = new Float32Array([-1, 0, 2, -1, 0, 0, 1, 0, 0]);
const matrial = new THREE.MeshBasicMaterial({
	color: 0x00cdcd,
	side: THREE.DoubleSide,
});
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(vet1, 3));
const triangle = new THREE.Mesh(geometry, matrial);
triangle.position.set(0, 0, 2);
triangle.name = "triangle";

const vet2 = new Float32Array([
	-1, 0, 2, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 2, -1, 0, 2,
]);
const mat2 = matrial.clone();
mat2.color.setHex(0xbdb76b);
const geo2 = new THREE.BufferGeometry();
geo2.setAttribute("position", new THREE.BufferAttribute(vet2, 3));
const square = new THREE.Mesh(geo2, mat2);
square.position.set(0, 3, 0);
scene.add(square);
square.add(triangle);
square.name = "square";
square.rotation.set(0, Math.PI / 4, 0);

const door_dir = new THREE.Vector3();
const tri_worldpos = new THREE.Vector3();
triangle.getWorldPosition(tri_worldpos);
console.log(tri_worldpos);
const center_pos = new THREE.Vector3();
square.getWorldPosition(center_pos);
door_dir.copy(tri_worldpos).sub(center_pos).normalize();
console.log(door_dir);

drawPlane();

function drawPlane() {
	// 直接获取物体包围盒的点，构建平面就可以了
	const vets = new Float32Array([
		-1.0, -1.0, 0, 1.0, -1.0, 0, 1.0, 1.0, 0, 1.0, 1.0, 0, -1.0, 1.0, 0, -1.0,
		-1.0, 0,
	]);
	const vets1 = new Float32Array([
		0, -1.0, 1.0, 0, -1.0, -1.0, 0, 1.0, -1.0, 0, 1.0, -1.0, 0, 1.0, 1.0, 0,
		-1.0, 1.0,
	]);
	const matrial = new THREE.MeshBasicMaterial({
		color: 0x00cdcd,
		side: THREE.DoubleSide,
		opacity: 0.7,
		transparent: true,
		visible: true,
		depthTest: false,
	});
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(vets, 3));
	const plane = new THREE.Mesh(geometry, matrial);
	plane.position.copy(cube.position);
	plane.applyQuaternion(cube.quaternion);
	// scene.add(plane);
}
