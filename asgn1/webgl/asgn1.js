// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

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

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
//   gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
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

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
}

//global related UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The color selected from the color dialog box
let g_selectedSize = 10; // The size of the point
let g_selectedType = "point"; // The type of the shape   

function addActionsForHtmlUI() {

    //clear button
    document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes();};

    //type button
    document.getElementById('triButton').onclick = function() {g_selectedType = "triangle";};
    document.getElementById('pointButton').onclick = function() { g_selectedType = "point";};
    document.getElementById('circleButton').onclick = function() { g_selectedType = "circle";};

    //sliders
    // document.getElementById('redSlide').addEventListener = ('mouseup', function() { g_selectedColor[0] = this.value/100; });
    // document.getElementById('greenSlide').addEventListener = ('mouseup', function() { g_selectedColor[1] = this.value/100; });
    // document.getElementById('blueSlide').addEventListener = ('mouseup', function() { g_selectedColor[2] = this.value/100; });
    const r = document.querySelector('#redSlide');
    r.addEventListener('change', () => {
        g_selectedColor = [r.value/100, g.value/100, b.value/100, 1.0];
    });
    const g = document.querySelector('#greenSlide');
    g.addEventListener('change', () => {
        g_selectedColor = [r.value/100, g.value/100, b.value/100, 1.0];
    });
    const b = document.querySelector('#blueSlide');
    b.addEventListener('change', () => {
        g_selectedColor = [r.value/100, g.value/100, b.value/100, 1.0];
    });

    //size slider
    const s = document.querySelector('#sizeSlide');
    s.addEventListener('change', () => {
        g_selectedSize = s.value;
    });

    //segment slider
    const segmentSlider = document.getElementById('segmentSlide');
    const segmentValue = document.getElementById('segmentValue');
    segmentValue.textContent = segmentSlider.value; // Set initial value
    segmentSlider.addEventListener('input', function() {
        segmentValue.textContent = segmentSlider.value; // Update value as slider changes
        g_selectedSegments = parseInt(segmentSlider.value);
    });
}

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown =  click;
  canvas.onmousemove = function(ev){ if(ev.buttons == 1) {click(ev)} };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];  
var g_shapesList = [];  // The array for the position of a mouse press

function click(ev) {

    let [x,y] = convertCoordinatesEventToGL(ev);

  // Store the coordinates to g_points array
    let point;
    if (g_selectedType == "triangle") {
        point = new Triangle();
    } else if (g_selectedType == "circle") {
        point = new Circle();
        point.segments = document.getElementById("segmentSlide").value;
        changeSegmentValue();
    }else {
        point = new Point();
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
}

function changeSegmentValue(){
    const segmentValue = document.getElementById('segmentValue');
    const segmentSlider = document.getElementById('segmentSlide');
    segmentValue.textContent = segmentSlider.value; // Update value as slider changes
    g_selectedSegments = parseInt(segmentSlider.value);
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
      // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
}
}