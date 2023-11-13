import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

// 物体高亮
function Composer(
	_renderer: THREE.WebGLRenderer,
	_scene: THREE.Scene,
	_camera: THREE.PerspectiveCamera
) {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	const composer = new EffectComposer(_renderer);
	const renderPass = new RenderPass(_scene, _camera);
	composer.addPass(renderPass);
	const outlinePass = new OutlinePass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		_scene,
		_camera
	);
	composer.addPass(outlinePass);
	outlinePass.edgeStrength = 4;
	outlinePass.edgeGlow = 0;
	outlinePass.edgeThickness = 0.6;
	outlinePass.pulsePeriod = 0;
	outlinePass.visibleEdgeColor.set(0x44f9ff);
	outlinePass.hiddenEdgeColor.set(0x0000);

	function onMouseClick(event: any) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, _camera);
		const selectObjs = raycaster.intersectObjects(_scene.children);
		if (selectObjs.length > 0) {
			let flag = false;
			selectObjs.forEach((item) => {
				if (item.object.name === "CUBE") {
					outlinePass.selectedObjects = [item.object];
					flag = true;
				}
				if (!flag) outlinePass.selectedObjects = [];
			});
		}
	}
	window.addEventListener("click", onMouseClick);
	return composer;
}

export { Composer };
