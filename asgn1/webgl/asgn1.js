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
var ducked = false;

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
    document.getElementById('clear').onclick = function() { 
        g_shapesList = []; 
        ducked = false; 
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT); 
        renderAllShapes();}
    ;

    //type button
    document.getElementById('triButton').onclick = function() {g_selectedType = "triangle";};
    document.getElementById('pointButton').onclick = function() { g_selectedType = "point";};
    document.getElementById('circleButton').onclick = function() { g_selectedType = "circle";};
    document.getElementById('duckyButton').onclick = function() { ducked = true; console.log("ducky mode activated!"); drawDucky();};
    

    //sliders
    // document.getElementById('redSlide').addEventListener = ('mouseup', function() { g_selectedColor[0] = this.value/100; });
    // document.getElementById('greenSlide').addEventListener = ('mouseup', function() { g_selectedColor[1] = this.value/100; });
    // document.getElementById('blueSlide').addEventListener = ('mouseup', function() { g_selectedColor[2] = this.value/100; });
    const r = document.querySelector('#redSlide');
    r.addEventListener('change', () => {
        g_selectedColor = [r.value/100, g.value/100, b.value/100, 1.0];
        slider.style.setProperty("redSlide", "#ffff00");
    });
    const g = document.querySelector('#greenSlide');
    g.addEventListener('change', () => {
        g_selectedColor = [r.value/100, g.value/100, b.value/100, 1.0];
        slider.style.setProperty("greenSlide", green);
    });
    const b = document.querySelector('#blueSlide');
    b.addEventListener('change', () => {
        g_selectedColor = [r.value/100, g.value/100, b.value/100, 1.0];
        slider.style.setProperty("blueSlide", blue);
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

  if(ducked){
    drawDucky();
  }
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
}
}

function drawDucky(){
    //make canvas blue
    gl.clearColor(157/255, 208/255, 241/255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //draw grass on bottom, a rectangle of green
    gl.uniform4f(u_FragColor, 159/255, 244/255, 142/255 , 1.0);
    drawTriangle([-1.0, -0.7, 1.0, -0.7, 1.0, -1.0]);
    drawTriangle([-1.0, -0.7, -1.0, -1.0, 1.0, -1.0]);
    //draw head using triangle
    //head is yellow, a half dome shaped made up of triangles
    gl.uniform4f(u_FragColor, 247/255, 1, 177/255, 1.0);
    var delta = 0.4;
    let angleStep = 360/10;
    let centerPt = [0.0,-0.3];
    for(let angle = 0; angle < 180; angle += angleStep) {
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle( [centerPt[0],centerPt[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
    }
    //draw yellow body using triangle to make rectangle, where width is width of the delta*2, and height is delta
    //yellow body is on top of grass
    gl.uniform4f(u_FragColor, 247/255, 1, 177/255, 1.0);
    drawTriangle([-0.4, -0.7, 0.4, -0.7, 0.4, -0.3]);
    drawTriangle([-0.4, -0.7, -0.4, -0.3, 0.4, -0.3]);
    //draw eyes using triangle
    //eyes are black, two circles
    gl.uniform4f(u_FragColor, 0, 0, 0, 1.0);
    delta = 0.03;
    angleStep = 360/20;
    centerPt = [-0.22,-0.14];
    for(let angle = 0; angle < 360; angle += angleStep) {
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle( [centerPt[0],centerPt[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
    }
    centerPt = [0.18,-0.14];
    for(let angle = 0; angle < 360; angle += angleStep) {
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle( [centerPt[0],centerPt[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
    }
    //draw beak using triangle
    //beak is orange, a rectangle laying on it's side, in between the eyes
    gl.uniform4f(u_FragColor, 1, 217/255, 153/255, 1.0);
    drawTriangle([-0.12, -0.18, 0.08, -0.18, 0.08, -0.23]);
    drawTriangle([-0.12, -0.18, -0.12, -0.23, 0.08, -0.23]);
    //draw feet using triangle
    //feet are orange, two rectangles laying on their side, at the bottom of the body
    gl.uniform4f(u_FragColor, 1, 217/255, 153/255, 1.0);
    // left foot
    drawTriangle([-0.45, -0.6, -0.3, -0.6, -0.3, -0.7]);
    drawTriangle([-0.45, -0.6, -0.45, -0.7, -0.3, -0.7]);
    // right foot
    drawTriangle([0.2, -0.7, 0.05, -0.7, 0.05, -0.6]);
    drawTriangle([0.2, -0.7, 0.2, -0.6, 0.05, -0.6]);
    //draw right wing using triangle
    //right wing is yellow, a triangle on the right side of the body
    gl.uniform4f(u_FragColor, 247/255, 1, 177/255, 1.0);
    drawTriangle([0.4, -0.3, 0.5, -0.3, 0.4, -0.5]);
    //draw left wing using triangle
    //left wing is yellow, a triangle on the left side of the body
    gl.uniform4f(u_FragColor, 247/255, 1, 177/255, 1.0);
    drawTriangle([-0.4, -0.3, -0.5, -0.3, -0.4, -0.5]);

    //add clouds 
    //clouds are white, three circles
    gl.uniform4f(u_FragColor, 1, 1, 1, 1.0);
    delta = 0.2;
    angleStep = 360/7;
    centerPt = [-0.6,0.5];
    for(let angle = 0; angle < 360; angle += angleStep) {
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle( [centerPt[0],centerPt[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
    }
    //center
    delta = 0.3;
    centerPt = [-0.4,0.5];
    for(let angle = 0; angle < 360; angle += angleStep) {
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle( [centerPt[0],centerPt[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
    }
    delta = 0.18;
    centerPt = [-0.1,0.5];
    for(let angle = 0; angle < 360; angle += angleStep) {
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        drawTriangle( [centerPt[0],centerPt[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
    }


}