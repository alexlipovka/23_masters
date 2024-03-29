const WAIT = 50;
const MAXSPEED = 10;
const STATES = {
	'HOME': 0,
	'SEEK': 1,
}

// let noiseScale = 0.02;

class Ant {
	constructor(pos, world) {
		this.pos = pos;
		this.vel = new p5.Vector(random(2)-1, random(2)-1);
		this.acc = new p5.Vector(1, 0);
		this.maxSpeed = MAXSPEED;
		this.maxForce = 3;
		this.mass = 10;
		this.home = this.pos.copy();

		this.state = STATES.SEEK,
			this.reachedGoal = false;
		this.steps = 0;
		this.targets = [];
		this.targets.push(this.home);
		this.noiseScale = 0.01;
		this.noiseVal = random()*1000;
		this.curTarget = new p5.Vector(0,0);
		this.leftTarget = new p5.Vector(0,0);
		this.centerTarget = new p5.Vector(0,0);
		this.rightTarget = new p5.Vector(0,0);
		this.world = world;
	}

	run() {
		this.update();
		this.draw();
	}

	draw() {
		fill(map(this.vel.mag(), 0, MAXSPEED, 0, 255), 0, 0);
		stroke(255);
		// this.reachedGoal ? stroke(0, 255, 0) : noStroke();
		push();
		{
			translate(this.pos.x, this.pos.y);
			rotate(this.vel.heading());
			beginShape();
			vertex(-10, -8);
			vertex(-10, 8);
			vertex(20, 0);
			endShape(CLOSE);
		}
		pop();
		
		noStroke();
		fill(255, 0, 0);
		circle(this.curTarget.x, this.curTarget.y, 4);
		fill(0, 255, 0);
		circle(this.leftTarget.x, this.leftTarget.y, 4);
		circle(this.centerTarget.x, this.centerTarget.y, 4);
		circle(this.rightTarget.x, this.rightTarget.y, 4);

		fill(0, 0, 255);
		noStroke();
		circle(this.home.x, this.home.y, 5);
	}

	update() {
		this.steps++;
		this.noiseVal += this.noiseScale;

		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0);
		// console.log(this.vel.mag());
	}

	applyForce(force) {
		let f = force.copy();
		f.div(this.mass);
		this.acc.add(f);
	}

	chooseRandomDir() {
		// let randomDir = this.vel.copy().normalize().setHeading(random(PI/2) - PI/4);
		// console.log(noise(this.noiseVal) * PI/4 - PI/8);
		let m = this.vel.mag();
		let randomDir = this.vel.copy().normalize().rotate(noise(this.noiseVal) * PI / 2 - PI/4).mult(50).add(this.pos); //perlin noise приводит к округлым образованиям
		// let randomDir = this.vel.copy().normalize().rotate(random(PI / 2) - PI / 4).setMag(50).add(this.pos); //рандом разрастается как растение
		this.curTarget.set(randomDir);
		return randomDir;//.add(this.vel);
	}

	chooseSensor() {
		let sensorDist = 100;
		this.leftTarget = this.vel.copy().normalize().rotate(-PI/4).mult(sensorDist).add(this.pos);
		this.centerTarget = this.vel.copy().normalize().rotate(0).mult(sensorDist).add(this.pos);
		this.rightTarget = this.vel.copy().normalize().rotate(PI/4).mult(sensorDist).add(this.pos);

		let leftX = round(this.leftTarget.x / cellSize)*cellSize;
		let leftY = round(this.leftTarget.y / cellSize)*cellSize;
		let centerX = round(this.centerTarget.x / cellSize)*cellSize;
		let centerY = round(this.centerTarget.y / cellSize)*cellSize;
		let rightX = round(this.rightTarget.x / cellSize)*cellSize;
		let rightY = round(this.rightTarget.y / cellSize)*cellSize;

		const leftSensor = this.world.find(w => w.x === leftX && w.y === leftY);
		const centerSensor = this.world.find(w => w.x === centerX && w.y === centerY);
		const rightSensor = this.world.find(w => w.x === rightX && w.y === rightY);
		let v1 = leftSensor !== undefined ? leftSensor.color.levels[0] : 0;
		let v2 = centerSensor !== undefined ? centerSensor.color.levels[0] : 0;
		let v3 = rightSensor !== undefined ? rightSensor.color.levels[0] : 0;
		return v1 > v2 ? leftSensor : v2 > v3 ? centerSensor : rightSensor;
	}

	defineTarget(target) {
		let t = 0.5;
		if (random() < t)
			return this.chooseRandomDir();
		if (this.steps < WAIT)
			// return this.chooseRandomDir().mult(t).add(target.copy().mult(1-t));
			return target;
		if (this.state === STATES.SEEK)
			// return this.chooseRandomDir().mult(t).add(target.copy().mult(1-t));
			return target;
		if (this.state === STATES.HOME)
			// return this.chooseRandomDir().mult(t).add(this.home.copy().mult(1-t));
			return this.home;
	}

	checkTarget(target) {
		if (this.pos.copy().sub(target).magSq() < 400) {
			this.state++;
			this.state = this.state % 2;
		}
	}

	combineTargets(target1, target2, val) {
		return target1.copy().mult(val).add(target2.copy().mult(1-val));
	}

	seek(target) {
		let sensor = this.chooseSensor();
		// let trueTarget = this.defineTarget(target);
		
		let trueTarget = this.chooseRandomDir();
		if(sensor !== undefined)
			trueTarget = this.combineTargets(createVector(sensor.x, sensor.y), trueTarget, 0.7);
		// this.checkTarget(trueTarget);
		this.checkTarget(target);
		// if(this.state === STATES.HOME)
		// 	trueTarget = this.home.copy();
		let desired;
		desired = trueTarget.copy().sub(this.pos);

		let d = desired.mag();
		desired.normalize();
		if (d < 200) {
			let m = map(d, 0, 100, 0, this.maxSpeed);
			desired.mult(m);
		} else {
			desired.mult(this.maxSpeed);
		}
		// desired.setMag(this.maxSpeed);
		let steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		// console.log(steer);
		this.applyForce(steer);
	}
}