class Camera {
    constructor(){ 
        this.fov = 60; // field of view
        this.eye = new Vector3([0,0.5,3]);
        this.at = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]);
        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();
        this.speed = 3;
    }
    renderCamera() {
        this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projMat.elements);

        this.viewMat.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements[0], this.at.elements[1], this.at.elements[2], 
            this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMat.elements);
    }
    moveForwardW() {
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        f = f.normalize();
        f = f.mul(this.speed);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }
    moveBackwardS() {
        let b = new Vector3();
        b = b.set(this.at);
        b = b.sub(this.eye);
        b = b.normalize();
        b = b.mul(this.speed);
        this.eye = this.eye.sub(b);
        this.at = this.at.sub(b);
    }
    moveLeftA() {
        let f = new Vector3();  
        f = f.set(this.at);
        f = f.sub(this.eye);
        f = f.normalize();
        let s = Vector3.cross(this.up, f);
        s = s.normalize();
        s = s.mul(this.speed);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);   
    }
    moveRightD() {
        let r = new Vector3();
        r = r.set(this.at);
        r = r.sub(this.eye);
        r = r.normalize();
        let s = Vector3.cross(r, this.up);
        s = s.normalize();
        s = s.mul(this.speed);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }
    rotateLeft() {
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        f = f.normalize();
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(2 ,this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotMatrix.multiplyVector3(f);
        this.at = f_prime.add(this.eye);
    }
    rotateRight() {
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        f = f.normalize();
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(-2, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotMatrix.multiplyVector3(f);
        this.at = f_prime.add(this.eye);
    }
    // flyUp()
    // {
    // 	let upVector = mul(this.GlobalUpVector, this.speed);
    // 	this.eye.elements = add(this.eye.elements, upVector);
    // 	this.at.elements = add(this.at.elements, upVector);
    
    // 	this.vectorUpdate();
    // }
    
    // flyDown()
    // {
    // 	let upVector = mul(this.GlobalDownVector, this.speed);
    // 	this.eye.elements = add(this.eye.elements, upVector);
    // 	this.at.elements = add(this.at.elements, upVector);
    
    // 	this.vectorUpdate();
    // }
}