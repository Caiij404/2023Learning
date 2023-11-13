import * as THREE from "three";
class Door extends THREE.Object3D {
	door: THREE.Mesh;
	doorfan: THREE.Mesh;
	constructor(scene: THREE.Scene) {
		super();
		const vet1 = new Float32Array([-1, 0, 2, -1, 0, 0, 1, 0, 0]);
		const mat1 = new THREE.MeshBasicMaterial({
			color: 0x00cdcd,
			side: THREE.DoubleSide,
		});
		const geo1 = new THREE.BufferGeometry();
		geo1.setAttribute("position", new THREE.BufferAttribute(vet1, 3));
		this.doorfan = new THREE.Mesh(geo1, mat1);
		this.doorfan.position.set(0, 0, 2);
		this.doorfan.name = "door_fan";

		const vet2 = new Float32Array([
			-1, 0, 2, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 2, -1, 0, 2,
		]);
		const mat2 = mat1.clone();
		mat2.color.setHex(0xbdb76b);
		const geo2 = new THREE.BufferGeometry();
		geo2.setAttribute("position", new THREE.BufferAttribute(vet2, 3));
		this.door = new THREE.Mesh(geo2, mat2);
		this.door.name = "door";
		this.door.add(this.doorfan);
		this.add(this.door);
		scene.add(this.door);
	}
	getDoorPos() {
		const pos = new THREE.Vector3();
		this.door.getWorldPosition(pos);
		return pos;
	}
	getDoorFanPos() {
		const pos = new THREE.Vector3();
		this.doorfan.getWorldPosition(pos);
		return pos;
	}
	getDoorDir() {
		const doorpos = this.getDoorPos();
		const doorfanpos = this.getDoorFanPos();
		return doorfanpos.sub(doorpos).normalize();
	}
	updateMatrixWorld(force?: boolean | undefined): void {
		this.matrixWorld.decompose(
			this.door.position,
			this.door.quaternion,
			this.door.scale
		);
		super.updateMatrixWorld(true);
	}
}

export { Door };
