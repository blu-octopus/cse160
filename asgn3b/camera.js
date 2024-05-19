class Camera
{
	constructor()
	{
		this.eye = new Vector3([0, 0, 20]);
		this.at = new Vector3([0, 0, 19]);
		this.up = new Vector3([0, 1, 0]);

		this.speed = 1
		this.turnSpeed = 0.1

		this.GlobalForwardVector = [0, 0, -1];
		this.GlobalBackVector = [0, 0, 1];

		this.GlobalRightVector = [1, 0, 0];
		this.GlobalLeftVector = [-1, 0, 0];

		this.GlobalUpVector = [0, 1, 0];
		this.GlobalDownVector = [0, -1, 0];
	}

	forward()
	{
		var fVector = sub(this.at.elements, this.eye.elements)
		fVector = mul(normalize(fVector), this.speed)
		this.at.elements = add(this.at.elements, fVector);
		this.eye.elements = add(this.eye.elements, fVector);
        this.vectorUpdate();
	}

	back()
	{
		var fVector = sub(this.eye.elements, this.at.elements)
		fVector = mul(normalize(fVector), this.speed)
		this.at.elements = add(this.at.elements, fVector);
		this.eye.elements = add(this.eye.elements, fVector);
        this.vectorUpdate();
	}

	left()
	{
   		// this.eye.elements[0] -= 0.1;
   		var rVector = mul(normalize(this.GlobalLeftVector), this.speed);
        this.eye.elements = add(this.eye.elements, rVector);
        this.at.elements = add(this.at.elements, rVector);
        this.vectorUpdate();
	}

	right()
	{
   		console.log('right')
   		var rVector = mul(normalize(this.GlobalRightVector), this.speed);
        this.eye.elements = add(this.eye.elements, rVector);
        this.at.elements = add(this.at.elements, rVector);
        this.vectorUpdate();
	}

	rotateRight() 
	{
		console.log("eye: " + this.eye.elements)
		console.log("at: " + this.at.elements)
		console.log("up: " + this.up.elements)
        let rotateRightVector = mul(this.GlobalRightVector, this.turnSpeed);
        let vec = sub(add(this.at.elements, rotateRightVector), this.eye.elements);
        this.at.elements = add(this.eye.elements, normalize(vec));
		this.vectorUpdate();
    }

    rotateLeft() 
    {
        let rotateRightVector = mul(this.GlobalLeftVector, this.turnSpeed);
        let vec = sub(add(this.at.elements, rotateRightVector), this.eye.elements);
        this.at.elements = add(this.eye.elements, normalize(vec));
		this.vectorUpdate();    
    }

    flyUp()
    {
    	let upVector = mul(this.GlobalUpVector, this.speed);
    	this.eye.elements = add(this.eye.elements, upVector);
    	this.at.elements = add(this.at.elements, upVector);
    
    	this.vectorUpdate();
    }
    
    flyDown()
    {
    	let upVector = mul(this.GlobalDownVector, this.speed);
    	this.eye.elements = add(this.eye.elements, upVector);
    	this.at.elements = add(this.at.elements, upVector);
    
    	this.vectorUpdate();
    }

    vectorUpdate()
    {
        // console.log("Right: " + this.GlobalRightVector);
        // console.log("Left: " + this.GlobalLeftVector);
    	this.GlobalForwardVector = normalize(sub(this.at.elements, this.eye.elements));
        this.GlobalBackVector = inverse(this.GlobalForwardVector);

        this.GlobalRightVector = normalize(cross(this.GlobalForwardVector, this.GlobalUpVector));
        this.GlobalLeftVector = inverse(this.GlobalRightVector)

        this.GlobalUpVector = normalize(this.up.elements);
        this.GlobalDownVector = inverse(this.GlobalUpVector);

    }
}

function inverse(v)
{
	var vec = new Float32Array(3);
	vec[0] = -v[0];
	vec[1] = -v[1];
	vec[2] = -v[2];

	return vec;
}

function add(v1, v2)
{
	var vec = new Float32Array(3)
	vec[0] = v1[0] + v2[0]
	vec[1] = v1[1] + v2[1]
	vec[2] = v1[2] + v2[2]

	return vec
}

function sub(v1, v2)
{
	var vec = new Float32Array(3)
	vec[0] = v1[0] - v2[0]
	vec[1] = v1[1] - v2[1]
	vec[2] = v1[2] - v2[2]

	return vec
}

function mul(v, s)
{
	var vec = new Float32Array(3)
	vec[0] = v[0] * s
	vec[1] = v[1] * s
	vec[2] = v[2] * s

	return vec
}

function div(v, s)
{
	var vec = new Float32Array(3)
	vec[0] = v[0] * s
	vec[1] = v[1] * s
	vec[2] = v[2] * s

	return vec
}

function magnitude(v)
{
	var m = 0
	m = Math.sqrt((v[0]*v[0]) + (v[1]*v[1]) + (v[2]*v[2]))

	return m
}

function normalize(v)
{
	vec = new Float32Array(3);
	m = magnitude(v);
	vec[0] = v[0] / m;
	vec[1] = v[1] / m;
	vec[2] = v[2] / m;


	return vec
}

function cross(v1, v2) 
{
    x = v1[1] * v2[2] - v1[2] * v2[1]
	y = v1[2] * v2[0] - v1[0] * v2[2]
    z = v1[0] * v2[1] - v1[1] * v2[0]
    
    let vec = new Float32Array(3);
    vec = [x, y, z]

    return vec;
}