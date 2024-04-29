class Cube {
    constructor() {
        this.type = 'cube';
        // this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        // this.size = 5.0;
        // this.segments = 10;
    }
    render() {
        // var xy = this.position;
        var rgba = this.color;
        
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        // var delta = this.size/200.0;

        // let angleStep = 360/this.segments;

        // for(let angle = 0; angle < 360; angle += angleStep) {
        //     let centerPt = [xy[0],xy[1]];
        //     let angle1 = angle;
        //     let angle2 = angle + angleStep;
        //     let vec1 = [Math.cos(angle1 * Math.PI/180)*delta, Math.sin(angle1 * Math.PI/180)*delta];
        //     let vec2 = [Math.cos(angle2 * Math.PI/180)*delta, Math.sin(angle2 * Math.PI/180)*delta];
        //     let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        //     let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        //     drawTriangle( [xy[0],xy[1],pt1[0],pt1[1],pt2[0],pt2[1]] );
        // }

        drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0] );
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,0.0,0.0] );
    }
}

// function drawTriangle(vertices) {
//     var n = 3;

//     var vertex_buffer = gl.createBuffer();
    
//     if(!vertex_buffer) {
//         console.log("Failed to create the buffer object");
//         return -1; 
//     }
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
//     gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(a_Position);
//     gl.drawArrays(gl.TRIANGLES, 0, n);

// }