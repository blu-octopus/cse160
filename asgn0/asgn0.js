 // DrawRectangle.js
 // Function to draw a vector on the canvas
 
function drawVector(v, color) {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');
    // Set the line color
    ctx.strokeStyle = color;

    // Begin drawing path
    ctx.beginPath();
    let width = canvas.width/2;
    let height = canvas.height/2;
    // Move to the starting point (0, 0)
    ctx.moveTo(width, height); // Center of the canvas (400/2, 400/2)

    // Scale the vector coordinates by 20 for visualization
    console.log(v.elements[0], v.elements[1]);
    var scaledX = 200 + v.elements[0]* 20; // Scale x coordinate and add to center
    var scaledY = 200 - v.elements[1] * 20; // Scale y coordinate and subtract from center

    // Draw a line to the scaled endpoint
    ctx.lineTo(scaledX, scaledY);

    // Finish drawing path
    ctx.stroke();
}

function handleDrawEvent() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); ``

    var xInput = document.getElementById('v1-x-coordinate');
    var yInput = document.getElementById('v1-y-coordinate');

    var x = parseFloat(xInput.value);
    var y = parseFloat(yInput.value);

    var v1 = new Vector3([x, y, 0]);
    drawVector(v1, "red");
}

function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    canvas.style.backgroundColor = "black";
    // Get the rendering context for 2DCG <- (2)
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle <- (3)
    // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    // ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color

    // var v1 = new Vector3([2.25, 2.25, 0]);
    // drawVector(v1, "red");

}

