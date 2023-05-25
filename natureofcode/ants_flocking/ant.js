const WAIT = 50;
const MAXSPEED = 25;
const STATES = {
	'HOME': 0,
	'SEEK': 1,
}

// let noiseScale = 0.02;

class Ant {
	constructor(pos, world) {
		this.pos = pos;
		this.vel = new p5.Vector(random(2) - 1, random(2) - 1);
		this.acc = new p5.Vector(1, 0);
		this.maxSpeed = random(MAXSPEED / 4, MAXSPEED);
		this.maxForce = 3;
		this.mass = 10;
		this.home = this.pos.copy();

		this.state = STATES.SEEK,
			this.reachedGoal = false;
		this.steps = 0;
		this.targets = [];
		this.targets.push(this.home);
		this.noiseScale = 0.01;
		this.noiseVal = random() * 1000;
		this.curTarget = new p5.Vector(0, 0);
		this.leftTarget = new p5.Vector(0, 0);
		this.centerTarget = new p5.Vector(0, 0);
		this.rightTarget = new p5.Vector(0, 0);
		this.world = world;
		this.desiredSeparation = 400;
		this.rays = [];
		for (let a = 0; a < 360; a += 10) {
			this.rays.push(new Ray(this.pos, radians(a)));
		}
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

		noFill();
		stroke(100);
		circle(0, 0, this.desiredSeparation);

		noStroke();
		fill(255, 0, 0);
		circle(this.curTarget.x, this.curTarget.y, 4);

		pop();

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
		let randomDir;
		if (this.vel.mag() > 0) {
			randomDir = this.vel.copy().normalize().rotate(noise(this.noiseVal) * PI / 2 - PI / 4).setMag(this.maxSpeed);
			// console.log(randomDir);
		} else {
			randomDir = createVector(1, 0).normalize().setHeading(random(PI * 2) - PI).normalize();
			// console.log(`from scratch`);
		}
		// randomDir.add(this.pos);
		this.curTarget.set(randomDir);
		return randomDir;//.add(this.vel);
	}

	chooseSensor() {
		let sensorDist = 100;
		this.leftTarget = this.vel.copy().normalize().rotate(-PI / 4).mult(sensorDist).add(this.pos);
		this.centerTarget = this.vel.copy().normalize().rotate(0).mult(sensorDist).add(this.pos);
		this.rightTarget = this.vel.copy().normalize().rotate(PI / 4).mult(sensorDist).add(this.pos);

		let leftX = round(this.leftTarget.x / cellSize) * cellSize;
		let leftY = round(this.leftTarget.y / cellSize) * cellSize;
		let centerX = round(this.centerTarget.x / cellSize) * cellSize;
		let centerY = round(this.centerTarget.y / cellSize) * cellSize;
		let rightX = round(this.rightTarget.x / cellSize) * cellSize;
		let rightY = round(this.rightTarget.y / cellSize) * cellSize;

		const leftSensor = this.world.find(w => w.x === leftX && w.y === leftY);
		const centerSensor = this.world.find(w => w.x === centerX && w.y === centerY);
		const rightSensor = this.world.find(w => w.x === rightX && w.y === rightY);
		let c1 = leftSensor !== undefined ? leftSensor.color.levels[2] : 0;
		let c2 = centerSensor !== undefined ? centerSensor.color.levels[2] : 0;
		let c3 = rightSensor !== undefined ? rightSensor.color.levels[2] : 0;
		let v1 = leftSensor !== undefined ? leftSensor.color.levels[0] : 0;
		let v2 = centerSensor !== undefined ? centerSensor.color.levels[0] : 0;
		let v3 = rightSensor !== undefined ? rightSensor.color.levels[0] : 0;
		if (v1 === 0 && v2 === 0 && v3 === 0 && c1 === 0 && c2 === 0 && c3 === 0)
			return undefined;
		v1 = v1 > c1 ? v1 : c1;
		v2 = v2 > c2 ? v2 : c2;
		v3 = v3 > c3 ? v3 : c3;
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
		return target1.copy().mult(val).add(target2.copy().mult(1 - val));
	}

	trackSteps() {
		let sensor = this.chooseSensor();
		if (sensor === undefined)
			return new p5.Vector(0, 0);
		let trueTarget = new p5.Vector(sensor.x, sensor.y);

		// let trueTarget = this.chooseRandomDir();
		// if (sensor !== undefined)
		// 	trueTarget = this.combineTargets(createVector(sensor.x, sensor.y), trueTarget, 0.6);

		// this.checkTarget(trueTarget);
		// this.checkTarget(target);
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


		// this.applyForce(steer);
		return (steer);
	}

	applyFlockBehaviour(others) {		
		let sep = this.separation(others);
		let ali = this.alignment(others);
		let coh = this.cohesion(others);
		let step = this.trackSteps();
		let lim = this.limits();
		let rnd = this.chooseRandomDir();
		let h = this.seek(this.home);

		sep.mult(0.5);
		ali.mult(0.5);
		coh.mult(0.5);
		step.mult(2.0);
		lim.mult(2.0);
		rnd.mult(1.0);
		h.mult(10.0);


		if (conf.use_separation) this.applyForce(sep);
		if (conf.use_alignment) this.applyForce(ali);
		if (conf.use_cohesion) this.applyForce(coh);
		if (conf.track_steps) this.applyForce(step);
		if (conf.obey_limits) this.applyForce(lim);
		if (this.state === STATES.SEEK) {
			if (conf.go_random) this.applyForce(rnd);
		}
		else if (this.state === STATES.HOME) {
			this.applyForce(h);
		}
	}

	limits() {
		let extent = 3000;
		let desired = new p5.Vector(0, 0);
		let steer;
		if (this.pos.x < -extent || this.pos.x > extent || this.pos.y < -extent || this.pos.y > extent) {
			if (this.pos.x < -extent) desired.add(new p5.Vector(this.maxSpeed, this.vel.y));
			if (this.pos.x > extent) desired.add(new p5.Vector(-this.maxSpeed, this.vel.y));
			if (this.pos.y < -extent) desired.add(new p5.Vector(this.vel.x, this.maxSpeed));
			if (this.pos.y > -extent) desired.add(new p5.Vector(this.vel.x, -this.maxSpeed));
			// console.log(this.pos);
			// console.log(desired);
		}


		steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		return (steer);

	}
	seek(target) {
		let desired = target.copy().sub(this.pos);
		desired.setMag(this.maxSpeed);
		let steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		return steer;
	}

	separation(others) {
		let count = 0;
		let sum = new p5.Vector(0, 0);

		for (let i = 0; i < others.length; i++) {
			if (others[i].pos.equals(this.pos))
				continue;
			let d = this.pos.dist(others[i].pos);
			if (d > 0 && d < this.desiredSeparation) {
				let diff = this.pos.copy().sub(others[i].pos);
				diff.normalize();
				sum.add(diff);
				count++;
			}
		}
		if (count > 0) {
			sum.div(count);
			sum.setMag(this.maxSpeed);
			let steer = sum.sub(this.vel); //separate
			// let steer = this.vel.copy().sub(sum); //atract
			steer.limit(this.maxForce);
			// this.applyForce(steer);
			return (steer)
			// console.log(`Force applied ${steer}`);
		} else
			return sum;
	}

	alignment(others) {
		let count = 0;
		let sum = new p5.Vector(0, 0);

		for (let i = 0; i < others.length; i++) {
			if (others[i].pos.equals(this.pos))
				continue;
			let d = this.pos.dist(others[i].pos);
			if (d > 0 && d < this.desiredSeparation) {
				sum.add(others[i].vel);
				count++;
			}
		}
		if (count > 0) {
			sum.div(count);
			sum.setMag(this.maxSpeed);
			let steer = sum.sub(this.vel); //separate
			// let steer = this.vel.copy().sub(sum); //atract
			steer.limit(this.maxForce);
			// this.applyForce(steer);
			return (steer);
			// console.log(`Force applied ${steer}`);
		}
		else
			return sum;
	}

	cohesion(others) {
		let count = 0;
		let sum = new p5.Vector(0, 0);

		for (let i = 0; i < others.length; i++) {
			if (others[i].pos.equals(this.pos))
				continue;
			let d = this.pos.dist(others[i].pos);
			if (d > 0 && d < this.desiredSeparation) {
				sum.add(others[i].pos);
				count++;
			}
		}
		if (count > 0) {
			sum.div(count);
			return (this.seek(sum));
		}
		else
			return sum;
	}

	foundFood(food) {
		for (let i = 0; i < food.length; i++) {
			if (this.pos.dist(food[i].pos) <= food[i].size / 2) {
				this.state = STATES.HOME;
				return true;
			}
		}
		return false;
	}
	
	reachedHome() {
		if(this.state === STATES.HOME) {
			if(this.pos.dist(this.home) <= 20) {
				this.state = STATES.SEEK;
			}
		}
	}

	look(walls) {
		for (let ray of this.rays) {
			let closest = null;
			let record = Infinity;
			for (let wall of walls) {
				const pt = ray.cast(wall);
				if (pt) {
					const d = p5.Vector.dist(this.pos, pt);
					if (d < record) {
						record = d;
						closest = pt;
					}
				}
			}
			if (closest) {
				stroke(255, 120);
				line(this.pos.x, this.pos.y, closest.x, closest.y);
				fill(255, 120);
				noStroke();
				ellipse(closest.x, closest.y, 5);
			}
		}
	}

}
