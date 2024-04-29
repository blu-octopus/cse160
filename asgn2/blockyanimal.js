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

function addActionsForHtmlUI() {

  document.getElementById('angleSlide').addEventListener('change', function() {
    console.log("angle clicked"); 
    g_globalAngle = this.value; 
    renderAllShapes(); 
    console.log("rendered shape after camera angle")
  });


    //clear button
    document.getElementById('clear').onclick = function() { 
        g_shapesList = []; 
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT); 
        // ducked = false; 
        renderAllShapes();}
    ;

    //type button
    document.getElementById('triButton').onclick = function() {g_selectedType = "triangle";};
    document.getElementById('pointButton').onclick = function() { g_selectedType = "point";};
    document.getElementById('circleButton').onclick = function() { g_selectedType = "circle";};
    // document.getElementById('duckyButton').onclick = function() { 
    //     ducked = true; 
    //     console.log("ducky mode activated!");
    //     g_shapesList = [];  
    //     gl.clearColor(0, 0, 0, 1.0);        
    //     gl.clear(gl.COLOR_BUFFER_BIT); 
    //     renderAllShapes()
    //     drawDucky();
    // };

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
    // const s = document.querySelector('#sizeSlide');
    // s.addEventListener('change', () => {
    //     g_selectedSize = s.value;
    // });

    //segment slider
    // const segmentSlider = document.getElementById('segmentSlide');
    // const segmentValue = document.getElementById('segmentValue');
    // segmentValue.textContent = segmentSlider.value; // Set initial value
    // segmentSlider.addEventListener('input', function() {
    //     segmentValue.textContent = segmentSlider.value; // Update value as slider changes
    //     g_selectedSegments = parseInt(segmentSlider.value);
    // });

    // Add event listener to the mouseup event on the document
    // document.addEventListener('mouseup', function(event) {
    //     // Check if the mouse button was clicked (event.button === 0 means left mouse button)
    //     if (event.button === 0) {
    //         // Call the playQuack function to play the quack sound
    //         playQuack();
    //     }
    // });
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
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  gl.clear(gl.COLOR_BUFFER_BIT);

  // if(ducked){
  //   drawDucky();
  // }
  // var len = g_shapesList.length;
  // for(var i = 0; i < len; i++) {
  //   g_shapesList[i].render();
  // }

  drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0] );

  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.5, 0.0);
  body.matrix.scale(0.5, 1.0, .5);
  body.render();

  var leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 0.0, 1.0];
  leftArm.matrix.translate(0.7, 0.0, 0.0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + "fps: " + Math.floor(1000/duration));
}

function sendTextToHTML(text) {
  var htmlElem = document.querySelector('#fps');
  htmlElem.innerHTML = text;
}
