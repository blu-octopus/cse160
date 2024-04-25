import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 5;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 2;

	const scene = new THREE.Scene();

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

	// const material = new THREE.MeshPhongMaterial( { color: 0x44aa88 } ); // greenish blue
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

    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader();
    loader.load('./lib/image.png', (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubes.push(cube);  // add to our list of cubes to rotate
    });

        
    function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;
	}

    function loadColorTexture( path ) {
        const texture = loader.load( path );
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      }

    const materials = [
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower1.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower2.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower3.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower4.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower5.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('./lib/flower6.png')}),
    ];

    loadManager.onLoad = () => {
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cubes.push(cube);  // add to our list of cubes to rotate
    };
	const cube = new THREE.Mesh( geometry, materials );

    function render(time) {
        time *= 0.001;  // convert time to seconds

		if ( resizeRendererToDisplaySize( renderer ) ) {
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
    // renderer.render( scene, camera );
    requestAnimationFrame(render);
}


main();
// requestAnimationFrame(render);
