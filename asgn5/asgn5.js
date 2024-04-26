import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Import GLTFLoader


function main() {
    // Canvas and Renderer Setup
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    // Camera Setup
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Scene Setup
    const scene = new THREE.Scene();

    // Lights Setup
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // Loading Manager
    const loadManager = new THREE.LoadingManager();

    // Texture Loader
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
       
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
       
        cube.position.x = x;
       
        return cube;
    }
    const cubes = [
        makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844,  2),
    ];

    loader.load('./lib/image.png', (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubes.push(cube);  // add to our list of cubes to rotate
    });

    // Geometry and Materials
    const materials = [
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower1.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower2.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower3.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower4.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower5.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower6.png')}),
    ];
        
    // Load Color Texture Function
    function loadColorTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    // Load Mesh with Color Textures
    loadManager.onLoad = () => {
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cubes.push(cube); // add to our list of cubes to rotate
    };

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

    // Render Function
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    // Start Rendering
    requestAnimationFrame(render);
}

// Start Main Function
main();
