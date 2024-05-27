// ColoredPoint.js (c) 2012 matsuda
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

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
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
      gl_FragColor = texture2D(u_Sampler2, v_UV); // use texture2
    } else if(u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV); // use texture3
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

// global variables
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
let camera;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  // Get the storage location of a_Position
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


  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log("failed to get the storage loc of u_ModelMatrix");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log("failed to get the storage loc of u_ProjectionMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log("failed to get the storage loc of u_ViewMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log("failed to get the storage loc of u_GlobalRotateMatrix");
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('failed to get u_Sampler0 location');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('failed to get u_Sampler1 location');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('failed to get u_Sampler2 location');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3) {
    console.log('failed to get u_Sampler3 location');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log('failed to get u_Texture location');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// globals related to UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType = POINT;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_globalAngle = 180;
let g_yellowAnimation=false;
let g_magentaAnimation=false;
let dragging = false;
let g_x = 0;
let g_yAngle = 0;
let g_zAngle = 0;
let g_animation = false;
let appleSwitch = false;

// head angle
let g_headAngle = 0;
let g_leftArmJoint1 = 0;
let g_leftArmJoint2 = 0;
let g_rightArmJoint1 = 0;
let g_rightArmJoint2 = 0;
let g_leftFootAngle = 0;
let g_rightFootAngle = 0;
let g_leftEarAngle = 0;
let g_rightEarAngle = 0;

var redColor = [1.0,0.0,0.0,1.0];
var greenColor = [0.0,1.0,0.0,1.0];

// set up actions for HTML UI elements
function addActionsForHtmlUI(){

}

function initTextures(){
  var image = new Image();
  if(!image){
    console.log('failed to create image obj');
    return false;
  }
  image.onload = function() {sendImageToTEXTURE0(image) };
  image.src = "src/palmleaf.jpg";

  var imageSky = new Image();
  if(!imageSky){
    console.log('failed to create image obj');
    return false;
  }
  imageSky.onload = function() {sendImageToTEXTURE1(imageSky) };
  imageSky.src = "src/sky.jpg";

  var imageLeaf = new Image();
  if(!imageLeaf){
    console.log('failed to create image obj');
    return false;
  }
  imageLeaf.onload = function() {sendImageToTEXTURE2(imageLeaf) };
  imageLeaf.src = "src/seaweed.jpg";

  var imageLog = new Image();
  if(!imageLog){
    console.log('failed to create image obj');
    return false;
  }
  imageLog.onload = function() {sendImageToTEXTURE3(imageLog) };
  imageLog.src = "src/rice.png";
  
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
  console.log('finished loadTexture1');
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
  console.log('finished loadTexture2');
}

function sendImageToTEXTURE3(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);
  console.log('finished loadTexture3');
}


function main() {

  // set up canvas and gl variables
  setUpWebGL();
  // set up glsl shaders programs and connect glsl variables
  connectVariablesToGLSL();

  // set up actions for HTML UI elements
  addActionsForHtmlUI(); 

  camera = new Camera();

  document.onkeydown = keydown;

  initTextures();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function (e) {
    dragging = true;
    let [x,y] = convertCoordinatesEventToGL(e);
    g_lastX = x;
    g_lastY = y;
  }
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if(g_animation == true){
      g_headAngle = (5*Math.sin(g_seconds));
      g_leftArmJoint1 = (5*Math.sin(g_seconds));
      g_leftArmJoint2 = (5*Math.sin(g_seconds));
      g_rightArmJoint1 = (5*Math.sin(g_seconds));
      g_rightArmJoint2 = (5*Math.sin(g_seconds));
      g_leftFootAngle = (5*Math.sin(g_seconds));
      g_rightFootAngle = (5*Math.sin(g_seconds));
      g_leftEarAngle = (2*Math.sin(g_seconds));
      g_rightEarAngle = (2*Math.sin(g_seconds));
  }
}

// https://www.toptal.com/developers/keycode
function keydown(ev){
  console.log(ev.keyCode);
  if( ev.keyCode == 68){ // d key
    camera.moveRightD();
  }
  if( ev.keyCode == 65){// A key
    camera.moveLeftA();
  }
  if( ev.keyCode == 87){ //w key
    camera.moveForwardW();
  }
  if(ev.keyCode == 83){ // s key
    camera.moveBackwardS();
  }
  if (ev.keyCode==81){ // Q
    camera.rotateLeft();
  }
  if (ev.keyCode==69){ // E
    camera.rotateRight(); 
  }
  // if (ev.keyCode == 82){
  //   GlobalCamera.flyUp();
  // }
  // if (ev.keyCode == 70){
  //   GlobalCamera.flyDown();
  // }
  renderAllShapes();
}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up=[0,1,0];

// right
var g_map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // this tree is next to snorlax 
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // north
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,3,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

                    // left

function drawMap() {
  for(x=0;x<=32;x++) {
    for(y=0;y<=32;y++) {
      // console.log(x,y);
      if(g_map[x][y] == 1) {
        var shrubs = new Cube();
        shrubs.color = [0,1,0,0.5];
        shrubs.textureNum = 0;
        shrubs.matrix.translate(0,-0.75,0);
        shrubs.matrix.translate(x-8,0,y-8);
        shrubs.render();
      }
      if(g_map[x][y] == 2) {
        var trunk = new Cube();
        trunk.color = [0,1,0,0.5];
        trunk.textureNum = 3;
        trunk.matrix.translate(0,-0.75,0);
        trunk.matrix.translate(x-8,0,y-8);
        trunk.render();
        var trunk2 = new Cube();
        trunk2.color = [0,1,0,0.5];
        trunk2.textureNum = 3;
        trunk2.matrix.translate(0,0.25,0);
        trunk2.matrix.translate(x-8,0,y-8);
        trunk2.render();
        var leaves = new Cube();
        leaves.color = [0,1,0,0.5];
        leaves.textureNum = 2;
        leaves.matrix.translate(-1,1.25,-1);
        leaves.matrix.translate(x-8,0,y-8);
        leaves.matrix.scale(3,3,3);
        leaves.render();
      }
      if(g_map[x][y] == 3){
        var groundApple = new Cube();
        groundApple.color = [255/255,0/255,0/255,1.0];
        groundApple.matrix.translate(0,-0.75,0);
        groundApple.matrix.translate(x-8,0,y-8);
        groundApple.matrix.scale(0.5,0.5,0.5);
        groundApple.render();
        var gAStem = new Cube();
        var gAStemColor = [165/255,42/255,42/255,1.0];
        gAStem.matrix = new Matrix4(groundApple.matrix);
        gAStem.matrix.rotate(0,0,0,1);
        gAStem.matrix.scale(.25,.5,.25);
        gAStem.matrix.translate(1.5,2,1.25);
        gAStem.color = gAStemColor;
        gAStem.render();
        var gALeaf = new Cone();
        var gaLeafColor = [0/255,255/255,0/255,1.0];
        gALeaf.matrix = new Matrix4(gAStem.matrix);
        gALeaf.matrix.scale(5,5,5);
        gALeaf.matrix.translate(0.4,0.08,0.1);
        gALeaf.matrix.rotate(270,0,1,0);
        gALeaf.color = gaLeafColor;
        gALeaf.render();
        }
        if(g_map[x][y] == 4) {
          var repeatedOnigiri = new Onigiri(x,y);
          repeatedOnigiri.render();
        }
      }
    }
}

// var g_shapesList = [];

function click(ev) {
  
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  if (dragging) {
    var dx = 60 * (x - g_lastX);
    var dy = 60 * (y - g_lastY)

    g_x += dy;
    g_yAngle += dx;
    if (Math.abs(g_globalAngle / 360) > 1){
      g_Xangle = 0;
    }
    if (Math.abs(g_yAngle / 360) > 1){
      g_Yangle = 0;
    }
  
  }
  g_lastX = x;
  g_lastY = y;
 
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}


// draw every shape that is supposed to be in the canvas
function renderAllShapes(){

  // check the time at the start of this function
  var startTime = performance.now();

  camera.renderCamera();

  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  globalRotMat.rotate(g_yAngle, 0 , 1 ,0);
  globalRotMat.rotate(g_zAngle, 0 , 0 ,1);
  globalRotMat.rotate(g_x, 1, 0 ,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawMap();

  drawOnigiri();
  // draw floor 

  var floor = new Cube();
  floor.color = [1.0,0.0,0.0,1.0];
  floor.textureNum=0;
  floor.matrix.translate(7.75,-.75,8);
  floor.matrix.scale(32,0,32);
  floor.matrix.translate(-.475,0,-0.5);
  floor.render();

  // draw the sky 
  var sky = new Cube();
  sky.color = [1.0,0.0,0.0,1.0];
  sky.textureNum = 1;
  sky.matrix.scale(100,100,100);
  sky.matrix.translate(-.275,-.5,-0.25);
  sky.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: "  + Math.floor(10000/duration)/10, "numdot");
  
}

// set the text of an HTML element
function sendTextToHTML(text,htmlID){
  // var htmlElm = document.getElementById(htmlID);
  if(!htmlID) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  // htmlElm.innerHTML = text;
}

drawOnigiri = function(){ 

  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA_SATURATE, gl.SRC_ALPHA_SATURATE);
  
  var rice = new Prism();
  rice.color = [241/255, 244/255, 251/255, 1.0];
  rice.textureNum = 3;
  // rice.matrix.translate(1, 0, 2);
  rice.render();

  var seaweed = new Cube();
  seaweed.color = [0.0, 0.5, 0.0, 1.0];
  seaweed.textureNum = 2;
  seaweed.matrix = rice.matrix;
  seaweed.matrix.scale(.5, .4, .6);
  seaweed.matrix.translate(.45, 0, -.1);
  seaweed.render();
}

console.log('done');