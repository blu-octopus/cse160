class Triangle {
    constructor() {
        this.type       = 'triangle';
        this.position   = [0.0,0.0,0.0];
        this.color      = [1.0,1.0,1.0,1.0];
        this.size       = 5.0;
    }

    render() {
        var xy   = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.disableVertexAttribArray(a_Position);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
        gl.uniform1f(u_Size, size);

        var delta = this.size/200.0;
        // (top_x_left,bottom_right_y,(size),bottom_right_y,top_x_right, top_y)
        // (left_x,left_y,right_x,right_y,top_x,top_y);
        drawTriangle([xy[0], xy[1], xy[0]+delta, xy[1], xy[0]+(delta/2), xy[1]+delta]);
    }

}

function drawTriangle(vertices) {
    var n = 3;

    var vertex_buffer = gl.createBuffer();
    
    if(!vertex_buffer) {
        console.log("Failed to create the buffer object");
        return -1; 
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);

}