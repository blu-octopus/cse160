import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Import GLTFLoader
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


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

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    //spehere geometry
    // randomize the radius, width, and height
    // const sphereRadius = 0.3 + Math.random() * 2;
    // const sphereWidthSegments = 16 + Math.floor(Math.random() * 8);
    // const sphereHeightSegments = 16 + Math.floor(Math.random() * 8);
    // const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments);

    loader.load("./assets/samurai-capy/scene.gltf", function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.rotation.set(0, 190, 0);
        scene.add(model);
        scene.traverse((obj) => {
            if (obj.castShadow !== undefined) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
    });
    
    loader.load("./assets/gate/Sketchfab_Scene.gltf", function (gateGltf) {
        const gateModel = gateGltf.scene;
        gateModel.position.set(12, -3, 0);
        // rotate model
        gateModel.rotation.set(0, 190, 0);
        const scaleFactor = 1; 
        gateModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        scene.add(gateModel);
    });

    loader.load("./assets/bridge/scene.gltf", function (bridgeGltf) {
        const bridgeModel = bridgeGltf.scene;
        bridgeModel.position.set(0, -5.8, 0);

        const scaleFactor = 2.5; // Adjust this value to make the bridge bigger as needed
        bridgeModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        scene.add(bridgeModel);
    });

    loader.load("./assets/water/scene.gltf", function (waterGltf) {
        const waterModel = waterGltf.scene;
        waterModel.position.set(0, 67, 0);
        scene.add(waterModel);
    });

    const txturLoader = new THREE.TextureLoader();
    const cubeTexture = txturLoader.load('./assets/skybox/nightsky.jpeg');

    function makeInstance(geometry, texture, x, y) {
        const material = new THREE.MeshPhongMaterial({  
            map: texture,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cube.position.x = x;
        cube.position.y = y;
        return cube;
    }
    const cubes = [
        makeInstance(geometry, cubeTexture,  12, 0.5),
        // makeInstance(geometry, 0x8844aa, -2),
        // makeInstance(geometry, 0xaa8844,  2),
    ];

    function makeSphere(color, x, y, z) {
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: color.a });
        const sphereRadius = 0.1 + Math.random() * 0.1;
        const sphereWidthSegments = 32 + Math.floor(Math.random() * 8);
        const sphereHeightSegments = 32 + Math.floor(Math.random() * 8);
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments)
        const sphere = new THREE.Mesh(sphereGeometry, material);

        scene.add(sphere);
        sphere.position.x = x;
        sphere.position.y = y;
        sphere.position.z = z;
        return sphere;
    }

    function rgba(r, g, b, a) {
        return new THREE.Color(r / 255, g / 255, b / 255, a);
    }
    // Lights Setup
    const color = 0x9992f7;
    const intensity = 5;
    const ambLight = new THREE.AmbientLight(color, intensity);
    scene.add(ambLight);

    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const skyintensity = 2;
    const skylight = new THREE.HemisphereLight(skyColor, groundColor, skyintensity);

    const spotIntensity = 999;
    const spotColor = 0xFFBB88; 
    const spotLight = new THREE.SpotLight(spotColor, spotIntensity);
    spotLight.position.set(20, 0, 0);
    spotLight.target.position.set(0, 0, 0);
    //rotate light
    spotLight.rotation.set(180, 200, 200);
    spotLight.target.rotation.set(180, 200, 200);
    //make light width smaller
    spotLight.angle = Math.PI / 8;
    spotLight.distance = 40;
    ///make light cast shadow
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 500;
    spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);
    scene.add(spotLight.target);

    // const helper = new THREE.SpotLightHelper(spotLight);
    // scene.add(helper);
    
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(-250, 800, -850);
    light.target.position.set(-550, 40, -450);
    light.shadow.bias = -0.004;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.position.set(-1, 2, 4);
    scene.add(light);

        // randomly generate the position of 20 spheres
    // write a loop to generate 20 spheres, with random positions
    const spheres = [];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 30 - 10;
        const y = Math.random() * 30 - 10;
        const z = Math.random() * 30 - 10;
        spheres.push(makeSphere(rgba(248, 240, 162, 0.1), x, y, z));
        //add spotlight to each sphere
        spotLight.position.set(x, y, z);
        scene.add(spotLight);
        scene.add(spotLight.target);
    }


    class ColorGUIHelper {
        constructor(object, prop) {
          this.object = object;
          this.prop = prop;
        }
        get value() {
          return `#${this.object[this.prop].getHexString()}`;
        }
        set value(hexString) {
          this.object[this.prop].set(hexString);
        }
      }

    function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
    }

    // function updateLight() {
    // light.target.updateMatrixWorld();
    // helper.update();
    // }
    // updateLight();

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01);
    gui.addColor(new ColorGUIHelper(skylight, 'color'), 'value').name('sky ');
    gui.addColor(new ColorGUIHelper(skylight, 'groundColor'), 'value').name('ground ');
    gui.addColor(new ColorGUIHelper(spotLight, 'color'), 'value').name('spotlight');

    // makeXYZGUI(gui, light.position, 'position', updateLight);
    // makeXYZGUI(gui, light.target.position, 'target', updateLight);
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

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
          });
        
        spheres.forEach((sphere, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            sphere.rotation.x = rot;
            sphere.rotation.y = rot;
            });

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        //change spotLight angle
        // spotLight.angle = Math.sin(time) * Math.PI / 8;
        // spotLight.target.position.x = Math.sin(time) * 10;
        // spotLight.target.position.z = Math.cos(time) * 10;
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
