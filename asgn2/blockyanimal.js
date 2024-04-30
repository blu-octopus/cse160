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
let g_bodyAngle = 0;
let g_lastX = 0;
let g_lastY = 0;
let g_x = 0;
let g_yAngle = 0;
let g_zAngle = 0;
let dragging = false;

function addActionsForHtmlUI() {

  document.getElementById('angleSlide').addEventListener('change', function() {
    console.log("angle slider clicked"); 
    g_globalAngle = this.value; 
    renderAllShapes(); 
    // console.log("rendered shape after camera angle")
  });

  document.getElementById('bodySlide').addEventListener('change', function() {
    console.log("body slider clicked"); 
    g_bodyAngle = this.value; 
    renderAllShapes(); 
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

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + "fps: " + Math.floor(1000/duration));
}

function sendTextToHTML(text) {
  var htmlElem = document.querySelector('#fps');
  htmlElem.innerHTML = text;
}

function drawCapybara(){

  // capybara is a square looking rodent that is very cute
  // body color #E6AF88, nose and ears color #C38175, eyes color #974C47
  let bodyColor = [0.9, 0.7, 0.5, 1.0];
  let noseEarsColor = [0.8, 0.5, 0.5, 1.0];
  let eyeslipsColor = [0.6, 0.3, 0.3, 1.0];
  let waterColor = [163/255, 220/255, 237/255, 1];
  let wallColor = [0.5, 0.3, 0.1, 1.0];
  
  var head = new Cube();
  head.color = bodyColor;
  head.matrix.scale(.4, .6, .5);
  head.matrix.translate(0,0, 0 + g_bodyAngle/100);
  head.render();
  head.matrix.scale(10/4, 10/6, 2);

  // var earLeft = new Cube();
  // earLeft.color = noseEarsColor;
  // earLeft.matrix = head.matrix
  // earLeft.matrix.scale(.22, .16, .2);
  // earLeft.matrix.translate(0, 0, 4.8);
  // earLeft.render();
  var earLeft = new Cube();
  earLeft.color = noseEarsColor;
  earLeft.matrix = head.matrix;
  earLeft.matrix.scale(.1, .1, .1);
  earLeft.matrix.translate(0, 0, 4.8);
  earLeft.render();

  var earRight = new Cube();
  earRight.color = noseEarsColor;
  earRight.matrix = earLeft.matrix;
  // earRight.matrix.scale(.1, .1, .1);
  earRight.matrix.translate(3, 0, 0);
  earRight.render();
  //cancel out ear right
  earRight.matrix.translate(-3, 0, -4.8);
  earRight.matrix.scale(10, 10, 10);

  // var nose = new Cube();
  // nose.color = noseEarsColor;
  // nose.matrix = head.matrix;
  // nose.matrix.scale(4, 1, 5);
  // nose.matrix.translate(-.75, 5.9, -0.95);
  // nose.render();
  var nose = new Cube();
  nose.color = noseEarsColor;
  nose.matrix = head.matrix;
  nose.matrix.scale(.4, 0.1, .5);
  nose.matrix.translate(0, 6, 0);
  nose.render();
  // cancel out nose
  nose.matrix.translate(0, -6, 0);
  nose.matrix.scale(10/4, 10/1, 2);

  var eye1 = new Cube();
  eye1.color = eyeslipsColor;
  eye1.matrix = head.matrix;
  eye1.matrix.scale(.01, .1, .1);
  eye1.matrix.translate(-1, 2, 3);
  eye1.render();
  //cancel out  eye1
  eye1.matrix.translate(1, -2, -3);

  var eye2 = new Cube();
  eye2.color = eyeslipsColor;
  eye2.matrix = head.matrix;
  eye2.matrix.translate(40, 2, 3);
  eye2.render();
  // cancel out eye2
  eye2.matrix.translate(-40, -2, -3);
  eye2.matrix.scale(100, 10, 10);

  var lip2 = new Cube();
  lip2.color = eyeslipsColor;
  lip2.matrix = head.matrix;
  lip2.matrix.scale(.05, .01, .3);
  lip2.matrix.translate(3.5, 70, 0.2);
  lip2.render();
  // cancel out lip2
  lip2.matrix.translate(-3.5, -70, -0.2);
  lip2.matrix.scale(100/5, 100, 10/3);

  var lip1 = new Cube();
  lip1.color = eyeslipsColor;
  lip1.matrix = head.matrix;
  lip1.matrix.scale(.3, .01, .05);
  lip1.matrix.translate(.2, 70, 7);
  lip1.render();
  // cancel out lip1
  lip1.matrix.translate(-.2, -70, -7);
  lip1.matrix.scale(10/3, 100, 100/5);

  var body = new Cube();
  body.color = bodyColor;
  body.matrix = head.matrix;
  body.matrix.scale(.4, .7, .4);
  body.matrix.translate(0, -.3, -1 );
  body.render();
  // cancel out body
  body.matrix.translate(0, .3, 1);
  body.matrix.scale(10/4, 10/7, 10/4);

  //add a tub underneath body, which is a blue cube surrounded by 5 brown cubes lining the sides
  // write a function to generate 10 rectangles side by side for water, within this current range
  // each rectangle = scale(1, 0.1, .6), translate(-0.3, -30 + i*0.1, -1.2), color = waterColor
  // var water = new Cube();
  // water.color = waterColor;
  // water.matrix.scale(1, 1, .6);
  // water.matrix.translate(-0.3, -0.3, -1.2);
  // water.render();
  for (var i = 0; i < 10; i++){
    var water = new Cube();
    water.color = waterColor;
    water.matrix.scale(1, 0.1, .6);
    water.matrix.translate(-0.3, i + -3, -1.2);
    water.render();
  }

  //add walls now
  var wallLeft = new Cube();
  wallLeft.color = wallColor;
  wallLeft.matrix.scale(.1, 1, .7);
  wallLeft.matrix.translate(-3.96, -0.3, -1.1);
  wallLeft.render();

  var wallRight = new Cube();
  wallRight.color = wallColor;
  wallRight.matrix.scale(.1, 1, .7);
  wallRight.matrix.translate(7.05, -0.3, -1.1);
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
