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
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
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
      gl_FragColor = vec4(v_Normal + 1.0 / 2.0, 1.0);
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
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // N dot L 
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // reflection 
    vec3 R = reflect(-L, N);

    // eye 
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // specular 
    float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    vec3 spotLightdirection = vec3(0, -1, 0);
    vec3 spotLight = normalize(u_spotLightPos - vec3(v_VertPos));
    vec3 lightToPointDirection = -spotLight;
    vec3 spotLightdiffuse = max(0.0, dot(spotLight, normalize(v_Normal))) * vec3(gl_FragColor) * vec3(1.0, 0.0, 1.0);
    float angleToSurface = dot(lightToPointDirection, spotLightdirection);
    float cos = smoothstep(0.0, 20.0, angleToSurface);
    diffuse += spotLightdiffuse;
    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(specular * u_lightColor + diffuse * u_lightColor + ambient, 1.0);
      }
    }

    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }
  }`;


// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_whichTexture;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_NormalMatrix;

let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let camera;
let u_cameraPos;
let u_lightPos;
let u_lightOn;
let u_spotLightPos;
let u_lightColor;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

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
  a_Normal= gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if(!u_lightPos) {
    console.log('failed to get u_lightPos location');
    return false;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if(!u_cameraPos) {
    console.log('failed to get u_cameraPos location');
    return false;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if(!u_lightOn) {
    console.log('failed to get u_lightOn location');
    return false;
  }

  u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
  if(!u_spotLightPos) {
    console.log('failed to get u_spotLightPos location');
    return false;
  };

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if(!u_lightColor) {
    console.log('failed to get u_lightColor location');
    return false;
  };

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!u_NormalMatrix) {
    console.log('failed to get u_NormalMatrix location');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

// constants
const POINT = 0;

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
let g_normalOn = false;
// let appleSwitch = false;
let g_lightOn = true;
let g_lightPos=[0,1,-2];
let g_spotlightPos = [0.1, 2, 0.2];
let g_spotlightColor = [255/255, 0/255, 255/255,1];

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

function addActionsForHtmlUI(){
  // button 
  document.getElementById('normalOn').onclick = function() {g_normalOn = true; renderAllShapes();};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false; renderAllShapes();};
  document.getElementById('lightOnButton').onclick = function() {g_lightOn = true;};
  document.getElementById('lightOffButton').onclick = function() {g_lightOn = false;};

  // color slider events
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
}

function initTextures(){
  var image = new Image();
  if(!image){
    console.log('failed to create image obj');
    return false;
  }
  image.onload = function() {sendImageToTEXTURE0(image) };
  image.src = "src/wood.jpg";

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
  imageLeaf.src = "src/seaweed (1).jpg";

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

  setUpWebGL();
  connectVariablesToGLSL();
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

  g_lightPos[0] = 2.3 * Math.cos(g_seconds);
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

// var g_eye = [0,0,3];
// var g_at = [0,0,-100];
// var g_up=[0,1,0];

// right
var g_map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,4,0,0,0,4,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,4,0,0,0,4,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

];

function drawMap() {
  for(x=0;x<=32;x++) {
    let rand = Math.random() * 0.02;
    for(y=0;y<=32;y++) {
      // console.log(x,y);
      if(g_map[x][y] == 1) {
        var plateBorder = new Cube();
        plateBorder.color = [0,1,0,0.5];
        plateBorder.textureNum = 0;
        plateBorder.matrix.translate(0,-0.75,0);
        plateBorder.matrix.translate(x-8,0,y-8);
        plateBorder.render();
      }
      if(g_map[x][y] == 2) {
        // make salmon nigiri, a flat piece of pink salmon on top of rice
        riceNigiri = new Cube();
        riceNigiri.color = [1.0,1.0,1.0,1.0];
        riceNigiri.textureNum = 3;
        riceNigiri.matrix.translate(0,-0.75,0);
        riceNigiri.matrix.translate(x-8,0,y-8);
        // riceNigiri.matrix.rotate(2*rand,0,1,0);
        riceNigiri.matrix.scale(1.6, .7, 1);
        riceNigiri.render();
        salmonNigiri = new Cube();
        // salmon color is salmon pink
        salmonNigiri.color = [250/255,128/255,114/255,1.0];
        salmonNigiri.matrix.translate(-0.2 + rand * 0.02,-0.3,-.05 + rand);
        salmonNigiri.matrix.translate(x-8,0.25,y-8)
        salmonNigiri.matrix.scale(2, 0.2, 1.1);
        salmonNigiri.render();
      }
      if(g_map[x][y] == 3){
        // make a tuna nigiri here
        riceNigiri = new Cube();
        riceNigiri.color = [1.0,1.0,1.0,1.0];
        riceNigiri.textureNum = 3;
        riceNigiri.matrix.translate(0,-0.75,0);
        riceNigiri.matrix.translate(x-8,0,y-8);
        riceNigiri.matrix.scale(1.6, .7, 1);
        riceNigiri.render();
        tunaNigiri = new Cube();
        // tuna color is red
        tunaNigiri.color = [1.0,0.0,0.0,1.0];
        tunaNigiri.matrix.translate(-0.2 + rand * 0.02,-0.3,-.05 + rand);
        tunaNigiri.matrix.translate(x-8,0.25,y-8)
        tunaNigiri.matrix.scale(2, 0.2, 1.1);
        tunaNigiri.render();
      }
      if(g_map[x][y] == 4) {
        var rice = new Prism();
        rice.color = [241/255, 244/255, 251/255, 1.0];
        rice.textureNum = 3;
        rice.matrix.translate(0, -.7, 0);
        rice.matrix.translate(x-8,0,y-8);
        rice.matrix.scale(2, 2, 2);
        rice.render();
      
        var seaweed = new Cube();
        seaweed.color = [0.0, 0.5, 0.0, 1.0];
        seaweed.textureNum = 2;
        seaweed.matrix = rice.matrix;
        seaweed.matrix.scale(.5, .4, .6);
        seaweed.matrix.translate(.45, 0, -.1);
        seaweed.render();
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

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1],  camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);

  gl.uniform3f(u_spotLightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(.1,.1,.1);
  light.render();

  let spotlight = new Cube();
  spotlight.color = g_spotlightColor;
  spotlight.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  spotlight.matrix.scale(-.1, -.1, -.1);
  spotlight.matrix.translate(2, -0.5, 1);
  spotlight.render();

  drawMap();
  drawOnigiri();
  // draw floor 

  var floor = new Cube();
  floor.color = [1.0,0.0,0.0,1.0];
  floor.textureNum=0;
  if (g_normalOn) ground.textureNum = -2;
  floor.matrix.translate(7.75,-.75,8);
  floor.matrix.scale(32,0,32);
  floor.matrix.translate(-.475,0,-0.5);
  floor.render();

  // draw the sky 
  var sky = new Cube();
  sky.color = [1.0,0.0,0.0,1.0];
  if (g_normalOn) {
    sky.textureNum = -2;
  } else {
    sky.textureNum = 1;
  }
  sky.matrix.scale(100,100,100);
  sky.matrix.translate(-.275,-.5,-0.25);
  sky.render();

  var ball = new Sphere();
  ball.color = [1.0,1.0,1.0,1.0];
  if (g_normalOn) ball.textureNum = -2;
  ball.matrix.translate(0, 0.3, 0.0);
  ball.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: "  + Math.floor(10000/duration)/10, "numdot");
  
}

// set the text of an HTML element
function sendTextToHTML(text,htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlID) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

// function addListeners() {
//   const angle = document.querySelector('#angle');
//   const yellow = document.querySelector('#yellow');
//   const blue = document.querySelector('#blue');
//   const lightX = document.querySelector('#lightX');
//   const lightY = document.querySelector('#lightY');
//   const lightZ = document.querySelector('#lightZ');

//   angle.addEventListener('mousemove', () => {
//     g_globalAngle = -1 * angle.value;
//     renderAllShapes();
//   });
//   // yellow2.addEventListener('mousemove', () => {g_yellowAngle2 = yellow2.value; renderAllShapes();})
//   yellow.addEventListener('mousemove', () => { g_yellowAngle = yellow.value; renderAllShapes(); })
//   blue.addEventListener('mousemove', () => { g_blueAngle = blue.value; renderAllShapes(); })

//   document.querySelector('#animationOn').addEventListener('click', () => { animation = true});
//   document.querySelector('#animationOff').addEventListener('click', () => animation = false);

//   document.querySelector('#normalOn').addEventListener('click', () => { g_normalOn = true});
//   document.querySelector('#normalOff').addEventListener('click', () => g_normalOn = false);

//   lightX.addEventListener('mousemove', () => { g_lightPos[0] = lightX.value / 100; renderAllShapes(); });
//   lightY.addEventListener('mousemove', () => { g_lightPos[1] = lightY.value / 100; renderAllShapes(); });
//   lightZ.addEventListener('mousemove', () => { g_lightPos[2] = lightZ.value / 100; renderAllShapes(); });

//   document.querySelector('#lightOn').addEventListener('click', () => { g_lightOn = true});
//   document.querySelector('#lightOff').addEventListener('click', () => g_lightOn = false);
// }

drawOnigiri = function(){ 
  var rice = new Prism();
  rice.color = [241/255, 244/255, 251/255, 1.0];
  rice.textureNum = 3;
  rice.matrix.translate(-1, -.7, 2);
  rice.matrix.scale(2, 2, 2);
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