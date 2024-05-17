// ColoredPoints.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`
// passing a_UV (a JS var vector shader) into a varying var v_UV (var for fragment shader)

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; // use color
    } else if(u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0); // use uv debug color
    } else if(u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // use texture0
    } else if(u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // use texture1
    } else if(u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // use texture1
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor; 
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas); // adding a flag to this

  gl = canvas.getContext("webgl", { preserverDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // all variables that connect ot GLSL:

  // Initialize shaders
  // "this compiles and installs our shader programs"
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  // a_Position and u_FragColor sets up the variables that we'll pass in
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrx');
    return;
  }

	// Get the storage location of u_GlobalRotateMatrix
	u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
	if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  } 
  
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

//global related UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The color selected from the color dialog box
  
let g_globalAngle = 0;
let g_bodyAngle = 0;
let g_headAngle = 0;
let g_earAngle = 0;
let g_waterAngle = 0;

let g_lastX = 0;
let g_lastY = 0;
let g_x = 0;
let g_yAngle = 0;
let g_zAngle = 0;
let dragging = false;
let animation = false;
let onigiri = false;
// let orangeClicked = false;
// let orangeCount = 0;

function addActionsForHtmlUI() {

  // Button to turn animation on and off
  document.getElementById('onBtn').onclick = function() {
    console.log("animate on button clicked");
    animation = true;
  };

  document.getElementById('offBtn').onclick = function() {
    console.log("animate off button clicked");
    animation = false;
  };

  document.getElementById('angleSlide').addEventListener('change', function() {
    console.log("angle slider clicked"); 
    g_globalAngle = this.value + 180; 
    renderAllShapes(); 
  });

  document.getElementById('bodySlide').addEventListener('change', function() {
    console.log("body slider clicked"); 
    g_bodyAngle = this.value; 
    renderAllShapes(); 
  });

  document.getElementById('headSlide').addEventListener('change', function() {
    console.log("head slider clicked"); 
    g_headAngle = this.value; 
    renderAllShapes(); 
  });

  document.getElementById('earSlide').addEventListener('change', function() {
    console.log("ear slider clicked"); 
    g_earAngle = this.value; 
    renderAllShapes(); 
  });

  document.getElementById('waterSlide').addEventListener('change', function() {
    console.log("water slider clicked"); 
    g_waterAngle = this.value; 
    renderAllShapes(); 
  });
  
}

function initTextures(){
  var image = new Image();
  if(!image){
    console.log('failed to create image obj');
    return false;
  }
  image.onload = function() {sendImageToTEXTURE0(image) };
  image.src = "./src/rice.png";

  var imageStone = new Image();
  if(!imageStone){
    console.log('failed to create image obj');
    return false;
  }
  imageStone.onload = function() {sendImageToTEXTURE1(imageStone) };
  imageStone.src = "./src/stone.jpg";

  var imageSky = new Image();
  if(!imageSky){
    console.log('failed to create image obj');
    return false;
  }
  imageSky.onload = function() {sendImageToTEXTURE2(imageSky) };
  imageSky.src = "./src/sky.jpg";
  
  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished loadTexture');
}

function sendImageToTEXTURE2(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);
  console.log('finished loadTexture');
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function (e) {
    dragging = true;
    let [x,y] = convertCoordinatesEventToGL(e);
    g_lastX = x;
    g_lastY = y;

    if (e.shiftKey){
      onigiri = !onigiri;
      animation = true;
    }
  };
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } };

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(153/255, 210/255, 227/255, 1);

  requestAnimationFrame(tick);  
}
 
function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);
  if (dragging) {
    var dx = 360 * (x - g_lastX);
    var dy = 360 * (y - g_lastY)

    g_x += dy;
    g_yAngle += dx;
    if (Math.abs(g_globalAngle / 360) > 1){
      g_x = 0;
    }
    if (Math.abs(g_yAngle / 360) > 1){
      g_zAngle = 0;
    }

  }
  g_lastX = x;
  g_lastY = y;
  // renderAllShapes();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  // console.log(g_seconds);

  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if(animation == true){
    console.log("animation is on");
      g_globalAngle = (360*Math.sin(0.005*g_seconds));
      g_bodyAngle = (5*Math.sin(3*g_seconds));
      g_headAngle = (10*Math.sin(g_seconds));
      g_earAngle = (5*Math.sin(20*g_seconds));
      g_waterAngle = (20*Math.sin(g_seconds));
  }
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x,y];

}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up=[0,1,0];

var g_map = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,1],
];

function drawMap() {
  var body = new Cube();
  for(x=0;x<32;x++) {
    for(y=0;y<32;y++) {
      // console.log(x,y);
      if(x < 1 || x == 31 || y == 0 || y == 31) {
        body.color = [0.8,1.0,1.0,1.0];
        body.matrix.translate(0, -.75, 0);
        body.matrix.scale(.4, .4,.4);
        body.matrix.translate(x-16, 0,y-16);
        // body.renderFast();
        body.render();
      }
    }
  }
}

function renderAllShapes() {
  
  // check the time at the start of this function
  var startTime = performance.now();

  // Create the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Create the view matrix for a new camera perspective
  var viewMat = new Matrix4();
  // Set the camera position (eye), the point it looks at (at), and the up direction
  viewMat.setLookAt(3, 3, 6, 0, 0, 0, 0, 1, 0); // Adjusted camera position to zoom in
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Set the global rotation matrix
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawMap();

  // Draw the sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 2;
  sky.matrix.translate(0, 0, 0.0);
  sky.matrix.scale(5, 5, 5);
  sky.render();

  // Draw the floor
  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = 1;
  floor.matrix.scale(5, 0, 5);
  floor.render();

  // drawCapybara();
  drawOnigiri();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration));
}

function sendTextToHTML(text) {
  var htmlElem = document.querySelector('#fps');
  htmlElem.innerHTML = text;
}

//draw a duck function using cubes
function drawDuck(){
  // Create a new matrix for the entire duck transformation
  var duckTransform = new Matrix4();
  duckTransform.rotate(0, 0, 0, 0);
  duckTransform.translate(0, 0, 0); 

  // duck is a bird that is cute
  // body color #E6AF88, beak color #C38175, eyes color #974C47
  let bodyColor = [0.9, 0.7, 0.5, 1.0];
  let beakColor = [0.8, 0.5, 0.5, 1.0];
  let eyesColor = [0.6, 0.3, 0.3, 1.0];

  var head = new Cube();
  head.color = bodyColor;
  head.matrix = new Matrix4(duckTransform);
  head.matrix.scale(.4, .6, .5);
  head.matrix.translate(0, 0, 0);
  head.render();

  var beak = new Cube();
  beak.color = beakColor;
  beak.matrix = new Matrix4(duckTransform);
  beak.matrix.scale(.1, .1, .1);
  beak.matrix.translate(.001, .001, 4.4);
  beak.render();

  var eye1 = new Cube();
  eye1.color = eyesColor;
  eye1.matrix = new Matrix4(duckTransform);
  eye1.matrix.scale(.01, .1, .1);
  eye1.matrix.translate(-1, 2, 3);
  eye1.render();

  var eye2 = new Cube();
  eye2.color = eyesColor;
  eye2.matrix = new Matrix4(duckTransform);
  eye2.matrix.translate(40, 2, 3);
  eye2.render();

}


// function drawCapybara(){
//   // Create a new matrix for the entire capybara transformation
//   var capybaraTransform = new Matrix4();
//   // capybaraTransform.rotate(-90, 1, 0, 0);
//   // capybaraTransform.translate(1, -1, 0); 

//   var bodyTransform = new Matrix4();
//   // bodyTransform.rotate(90, 1, 0, 0);
//   // bodyTransform.translate(1, 1, 0);

//   // capybara is a square looking rodent that is very cute
//   // body color #E6AF88, nose and ears color #C38175, eyes color #974C47
//   let bodyColor = [0.9, 0.7, 0.5, 1.0];
//   let noseEarsColor = [0.8, 0.5, 0.5, 1.0];
//   let eyeslipsColor = [0.6, 0.3, 0.3, 1.0];
//   let waterColor = [163/255, 220/255, 237/255, 0.5];
//   let wallColor = [180/255, 115/255, 65/255, 1.0];

//   var head = new Cube();
//   head.color = bodyColor;
//   // head.textureNum = -1;
//   head.matrix = new Matrix4(capybaraTransform);
//   head.matrix.scale(.4, .6, .5);
//   head.matrix.translate(0, 0, 0 + g_bodyAngle/100);
//   head.matrix.rotate(g_headAngle, 0, 0, 1);
//   head.render();

//   var earLeft = new Cube();
//   earLeft.color = noseEarsColor;
//   earLeft.matrix = new Matrix4(head.matrix);
//   earLeft.matrix.scale(.1, .1, .1);
//   earLeft.matrix.translate(.001, .001, 4.4);
//   earLeft.matrix.rotate(-g_earAngle, 0, 1, 0);
//   earLeft.render();

//   var earRight = new Cube();
//   earRight.color = noseEarsColor;
//   earRight.matrix = new Matrix4(earLeft.matrix);
//   earRight.matrix.translate(2.98, 0, 0);
//   earRight.matrix.rotate(270, 0, 1, 0);
//   earRight.matrix.translate(0, 0, -1);
//   earRight.matrix.rotate(g_earAngle, 0, 1, 0);
//   earRight.render();

//   var nose = new Cube();
//   nose.color = noseEarsColor;
//   nose.matrix = new Matrix4(head.matrix);
//   nose.matrix.scale(.4, 0.1, .5);
//   nose.matrix.translate(0, 6, 0);
//   nose.render();

//   var eye1 = new Cube();
//   eye1.color = eyeslipsColor;
//   eye1.matrix = new Matrix4(head.matrix);
//   eye1.matrix.scale(.01, .1, .1);
//   eye1.matrix.translate(-1, 2, 3);
//   eye1.render();

//   var eye2 = new Cube();
//   eye2.color = eyeslipsColor;
//   eye2.matrix = new Matrix4(head.matrix);
//   eye2.matrix.translate(40, 2, 3);
//   eye2.render();

//   var lip2 = new Cube();
//   lip2.color = eyeslipsColor;
//   lip2.matrix = new Matrix4(head.matrix);
//   lip2.matrix.scale(.05, .01, .3);
//   lip2.matrix.translate(3.5, 70, 0.2);
//   lip2.render();

//   var lip1 = new Cube();
//   lip1.color = eyeslipsColor;
//   lip1.matrix = new Matrix4(head.matrix);
//   lip1.matrix.scale(.3, .01, .05);
//   lip1.matrix.translate(.2, 70, 7);
//   lip1.render();

//   var body = new Cube();
//   body.color = bodyColor;
//   body.matrix = new Matrix4(bodyTransform);
//   body.matrix.scale(.4, .7, .4);
//   body.matrix.translate(0, -.3, -0.99 + g_bodyAngle/100);
//   body.render();

//   for (var i = -5; i < 5; i++){
//     var water = new Cube();
//     water.color = waterColor;
//     water.matrix = new Matrix4(bodyTransform);
//     water.matrix.scale(1, 0.1, .5);
//     water.matrix.translate(-0.3, i + 2, -1.2 + (i * g_waterAngle)/2000);
//     // gl.blendFunc(gl.SRC_ALPHA, gl.SRC_COLOR);
//     water.render();
//   }

  // gl.blendFunc(gl.SRC_ALPHA, gl.CONSTANT_COLOR);

//   var wallLeft = new Cube();
//   wallLeft.color = wallColor;
//   wallLeft.matrix = new Matrix4(bodyTransform);
//   wallLeft.matrix.scale(.1, 1, .7);
//   wallLeft.matrix.translate(-3.96, -0.3, -1.1);
//   wallLeft.render();

//   var wallRight = new Cube();
//   wallRight.color = wallColor;
//   wallRight.matrix = new Matrix4(bodyTransform);
//   wallRight.matrix.scale(.1, 1, .7);
//   wallRight.matrix.translate(7.05, -0.3, -1.1);
//   wallRight.render();

//   var wallBack = new Cube();
//   wallBack.color = wallColor;
//   wallBack.matrix = new Matrix4(bodyTransform);
//   wallBack.matrix.scale(1.2, .1, .7);
//   wallBack.matrix.translate(-.33, -4, -1.1);
//   wallBack.render();

//   var wallFront = new Cube();
//   wallFront.color = wallColor;
//   wallFront.matrix = new Matrix4(bodyTransform);
//   wallFront.matrix.scale(1.2, .1, .7);
//   wallFront.matrix.translate(-.33, 7, -1.1);
//   wallFront.render();
  
//   // orange on head
//   // var orange = new Cube();
//   // orange.color = [1, 0.7, 0.4, 1];
//   // orange.matrix.scale(.15, .15, .15);
//   // orange.matrix.translate(0.85, .5, 3 + g_bodyAngle/100*4);
//   // orange.matrix.rotate(g_headAngle, 0, 0, 1);
//   // orange.render();

//   if(onigiri == true){
//     drawOnigiri();
//   }

// }

drawOnigiri = function(){ 
  // Create a new matrix for the entire onigiri transformation
  var onigiriTransform = new Matrix4();
  // onigiriTransform.matrix.scale(2, 2, 2);

  var rice = new Prism(onigiriTransform);
  rice.color = [241/255, 244/255, 251/255, 1.0];
  rice.textureNum = -1;
  rice.matrix.scale(.25, .25, .25);
  rice.matrix.translate(-1.5, 2, -.3);
  rice.matrix.rotate(90, 1, 0, 0);
  rice.matrix.rotate(70, 0, 1, 0);
  rice.render();

  // add seaweed cube to rice
  var seaweed = new Cube(onigiriTransform);
  seaweed.color = [0.0, 0.5, 0.0, 1.0];
  seaweed.matrix = rice.matrix;
  seaweed.matrix.scale(.5, .5, .6);
  seaweed.matrix.translate(.5, 0, -.1);
  seaweed.render();
}

