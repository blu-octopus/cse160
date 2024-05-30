class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts = 
        [0,0,0, 1,1,0, 1,0,0,//front
        0,0,0, 0,1,0, 1,1,0,
        0,0,1, 1,1,1, 1,0,1,//back
        0,0,1, 0,1,1, 1,1,1,
        0,1,0, 0,1,1, 1,1,1,//top
        0,1,0, 1,1,1, 1,1,0,
        0,0,0, 0,0,1, 1,0,1,//bottom
        0,0,0, 1,0,1, 1,0,0,
        1,1,0, 1,1,1, 1,0,0,//right
        1,0,0, 1,0,1, 1,1,1,
        0,1,0, 0,1,1, 0,0,0,//left
        0,0,0, 0,0,1, 0,1,1];
        this.uvVerts = [
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1
        ];

        this.normalVerts = [
            0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
            0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
            0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,
            0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
            1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
           -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        ];
    }
    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], [0,0,-1,0,0,-1,0,0,-1]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], [0,0,-1,0,0,-1,0,0,-1]);

        // gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        // Top of Cube
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,1,0,0,1,0,0,1,0]);
        drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0,0,1,0,0,1,0]);

        // gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);

        // Right of Cube
        // gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [1,0, 1,1, 0,1], [1,0,0,1,0,0,1,0,0]);
        drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1], [1,0, 0,0, 0,1], [1,0,0,1,0,0,1,0,0]);

        // Left of Cube
        // gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,0], [1,0, 0,0, 0,1], [-1,0,0,-1,0,0,-1,0,0]);
        drawTriangle3DUVNormal([0,0,1, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], [-1,0,0,-1,0,0,-1,0,0]);

        // Bottom of Cube
        // gl.uniform4f(u_FragColor, rgba[0] * .6, rgba[1] * .6, rgba[2] * .6, rgba[3]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0,0,-1,0,0,-1,0]);
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0,0,-1,0,0,-1,0]);

        // Back of Cube
        // gl.uniform4f(u_FragColor, rgba[0] * .5, rgba[1] * .5, rgba[2] * .5, rgba[3]);
        drawTriangle3DUVNormal([1,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1,0,0,1,0,0,1]);
        drawTriangle3DUVNormal([0,0,1, 1,0,1, 0,1,1], [0,0, 1,1, 1,0], [0,0,1,0,0,1,0,0,1]);

        // gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        // drawTriangle3DUVNormal( [0,0,0,   0,1,0,   0,1,1], [1,0, 1,1, 0,1]);
        // drawTriangle3DUVNormal( [0,0,0,   0,0,1,   0,1,1], [1,0, 0,0, 0,1]);
    }

    renderFast() {
        var rgba = this.color;
      
          gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
          gl.uniform1i(u_whichTexture, this.textureNum);
      
          // Pass the color of a point to u_FragColor variable
      
          // Pass the matrix to u_ModelMatrix attribute
          gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      
          var allverts = [];
          // Front of Cube
          allverts = allverts.concat([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]);
          allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
          // Back
          allverts = allverts.concat([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0 ]);
          allverts = allverts.concat([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
          // Top
          allverts = allverts.concat([0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
          allverts = allverts.concat([0.0,1.0,1.0, 0.0,1.0,0.0, 1.0,1.0,1.0 ]);
          // Bottom
          allverts = allverts.concat([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,0.0 ]);
          allverts = allverts.concat([1.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0 ]);
      
          // Left
          allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
          allverts = allverts.concat([0.0,1.0,1.0, 0.0,0.0,0.0, 0.0,0.0,1.0 ]);
          // Right
          allverts = allverts.concat([1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
          allverts = allverts.concat([1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);
      
          drawTriangle3D(allverts);
        }
        
        renderFaster() {
            var rgba = this.color;
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
            // Pass the texture number
            gl.uniform1i(u_whichTexture, this.textureNum);
    
            // Pass the matrix to u_ModelMatrix attribute
            gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
            // drawTriangle3DUV(this.cubeVerts, this.uvVerts);
            gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

            drawTriangle3DUVNormal(this.cubeVerts, this.uvVerts, this.normalVerts);
        }
}