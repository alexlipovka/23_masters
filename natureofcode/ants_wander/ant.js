const WAIT = 50;
const MAXSPEED = 10;
const STATES = {
	'HOME': 0,
	'SEEK': 1,
}

// let noiseScale = 0.02;

class Ant {
	constructor(pos) {
		this.pos = pos;
		this.vel = new p5.Vector(0, 0);
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
		this.noiseScale = 0.02;
		this.noiseVal = 0;
	}

	run() {
		this.update();
		this.draw();
	}

	draw() {
		fill(map(this.vel.mag(), 0, MAXSPEED, 0, 255), 0, 0);
		this.reachedGoal ? stroke(0, 255, 0) : noStroke();
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

		push();
		translate(this.pos.x, this.pos.y);
		{
			fill(0);
			let fPos = this.vel.copy().mult(10);
			circle(fPos.x, fPos.y, 4);
		}
		pop();

		fill(0, 255, 0);
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
		let randomDir = this.vel.copy().normalize().setHeading(noise(this.noiseVal) * PI/2 - PI/4);
		return randomDir.add(this.vel);
	}

	defineTarget(target) {
		if(random() < 0.4) 
			return this.chooseRandomDir();
		if (this.steps < WAIT)
			return target;
		if (this.state === STATES.SEEK)
			return target;
		if (this.state === STATES.HOME)
			return this.home;
	}

	checkTarget(target) {
		if (this.pos.copy().sub(target).magSq() < 100) {
			this.state++;
			this.state = this.state % 2;
		}
	}

	seek(target) {
		let trueTarget = this.defineTarget(target);
		this.checkTarget(trueTarget);
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