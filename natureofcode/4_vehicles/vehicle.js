const MAXLIFE = 5000;
const MAXSPEED = 10;

class Vehicle {
	constructor(pos) {
		this.pos = pos;
		this.vel = new p5.Vector(0, 0);
		this.acc = new p5.Vector(0, 0);
		this.maxSpeed = Math.random() * MAXSPEED + MAXSPEED / 2;
		console.log(this.maxSpeed);
		this.maxForce = Math.random() * 5 + 1;
		console.log(this.maxForce);
		this.mass = Math.random() * 20 + 5;
	}

	run() {
		this.update();
		this.draw();
	}

	draw() {
		fill(map(this.vel.mag(), 0, MAXSPEED, 0, 255), 0, 0);
		noStroke();
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		beginShape();
		vertex(-10, -8);
		vertex(-10, 8);
		vertex(20, 0);
		endShape(CLOSE);
		pop();
	}

	update() {
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);

		if(this.pos.x > width) this.pos.x -= width;
		if(this.pos.x < 0) this.pos.x += width;
		if(this.pos.y > height) this.pos.y -= height;
		if(this.pos.y < 0) this.pos.y += height;

		this.acc.mult(0);
		// console.log(this.vel.mag());
	}

	applyForce(force) {
		let f = force.copy();
		f.div(this.mass);
		this.acc.add(f);
	}

	seek(target) {
		let desired = target.copy().sub(this.pos); //follows
		// let desired = this.pos.copy().sub(target); //escapes

		let d = desired.mag();
		desired.normalize();
		if (d < 100) {
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