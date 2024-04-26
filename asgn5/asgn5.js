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
        model.position.set(0, 0, 0);
        scene.add(model);
        scene.traverse((obj) => {
            if (obj.castShadow !== undefined) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });

    });
    
    loader.load("./assets/water/scene.gltf", function (waterGltf) {
        const waterModel = waterGltf.scene;
        waterModel.position.set(0, 50, 200);
        scene.add(waterModel);
    });

    loader.load("./assets/bridge/scene.gltf", function (bridgeGltf) {
        const bridgeModel = bridgeGltf.scene;
        bridgeModel.position.set(0, -5.8, 0);

        const scaleFactor = 2.5; // Adjust this value to make the bridge bigger as needed
        bridgeModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // for (const material of Object.values(bridgeGltf.materials)) {
        //     material.side = THREE.DoubleSide;
        // }
        // loader.setMaterials(bridgeGltf);
        // bridgeModel.material.color.setHex(0x000000);
        // add in color

        scene.add(bridgeModel);
    });


    // Lights Setup
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(-250, 800, -850);
    light.target.position.set(-550, 40, -450);
    light.shadow.bias = -0.004;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    light.position.set(-1, 2, 4);

    scene.add(light);
    const cam = light.shadow.camera;
    cam.near = 1;
    cam.far = 2000;
    cam.left = -1500;
    cam.right = 1500;
    cam.top = 1500;
    cam.bottom = -1500;

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
