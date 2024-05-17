class Prism {
    constructor() {
        this.type = 'prism';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;  // -2 goes back to original colors, -1 sets to debugging colors, 0 sets to the specified texture
    }

    render() {
        var rgba = this.color;
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        drawTriangle3DUV([0.0, 0.0, 0.0,   0.5, 1.0, 0.0,   1.0, 0.0, 0.0], [0.0, 0.0,  0.5, 1.0,  1.0, 0.0]);
        drawTriangle3DUV([0.0, 0.0, 0.5,   0.5, 1.0, 0.5,   1.0, 0.0, 0.5], [0.0, 0.5,  0.5, 1.0,  1.0, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top face
        drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 0.0, 0.5,   0.5, 1.0, 0.5], [0.0, 0.0,  0.0, 0.5,  0.5, 1.0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,   0.5, 1.0, 0.0,   0.5, 1.0, 0.5], [0.0, 0.0,  0.5, 0.0,  0.5, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Right face
        drawTriangle3DUV([0.5, 1.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.5], [0.5, 1.0,  1.0, 0.0,  1.0, 0.5]);
        drawTriangle3DUV([0.5, 1.0, 0.0,   0.5, 1.0, 0.5,   1.0, 0.0, 0.5], [0.5, 1.0,  0.5, 0.5,  1.0, 0.5]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // Bottom face
        drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 0.0, 0.5,   1.0, 0.0, 0.5], [0.0, 0.0,  0.0, 0.5,  1.0, 0.5]);
        drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 0.0, 0.5,   1.0, 0.0, 0.0], [0.0, 0.0,  1.0, 0.5,  1.0, 0.0]);
    }

    rotate(angle, x, y, z) {
        return this.matrix.rotate(angle, x, y, z);
    }

    translate(x, y, z) {
        return this.matrix.translate(x, y, z);
    }

    scale(x, y, z) {
        return this.matrix.scale(x, y, z);
    }
}
