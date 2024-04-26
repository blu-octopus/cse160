import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Import GLTFLoader

function main() {
    // Canvas and Renderer Setup
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        alpha: true,
      });
    
    // Camera Setup
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set( 0, 10, 20 );

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    // Scene Setup
    const loader = new GLTFLoader();
    const scene = new THREE.Scene();

    loader.load("./assets/samurai-capy/scene.gltf", function (gltf) {
        const model = gltf.scene;
        scene.add(model);
    });


    // Lights Setup
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const loader2 = new THREE.CubeTextureLoader();
    const texture = loader2.load([
        './assets/skybox/px.png',
        './assets/skybox/nx.png',

        './assets/skybox/py.png',
        './assets/skybox/ny.png',

        './assets/skybox/pz.png',
        './assets/skybox/nz.png',
    ]);
    scene.background = texture;
    // Render Function
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    // Resize Renderer to Display Size
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    // Start Rendering
    requestAnimationFrame(render);
}

// Start Main Function
main();
