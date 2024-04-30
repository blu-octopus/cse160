class Sphere {
    constructor(radius, segments) {
        this.type = 'sphere';
        this.radius = radius || 1.0; // Default radius if not provided
        this.segments = segments || 30; // Default number of segments if not provided
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
    }

    render() {
        var rgba = this.color;
        var radius = this.radius;
        var segments = this.segments;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        // gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        for (var latNumber = 0; latNumber <= segments; latNumber++) {
            var theta = (latNumber * Math.PI) / segments;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber = 0; longNumber <= segments; longNumber++) {
                var phi = (longNumber * 2 * Math.PI) / segments;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;

                var vertex = [radius * x, radius * y, radius * z];

                // Draw triangles to approximate sphere
                if (latNumber < segments && longNumber < segments) {
                    var first = (latNumber * (segments + 1)) + longNumber;
                    var second = first + segments + 1;

                    drawTriangle3D([
                        vertex[0], vertex[1], vertex[2],
                        radius * cosPhi * Math.sin(theta + Math.PI / segments),
                        radius * Math.cos(theta + Math.PI / segments),
                        radius * sinPhi * Math.sin(theta + Math.PI / segments),
                        radius * cosPhi * Math.sin(theta),
                        radius * Math.cos(theta),
                        radius * sinPhi * Math.sin(theta)
                    ]);
                    drawTriangle3D([
                        vertex[0], vertex[1], vertex[2],
                        radius * cosPhi * Math.sin(theta),
                        radius * Math.cos(theta),
                        radius * sinPhi * Math.sin(theta),
                        radius * cosPhi * Math.sin(theta + Math.PI / segments),
                        radius * Math.cos(theta + Math.PI / segments),
                        radius * sinPhi * Math.sin(theta + Math.PI / segments)
                    ]);
                }
            }
        }
    }
}
