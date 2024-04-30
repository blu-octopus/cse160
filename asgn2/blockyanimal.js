// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
// var ducked = false;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log("failed to get the storage loc of u_GlobalRotateMatrix");
    return;
  }

  //set the initial value for the model matrix to the identity matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

//global related UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The color selected from the color dialog box
let g_selectedSize = 10; // The size of the point
let g_selectedType = "point"; // The type of the shape   
let g_globalAngle = 0;
let g_lastX = 0;
let g_lastY = 0;
let g_x = 0;
let g_yAngle = 0;
let g_zAngle = 0;
let dragging = false;

function addActionsForHtmlUI() {

  document.getElementById('angleSlide').addEventListener('change', function() {
    console.log("angle clicked"); 
    g_globalAngle = this.value; 
    renderAllShapes(); 
    console.log("rendered shape after camera angle")
  });

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
    // renderAllShapes();
  };
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(153/255, 210/255, 227/255, 1);
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
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
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x,y];

}

function renderAllShapes(){
  var startTime = performance.now();

  var globalRotMat= new Matrix4().rotate(g_globalAngle,0,1,0);
  globalRotMat.rotate(g_yAngle, 0 , 1 ,0);
  globalRotMat.rotate(g_zAngle, 0 , 0 ,1);
  globalRotMat.rotate(g_x, 1, 0 ,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawCapybara();

  // var leftArm = new Cube();
  // leftArm.color = [1.0, 1.0, 0.0, 1.0];
  // leftArm.matrix.translate(0, -0.5, 0.0);
  // leftArm.matrix.rotate(0, 0, 0, 1);
  // leftArm.matrix.scale(0.25, 0.7, 0.5);
  // leftArm.matrix.translate(-0.5, 0.0, 0.0);
  // leftArm.render();

  // var rightArm = new Cube();
  // rightArm.color = [1.0, 0.0, 1.0, 1.0];
  // rightArm.matrix.translate(-.1, .1, 0.0);
  // rightArm.matrix.rotate(-30, 1, 0, 0);
  // rightArm.matrix.scale(.2, .4, .2);
  // rightArm.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + "fps: " + Math.floor(1000/duration));
}

function sendTextToHTML(text) {
  var htmlElem = document.querySelector('#fps');
  htmlElem.innerHTML = text;
}

function drawCapybara(){

  // capybara is a square looking rodent that is very cute
  // body color #E6AF88
  // nose and ears color #C38175
  // eyes color #974C47
  let bodyColor = [0.9, 0.7, 0.5, 1.0];
  let noseEarsColor = [0.8, 0.5, 0.5, 1.0];
  let eyeslipsColor = [0.6, 0.3, 0.3, 1.0];
  let waterColor = [163/255, 220/255, 237/255, 1];
  let wallColor = [0.5, 0.3, 0.1, 1.0];
  
  var head = new Cube();
  head.color = bodyColor;
  head.matrix.scale(.4, .6, .5);
  head.matrix.translate(0,0,0);
  head.render();

  var ear1 = new Cube();
  ear1.color = noseEarsColor;
  ear1.matrix.scale(.1, .1, .1);
  ear1.matrix.translate(0, 0, 4.8);
  ear1.render();

  var ear2 = new Cube();
  ear2.color = noseEarsColor;
  ear2.matrix.scale(.1, .1, .1);
  ear2.matrix.translate(3, 0, 4.8);
  ear2.render();

  var nose = new Cube();
  nose.color = noseEarsColor;
  nose.matrix.scale(.4, 0.1, .5);
  nose.matrix.translate(0, 6, 0);
  nose.render();

  var eye1 = new Cube();
  eye1.color = eyeslipsColor;
  eye1.matrix.scale(.01, .1, .1);
  eye1.matrix.translate(-1, 2, 3);
  eye1.render();

  var eye2 = new Cube();
  eye2.color = eyeslipsColor;
  eye2.matrix.scale(.01, .1, .1);
  eye2.matrix.translate(40, 2, 3);
  eye2.render();

  var lip2 = new Cube();
  lip2.color = eyeslipsColor;
  lip2.matrix.scale(.05, .01, .3);
  lip2.matrix.translate(3.5, 70, 0.2);
  lip2.render();

  var lip1 = new Cube();
  lip1.color = eyeslipsColor;
  lip1.matrix.scale(.3, .01, .05);
  lip1.matrix.translate(.2, 70, 7);
  // lip1.matrix.rotate(1, 0, 0, 1);
  lip1.render();

  // var lip2 = new Cube();
  // lip2.color = eyeslipsColor;
  // lip2.matrix.scale(.05, .01, .2);
  // lip2.matrix.translate(3.5, 70, .8);
  // lip2.render();

  // var lip1 = new Cube();
  // lip1.color = eyeslipsColor;
  // lip1.matrix.rotate(20, .2, 70, 7);
  // lip1.matrix.scale(.15, .01, .05);
  // lip1.matrix.translate(-.4, 70, 7);
  // lip1.render();

  var body = new Cube();
  body.color = bodyColor;
  body.matrix.scale(.4, .6, .2);
  body.matrix.translate(0, -.2, -1);
  body.render();

  //add a tub underneath body, which is a blue cube surrounded by 5 brown cubes lining the sides
  var water = new Cube();
  water.color = waterColor;
  water.matrix.scale(1, 1, .6);
  water.matrix.translate(-0.3, -0.3, -1.2);
  water.render();
  //add walls now
  var wallLeft = new Cube();
  wallLeft.color = wallColor;
  wallLeft.matrix.scale(.1, 1, .7);
  wallLeft.matrix.translate(-4, -0.3, -1.1);
  wallLeft.render();

  var wallRight = new Cube();
  wallRight.color = wallColor;
  wallRight.matrix.scale(.1, 1, .7);
  wallRight.matrix.translate(7, -0.3, -1.1);
  wallRight.render();

  var wallBack = new Cube();
  wallBack.color = wallColor;
  wallBack.matrix.scale(1.2, .1, .7);
  wallBack.matrix.translate(-.33, -4, -1.1);
  wallBack.render();

  var wallFront = new Cube();
  wallFront.color = wallColor;
  wallFront.matrix.scale(1.2, .1, .7);
  wallFront.matrix.translate(-.33, 7, -1.1);
  wallFront.render();

  var wallBottom = new Cube();
  wallBottom.color = wallColor;
  wallBottom.matrix.scale(1.2, 1.2, .1);
  wallBottom.matrix.translate(-.33, -0.33, -8);
  wallBottom.render();


}
