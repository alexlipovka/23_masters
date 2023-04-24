const MAXLIFE = 5000;

class Particle {
	constructor(r, pos, vel, acc) {
		this.pos = pos;
		this.vel = vel;
		this.acc = acc;
		this.r = r;
		this.friction = 1;
		this.bounce_friction = 1;
		this.collided = false;
		this.lifespan = MAXLIFE;
		this.mass = PI * r * r;
		this.maxVel = 5;
		this.maxAcc = 1;
		this.prevAcc = acc.copy();
	}

	run() {
		this.update();
		this.draw();
	}

	draw() {
		fill(150, map(this.lifespan, 0, MAXLIFE, 0, 255));
		if (!this.collided) {
			noStroke();
		} else {
			stroke(255, 0, 0);
			this.collided = false;
		}
		circle(this.pos.x, this.pos.y, this.r * 2);

		let f = this.prevAcc.copy();
		// f.normalize();
		// f.mult(this.acc.mag());
		f.mult(2000);
		// console.log(f);
		f.add(this.pos);
		stroke(230, 0, 0, 100);
		line(this.pos.x, this.pos.y, f.x, f.y);

		let d = this.vel.copy();
		// d.normalize();
		// d.mult(this.vel.mag());
		d.mult(10);
		d.add(this.pos);
		stroke(0, 0, 230, 100);
		line(this.pos.x, this.pos.y, d.x, d.y);
		// console.log(Math.round(this.vel.x * 100)/100 + ' ' + Math.round(this.vel.y*100)/100);
	}

	accel() {
		let target = attractor.copy();
		target.sub(this.pos);
		target.normalize();
		target.mult(3);
		this.applyForce(target);
		// this.acc = target;
		if (this.pos.dist(attractor) < settingsObject.effectField) {
			this.friction = 1;
		} else {
			this.friction = 0.9;
		}
	}
	
	applyForce(force) {
		let f = force.copy();
		f.div(this.mass);
		this.acc.add(f);		
	}

	touch() {
		let avgVel = new p5.Vector(0, 0);
		let collisions = 0;
		
		for (let i = 0; i < balls.length; i++) {
			if (balls[i] === this) continue;
			let d = this.pos.dist(balls[i].pos);
			if (d > 0 && d <= (this.r + balls[i].r) * 1.5) {
				avgVel.add(this.pos.copy().sub(balls[i].pos).normalize());
				collisions += 1;
			}
		}
		if (collisions > 0) {
			avgVel.div(collisions);
			this.vel.add(avgVel);
			this.vel.mult(this.bounce_friction);
			this.collided = true;
		}
		
	}

	update() {
		// if (settingsObject.useGlobal) {
		// 	this.acc.x = settingsObject.forces_x;
		// 	this.acc.y = settingsObject.forces_y;
		// } else {
		// 	this.accel();
		// }
		this.acc.limit(this.maxAcc);
		this.vel.add(this.acc);
		this.vel.limit(this.maxVel);
		this.vel.mult(this.friction);
		this.pos.add(this.vel);

		// if (settingsObject.collide) {
		// 	this.touch();
		// }
		this.prevAcc = this.acc.copy();
		this.acc.mult(0);
		this.lifespan -= 1;
	}

	isDead() {
		return this.lifespan <= 0;		
	}
}