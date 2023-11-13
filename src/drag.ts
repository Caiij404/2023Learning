import * as THREE from "three";
import { Scene, PerspectiveCamera, Raycaster } from "three";
class Drag {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	valZ: number;
	constructor(scene: Scene, camera: PerspectiveCamera) {
		this.scene = scene;
		this.camera = camera;
		this.valZ = 0;
	}

	createRaycaster(event: MouseEvent): Raycaster {
		const raycaster = new Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = 1 - (event.clientY / window.innerHeight) * 2;
		raycaster.setFromCamera(mouse, this.camera);
		return raycaster;
	}

	getIntersects(event: MouseEvent) {
		const raycaster = this.createRaycaster(event);
		const intersects = raycaster.intersectObjects(this.scene.children);
		return intersects;
	}

	setHeight(obj: THREE.Object3D) {
		if (obj == undefined) return;
		const vt = new THREE.Vector3();
		obj.getWorldPosition(vt);
		this.valZ = vt.y;
	}
	getPos(event: MouseEvent) {
		const pos = new THREE.Vector3();
		const raycaster = this.createRaycaster(event);
		const rayVec = raycaster.ray.direction.clone().normalize();
		const cosA = new THREE.Vector3(0, -1, 0).dot(rayVec);
		const height = this.camera.position.y - this.valZ;
		const rayLen = height / cosA;
		pos.copy(this.camera.position);
		pos.add(rayVec.multiplyScalar(rayLen));
		return pos;
	}
}

export { Drag };
