class Cube{
    constructor(){
        this.type='cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -1;    
        // -2 goes back to original cube colors, -1 sets to debugging colors, 0 sets to the specified texture
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the texure number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        //drawTriangle3D( [ 0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ] );
        drawTriangle3DUV( [ 0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );   // pink one
        drawTriangle3DUV( [ 0.0, 0.0, 0.0,   0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );   // second one ( mostly blue)
        
        // Back face of cube
        drawTriangle3DUV( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0]);
        drawTriangle3DUV( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        
        // Top of cube
        drawTriangle3DUV( [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        drawTriangle3DUV( [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );

        // Other sides of cube top, bottom, left, right, back <fill this in yourself>

        // Left face of cube
        drawTriangle3DUV( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        drawTriangle3DUV( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 1.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );

        // Right face of cube
        drawTriangle3DUV( [1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        drawTriangle3DUV( [1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );

        
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        // Bottom of cube
        drawTriangle3DUV( [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        drawTriangle3DUV( [1.0, 0.0, 1.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );

    }

    renderfast() {
        var rgba = this.color;
        //var size = this.size;

        // Pass the texure number
        //gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var allverts = [];
        // Front of cube
        
        //drawTriangle3DUV( [ 0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );   // pink one
        //drawTriangle3DUV( [ 0.0, 0.0, 0.0,   0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );   // second one ( mostly blue)
        allverts = allverts.concat( [ 0.0, 0.0, 0.0,   1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ] );
        allverts = allverts.concat( [ 0.0, 0.0, 0.0,   0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ] );


        // Back face of cube
        //drawTriangle3DUV( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0]);
        //drawTriangle3DUV( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        allverts = allverts.concat( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0] );
        allverts = allverts.concat( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0] );

        // Pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        
        // Top of cube
        //drawTriangle3DUV( [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        //drawTriangle3DUV( [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        allverts = allverts.concat( [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0] );
        allverts = allverts.concat( [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0] );

        // Other sides of cube top, bottom, left, right, back <fill this in yourself>

        // Left face of cube
        //drawTriangle3DUV( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        //drawTriangle3DUV( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 1.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        allverts = allverts.concat( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0] );
        allverts = allverts.concat( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 1.0, 1.0] );

        // Right face of cube
        //drawTriangle3DUV( [1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        //drawTriangle3DUV( [1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        allverts = allverts.concat( [1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0] );
        allverts = allverts.concat( [1.0, 1.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 1.0] );

        
        //gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        // Bottom of cube
        //drawTriangle3DUV( [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0], [1.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        //drawTriangle3DUV( [1.0, 0.0, 1.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0], [0.0, 0.0,  0.0, 1.0,  1.0, 1.0] );
        allverts = allverts.concat( [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0] );
        allverts = allverts.concat( [1.0, 0.0, 1.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0] );
        
        drawTriangle3D(allverts);

    }

    // 3d triangle, change these to 3D UV too!! ? 
    renderT() {
        var rgba = this.color;
        //var size = this.size;

        // Pass the texure number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // front
        drawTriangle3D( [1.0, 0.0, 0.0,   0.0, 1.0, 0.0,    0.0, 0.0, 0.0]);
        
        // back
        drawTriangle3D( [1.0, 0.0, 1.0,   0.0, 1.0, 1.0,    0.0, 0.0, 1.0] );

        // Pass the color of a point to u_FragColor uniform variable 
        // (make the bottom ones a diff shade, shows texture)
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        
        // Left face of cube
        drawTriangle3D( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0] );
        drawTriangle3D( [0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 1.0, 1.0] );

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        // right slant
        drawTriangle3D( [1.0, 0.0, 0.0,    0.0, 1.0, 0.0,   1.0, 0.0, 1.0] );
        drawTriangle3D( [0.0, 1.0, 0.0,    0.0, 1.0, 1.0,   1.0, 0.0, 1.0] );

        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        // Bottom of cube
        drawTriangle3D( [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0] );
        drawTriangle3D( [1.0, 0.0, 1.0,   1.0, 0.0, 0.0,   0.0, 0.0, 1.0] );
    }
}