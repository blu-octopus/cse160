class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // FRONT SIDE
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0] *0.55, rgba[1] *0.55, rgba[2]*0.5, rgba[3]);

    drawTriangle3D( [0.0, 0.0, 0.0,  1.0,0.0,0.0,  1.0,1.0,0.0 ]);
    drawTriangle3D( [0.0, 0.0, 0.0,  0.0,1.0,0.0,  1.0,1.0,0.0 ]);

    // BOTTOM SIDE
    gl.uniform4f(u_FragColor, rgba[0] *0.6, rgba[1] *0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3DUV( [0.0, 0.0, 0.0,  1.0,0.0,0.0,  1.0,0.0,1.0 ], [0.0, 0.0,  1.0, 0.0,  1.0, 1.0]);
    drawTriangle3D( [0.0, 0.0, 0.0,  1.0,0.0,0.0,  1.0,0.0,1.0 ]);
    drawTriangle3D( [0.0, 0.0, 0.0,  0.0,0.0,1.0,  1.0,0.0,1.0 ]);

    // LEFT SIDE
    gl.uniform4f(u_FragColor, rgba[0] *0.9, rgba[1] *0.9, rgba[2]*0.9, rgba[3]);

    drawTriangle3D( [0.0, 0.0, 0.0,  0.0,0.0,1.0,  0.0,1.0,1.0 ]);
    drawTriangle3D( [0.0, 0.0, 0.0,  0.0,1.0,0.0,  0.0,1.0,1.0 ]);

    // BACK SIDE
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D( [0.0, 0.0, 1.0,  0.0,1.0,1.0,  1.0,1.0,1.0 ]);
    drawTriangle3D( [0.0, 0.0, 1.0,  1.0,0.0,1.0,  1.0,1.0,1.0 ]);

    // RIGHT SIDE
    gl.uniform4f(u_FragColor, rgba[0] *0.8, rgba[1] *0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D( [1.0, 0.0, 0.0,  1.0,1.0,0.0,  1.0,1.0,1.0 ]);
    drawTriangle3D( [1.0, 0.0, 0.0,  1.0,0.0,1.0,  1.0,1.0,1.0 ]);
    
    // TOP SIDE
    gl.uniform4f(u_FragColor, rgba[0] *0.7, rgba[1] *0.65, rgba[2]*0.6, rgba[3]);
    drawTriangle3D( [0.0, 1.0, 0.0,  1.0,1.0,0.0,  1.0,1.0,1.0 ]);
    drawTriangle3D( [0.0, 1.0, 0.0,  0.0,1.0,1.0,  1.0,1.0,1.0 ]);
    }
}
