// ColoredPoints.js
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    // v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform vec3 u_lightPos;
  uniform vec3 lightPosition;
  uniform vec3 lightDirection;
  uniform float lightInnerCutoff; // cos angle
  uniform float lightOuterCutoff;
  uniform vec3 u_spotLightPos;
  uniform vec3 u_lightColor; 
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4(v_Normal+1.0/2.0, 1.0);

    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;

    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
      
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    
    }else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }

    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r = length(lightVector);

    // N dot L 
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // reflection 
    vec3 R = reflect(-L,N);

    // eye 
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // specular 
    float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

    vec3 diffuse = vec3(gl_FragColor) * nDotL *0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    vec3 spotLightdirection = vec3(0,-1,0);
    vec3 spotLight = normalize(u_spotLightPos - vec3(v_VertPos));
    vec3 lightToPointDirection = -spotLight;
    vec3 spotLightdiffuse = max(0.0, dot(spotLight, normalize(v_Normal))) * vec3(gl_FragColor) * vec3(1.0, 0.0, 1.0);
    float angleToSurface = dot(lightToPointDirection, spotLightdirection);
    float cos = smoothstep(0.0, 20.0, angleToSurface);
    diffuse += spotLightdiffuse;
    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(specular * u_lightColor + diffuse * u_lightColor + ambient, 1.0);
      }
    }

    if(u_lightOn) {
      if(u_whichTexture ==  0) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }
  }`;

// GLSL stuff
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;               
let u_whichTexture;
let u_cameraPos;
let u_lightPos;
let u_lightOn;
let u_spotLightPos;
let u_lightColor;
let camera;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_yellowAngle = 0;
let g_yellowAngle2 = -45;
let g_blueAngle = 0;
let g_globalAngle = 0;
let g_lastX = 0;
let g_lastY = 0;
let g_x = 0;
let g_yAngle = 0;
let g_zAngle = 0;
let dragging = false;

let animation = false;
let SHAPE = 'POINT';
let g_normalOn = true;
let g_lightOn = true;
let g_lightPos=[0,1,-2];
let g_spotlightPos = [0.1, 2, 0.2];
let g_spotlightColor = [255/255, 0/255, 255/255,1];
function setupWebGL() {
  canvas = document.querySelector('#canvas');
  gl = getWebGLContext(canvas);
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('failed to init shaders');
    return;
  }

  // Get the storage location of a_Position variable
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  // Get the storage location of u_FragColor variable
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
  u_lightColor= gl.getUniformLocation(gl.program, 'u_lightColor');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  
  const identityM = new Matrix4();
  // console.log(identityM.elements);
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {

  const image = new Image();
  // image.onload(gl, n, texture, u_Sampler0, image);
  image.onload = function () { sendTextureToGLSL0(image); };
  // image.src = 'Cloudless_blue_sky.jpg';
  image.src = 'twin.jpg'

  const grass = new Image();
  grass.onload = function () { sendTextureToGLSL1(grass); };
  grass.src = 'grass.jpg';

  const wall = new Image();
  wall.onload = function () { sendTextureToGLSL2(wall); };
  wall.src = 'cobblestone.jpg';
}

function sendTextureToGLSL0(image) {
  const texture = gl.createTexture();
  // flip the images y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set up the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set up the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0)
}
function sendTextureToGLSL1(image) {
  const texture = gl.createTexture();
  // flip the images y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set up the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set up the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1)
}
function sendTextureToGLSL2(image) {
  const texture = gl.createTexture();
  // flip the images y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set up the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set up the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2)
}
function keydown(ev) {
  if (ev.keyCode == 68) { // d key
    camera.moveRight();
  }
  if (ev.keyCode == 65) {// A key
    camera.moveLeft();
  }
  if (ev.keyCode == 87) { //w key
    camera.moveForward();
  }
  if (ev.keyCode == 83) { // s key
    camera.moveBackward();
  }
  if (ev.keyCode == 81) { // Q
    camera.panLeft();
  } else if (ev.keyCode == 69) { // E
    camera.panRight();
  }
  renderAllShapes();
}
function main() {
  setupWebGL();
  // Initialize shaders
  connectVariablesToGLSL();
  camera = new Camera();
  document.onkeydown = keydown;
  canvas.onmousedown = function (e) {
    dragging = true;
    let [x, y] = convertCoordsToGL(e);
    g_lastX = x;
    g_lastY = y;
    renderAllShapes();
  };
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };
  addListeners();
  // Register function (event handler) to be called on a mouse press
  // gl.clear(gl.COLOR_BUFFER_BIT);
  initTextures();
  gl.clearColor(0.0, 0.5, 1.0, 1.0);
  renderAllShapes();
  requestAnimationFrame(tick);
}
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  g_lightPos[0] = 3.14 * Math.cos(g_seconds);
  renderAllShapes();
  requestAnimationFrame(tick);
}

function sendTextToHTML(text) {
  var htmlElem = document.querySelector('#fps');
  htmlElem.innerHTML = text;
}

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]
function drawMap() {
  for (let x = 0; x <= 32; x++) {
    for (let y = 0; y <= 32; y++) {
      if (map[x][y] == 1) {
        const wall = new Cube();
        wall.textureNum = 2;
        wall.color = [1, 0, 0, 1];
        wall.matrix.translate(0, -0.75, 0);
        wall.matrix.translate(x - 16, 0, y - 16);
        wall.renderFaster();
      }
    }
  }
  // console.log('finished rendering walls')
}
function renderAllShapes() {
  var startTime = performance.now();
  camera.renderCamera();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawMap();

  const globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_yAngle, 0, 1, 0);
  globalRotMat.rotate(g_zAngle, 0, 0, 1);
  globalRotMat.rotate(g_x, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Ground plane
  const ground = new Cube();
  ground, color = [1, 0, 0, 1];
  ground.textureNum = 1;
  if (g_normalOn) ground.textureNum = -3;
  ground.matrix.translate(0, -.75, 0);
  ground.matrix.scale(32, 0, 32);
  ground.matrix.translate(-.5, 0, -.5);
  ground.renderFaster();
  // Skybox
  const sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum = 0;
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(1000, 1000, 1000);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.renderFaster();

  // HEAD
  const head = new Cube();
  head.color = [1, 140 / 255, 0, 1];
  if (g_normalOn) head.textureNum = -3;
  head.matrix.translate(-0.175, 0.1, -.75);
  head.matrix.rotate(animation ? 5 * Math.sin(g_seconds) : g_yellowAngle, 0, 0, 1);
  head.matrix.scale(0.35, 0.35, 0.35);
  head.renderFaster();

  // EAR
  const ear1 = new Triangle3d();
  ear1.color = [1, 0.8, 0, 1];
  // ear1.matrix = new Matrix4(body.matrix);
  ear1.matrix.translate(-.15, 0.4, -0.65);
  ear1.matrix.rotate(animation ? 5 * Math.sin(g_seconds) : g_yellowAngle, 0, 0, 1);
  ear1.matrix.scale(0.15, .15, .05);
  ear1.render();

  const ear2 = new Triangle3d();
  ear2.color = [1, 0.8, 0, 1];
  ear2.matrix.translate(0, 0.4, -0.65);
  ear2.matrix.rotate(animation ? 5 * Math.sin(g_seconds) : g_yellowAngle, 0, 0, 1);
  ear2.matrix.scale(0.15, .15, .05);
  ear2.render();

  // EYE 
  const eye1 = new Cube();
  eye1.color = [1, 1, 1, 1];
  eye1.matrix = new Matrix4(head.matrix);
  eye1.matrix.translate(0.1, 0.5, -0.1);
  eye1.matrix.scale(0.35, 0.35, 0.2);
  eye1.renderFaster();

  const pupil1 = new Cube();
  pupil1.color = [0, 0, 0, 1];
  pupil1.matrix = new Matrix4(eye1.matrix);
  pupil1.matrix.translate(0, 0, -0.05);
  pupil1.matrix.scale(0.35, 0.35, 0.2);
  pupil1.renderFaster();

  const eye2 = new Cube();
  eye2.color = eye1.color;
  eye2.matrix = new Matrix4(eye1.matrix);
  eye2.matrix.translate(1.2, 0, 0);
  eye2.renderFaster();

  const pupil2 = new Cube();
  pupil2.color = pupil1.color;
  pupil2.matrix = new Matrix4(eye2.matrix);
  pupil2.matrix.translate(0, 0, -0.05);
  pupil2.matrix.scale(0.35, 0.35, 0.2);
  pupil2.renderFaster();

  const mouth = new Cube();
  mouth.color = [0, 0, 0, 1];
  mouth.matrix = head.matrix;
  mouth.matrix.translate(.10, .10, -0.05);
  mouth.matrix.scale(0.75, 0.15, 0.2);
  mouth.renderFaster();

  // BODY
  const body = new Cube();
  if (g_normalOn) body.textureNum = -3;
  body.color = [1, 140 / 255, 0, 1];
  body.matrix.translate(-0.25, -.25, -0.5);
  body.matrix.scale(0.5, 0.5, 0.75);
  body.renderFaster();

  // LEFT LEG
  const leftLeg = new Cube();
  leftLeg.color = body.color;
  leftLeg.matrix.translate(0.1, -0.15, -0.45);
  leftLeg.matrix.rotate(animation ? 45 * Math.sin(g_seconds) : g_blueAngle, 1, 0, 0);
  leftLeg.matrix.scale(0.1, -0.35, 0.1);
  leftLeg.renderFaster();

  // RIGHT LEG
  const rightLeg = new Cube();
  rightLeg.color = body.color;
  rightLeg.matrix.translate(-0.2, -0.15, -0.45);
  rightLeg.matrix.rotate(animation ? -45 * Math.sin(g_seconds) : -g_blueAngle, 1, 0, 0);
  rightLeg.matrix.scale(0.1, -0.35, 0.1);
  rightLeg.renderFaster();

  // LEFT LEG
  const leftLeg2 = new Cube();
  leftLeg2.color = body.color;
  leftLeg2.matrix.translate(0.1, -0.15, .1);
  leftLeg2.matrix.rotate(animation ? 45 * Math.sin(g_seconds) : g_blueAngle, 1, 0, 0);
  leftLeg2.matrix.scale(0.1, -0.35, 0.1);
  leftLeg2.renderFaster();

  // RIGHT LEG
  const rightLeg2 = new Cube();
  rightLeg2.color = body.color;
  rightLeg2.matrix.translate(-0.2, -0.15, .1);
  rightLeg2.matrix.rotate(animation ? -45 * Math.sin(g_seconds) : -g_blueAngle, 1, 0, 0);
  rightLeg2.matrix.scale(0.1, -0.35, 0.1);
  rightLeg2.renderFaster();

  // sphere
  const sphere = new Sphere();
  if (g_normalOn) sphere.textureNum = -3
  sphere.matrix.translate(-1, 0, 0);
  sphere.render();

  // light
  const light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(.1, .1, .1);
  light.textureNum = -2;
  light.renderFaster();
  
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1],  camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);

  gl.uniform3f(u_spotLightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);

  let spotlight = new Cube();
  spotlight.color = g_spotlightColor;
  spotlight.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  spotlight.matrix.scale(-.1, -.1, -.1);
  spotlight.matrix.translate(2,-0.5,1);
  spotlight.render();
  
  var duration = performance.now() - startTime;
  sendTextToHTML("fps: " + Math.floor(10000 * duration) / 10);
}

function convertCoordsToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  return [x, y];
}

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordsToGL(ev);
  if (dragging) {
    var dx = 360 * (x - g_lastX);
    var dy = 360 * (y - g_lastY)

    g_x += dy;
    g_yAngle += dx;
    if (Math.abs(g_globalAngle / 360) > 1) {
      g_x = 0;
    }
    if (Math.abs(g_yAngle / 360) > 1) {
      g_zAngle = 0;
    }

  }
  g_lastX = x;
  g_lastY = y;
  renderAllShapes();
}

function addListeners() {
  const angle = document.querySelector('#angle');
  const yellow = document.querySelector('#yellow');
  const blue = document.querySelector('#blue');
  const lightX = document.querySelector('#lightX');
  const lightY = document.querySelector('#lightY');
  const lightZ = document.querySelector('#lightZ');

  angle.addEventListener('mousemove', () => {
    g_globalAngle = -1 * angle.value;
    renderAllShapes();
  });
  // yellow2.addEventListener('mousemove', () => {g_yellowAngle2 = yellow2.value; renderAllShapes();})
  yellow.addEventListener('mousemove', () => { g_yellowAngle = yellow.value; renderAllShapes(); })
  blue.addEventListener('mousemove', () => { g_blueAngle = blue.value; renderAllShapes(); })

  document.querySelector('#animationOn').addEventListener('click', () => { animation = true});
  document.querySelector('#animationOff').addEventListener('click', () => animation = false);

  document.querySelector('#normalOn').addEventListener('click', () => { g_normalOn = true});
  document.querySelector('#normalOff').addEventListener('click', () => g_normalOn = false);

  lightX.addEventListener('mousemove', () => { g_lightPos[0] = lightX.value / 100; renderAllShapes(); });
  lightY.addEventListener('mousemove', () => { g_lightPos[1] = lightY.value / 100; renderAllShapes(); });
  lightZ.addEventListener('mousemove', () => { g_lightPos[2] = lightZ.value / 100; renderAllShapes(); });

  document.querySelector('#lightOn').addEventListener('click', () => { g_lightOn = true});
  document.querySelector('#lightOff').addEventListener('click', () => g_lightOn = false);
}