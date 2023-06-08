const WAIT = 50;
const MAXSPEED = 15;
const STATES = {
	'HOME': 0,
	'SEEK': 1,
}

// let noiseScale = 0.02;

class Ant {
	constructor(pos, world, home) {
		this.pos = pos;
		this.vel = new p5.Vector(random(2) - 1, random(2) - 1);
		this.acc = new p5.Vector(1, 0);
		this.maxSpeed = MAXSPEED;
		this.maxForce = 30;
		this.mass = 10;
		this.home = this.pos.copy();

		this.state = STATES.SEEK,
			this.reachedGoal = false;
		// this.steps = 0;
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
		for (let a = 0; a < 360; a += 1) {
			this.rays.push(new Ray(this.pos, radians(a)));
		}
	}

	run() {
		this.update();
		this.draw();
	}

	draw() {
		// fill(map(this.vel.mag(), 0, MAXSPEED, 0, 255), 0, 0);
		// stroke(255);
		noStroke()
		if (this.state === STATES.SEEK) {
			fill(0, 210, 0);
		} else {
			fill(0, 0, 210);
		}
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
			if(this.state === STATES.HOME) {
				fill(0, 0, 255);
				circle(24, 0, 8);
			}
		}

		// noFill();
		// stroke(100);
		// circle(0, 0, this.desiredSeparation);

		noStroke();
		fill(255, 0, 0);
		circle(this.curTarget.x, this.curTarget.y, 4);

		pop();

		// fill(0, 255, 0);
		// circle(this.leftTarget.x, this.leftTarget.y, 4);
		// circle(this.centerTarget.x, this.centerTarget.y, 4);
		// circle(this.rightTarget.x, this.rightTarget.y, 4);

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
	}

	applyForce(force) {
		let f = force.copy();
		f.div(this.mass);
		this.acc.add(f);
	}

	snapCoord(val, grid) {
		return(round(val / grid) * grid);
	}

	//Модель случайного движения
	chooseRandomDir() {
		let randomDir;
		let FOV = PI/2;
		if (this.vel.mag() > 0) {
			if (conf.use_noise_random)
				randomDir = this.vel.copy().normalize().rotate(noise(this.noiseVal) * FOV - FOV / 2).setMag(this.maxSpeed);
			else
				randomDir = this.vel.copy().normalize().rotate(random(FOV) - FOV / 2).setMag(this.maxSpeed);
		} else {
			randomDir = createVector(1, 0).normalize().setHeading(random(PI * 2) - PI).normalize();
		}
		this.curTarget.set(randomDir);
		return randomDir;//.add(this.vel);
	}

	//Нащупывание следа
	chooseSensor() {
		let sensorDist = 100;
		let sensorAngle = PI/4;
		this.leftTarget = this.vel.copy().normalize().rotate(-sensorAngle).mult(sensorDist).add(this.pos);
		this.centerTarget = this.vel.copy().normalize().rotate(0).mult(sensorDist).add(this.pos);
		this.rightTarget = this.vel.copy().normalize().rotate(sensorAngle).mult(sensorDist).add(this.pos);

		let leftX = this.snapCoord(this.leftTarget.x, cellSize);// * cellSize;
		let leftY = this.snapCoord(this.leftTarget.y, cellSize);// * cellSize;
		let centerX = this.snapCoord(this.centerTarget.x, cellSize);// * cellSize;
		let centerY = this.snapCoord(this.centerTarget.y, cellSize);// * cellSize;
		let rightX = this.snapCoord(this.rightTarget.x, cellSize);// * cellSize;
		let rightY = this.snapCoord(this.rightTarget.y, cellSize);// * cellSize;

		const leftSensor = this.world.find(w => w.x === leftX && w.y === leftY);
		const centerSensor = this.world.find(w => w.x === centerX && w.y === centerY);
		const rightSensor = this.world.find(w => w.x === rightX && w.y === rightY);
		let v1 = 0;
		let v2 = 0;
		let v3 = 0;
		if (this.state === STATES.SEEK) {
			v1 = leftSensor !== undefined ? leftSensor.color.levels[2] : 0;
			v2 = centerSensor !== undefined ? centerSensor.color.levels[2] : 0;
			v3 = rightSensor !== undefined ? rightSensor.color.levels[2] : 0;
		} else {//if(this.state === STATES.HOME)
			v1 = leftSensor !== undefined ? leftSensor.color.levels[1] : 0;
			v2 = centerSensor !== undefined ? centerSensor.color.levels[1] : 0;
			v3 = rightSensor !== undefined ? rightSensor.color.levels[1] : 0;
		}
		if (v1 === 0 && v2 === 0 && v3 === 0)
			return undefined;
		return v1 > v2 ? leftSensor : v2 > v3 ? centerSensor : rightSensor;
	}

	
	//Двидение по следу
	trackSteps() {
		let sensor = this.chooseSensor();
		if (sensor === undefined)
			return new this.pos.copy();
		let trueTarget = new p5.Vector(sensor.x, sensor.y);
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
		let steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		return (steer);
	}

	//Сложное движение, комбинация
	applyFlockBehaviour(others) {
		let sep = this.separation(others);	//разделение
		let ali = this.alignment(others);		//выравнивание
		let coh = this.cohesion(others);		//группирование
		let step = this.trackSteps();				//движение по следу
		let lim = this.limits();						//соблюдение границ
		let rnd = this.chooseRandomDir();		//случайное движение
		let h = this.seek(this.home);				//возвращение домой

		sep.mult(0.5);
		ali.mult(0.5);
		coh.mult(0.5);
		step.mult(1.0);
		lim.mult(2.0);
		rnd.mult(1.0);
		h.mult(0.2);


		if (conf.use_separation) this.applyForce(sep);
		if (conf.use_alignment) this.applyForce(ali);
		if (conf.use_cohesion) this.applyForce(coh);
		if (conf.track_steps) this.applyForce(step);
		if (conf.obey_limits) this.applyForce(lim);
		if (conf.go_random) this.applyForce(rnd);
		if (this.state === STATES.HOME) {
			this.applyForce(h);
		}
	}

	//Соблюдение границ
	limits() {
		let extent = 3000;
		let desired = new p5.Vector(0, 0);
		let steer;
		if (this.pos.x < -extent || this.pos.x > extent || this.pos.y < -extent || this.pos.y > extent) {
			if (this.pos.x < -extent) desired.add(new p5.Vector(this.maxSpeed, this.vel.y));
			if (this.pos.x > extent) desired.add(new p5.Vector(-this.maxSpeed, this.vel.y));
			if (this.pos.y < -extent) desired.add(new p5.Vector(this.vel.x, this.maxSpeed));
			if (this.pos.y > -extent) desired.add(new p5.Vector(this.vel.x, -this.maxSpeed));
		}


		steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		return (steer);

	}

	//Поиск цели
	seek(target) {
		let desired = target.copy().sub(this.pos);
		desired.setMag(this.maxSpeed);
		let steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		return steer;
	}

	//Избегание цели
	avoid(target) {
		let desired = this.pos.copy().sub(target);
		desired.setMag(this.maxSpeed);
		let steer = desired.sub(this.vel);
		steer.limit(this.maxForce);
		return steer;
	}

	//Разделение
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

	//Выравнивание
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

	//Группирование
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

	//Объект внутри конуса видимости
	inFOV(obj, angle, distance) {
		let ang = this.vel.angleBetween(obj.copy().sub(this.pos));
		let d = this.pos.dist(obj);
		if(Math.abs(ang) <= angle && d <= distance)
			return true;
		return false;
	}

	//Найдена пища
	foundFood(food) {
		if (this.state === STATES.SEEK) {
			for (let i = 0; i < food.length; i++) {
				let sensorDist = 100;
				if (this.inFOV(food[i].pos, PI/2, food[i].size / 2 + sensorDist)) {
					this.applyForce(this.seek(food[i].pos));
					if (this.pos.dist(food[i].pos) <= food[i].size / 2) {
						food[i].eat();
						if(food[i].size < 50) {
							food.splice(i, 1);
							i--;
						}
						this.state = STATES.HOME;
						this.vel.mult(-1);
					}
					return true;
				}
			}
		}
	}
	
	//Достигнут дом
	reachedHome(home) {
			for (let i = 0; i < home.length; i++) {
				let sensorDist = 100;
				if (this.inFOV(home[i].pos, PI/2, home[i].size / 2 + sensorDist)) {
						this.applyForce(this.seek(home[i].pos));
					if (this.pos.dist(home[i].pos) <= home[i].size / 2) {
						this.state = STATES.SEEK;
						this.vel.mult(-1);
					}
				}
			// }
		}
	}

	//Рей-кастинг по стенам
	look(walls) {
		for (let ray of this.rays) {
			let closest = null;
			let record = Infinity;
			let d;
			for (let wall of walls) {
				const pt = ray.cast(wall);
				if (pt) {
					d = p5.Vector.dist(this.pos, pt);
					if (d < record) {
						record = d;
						closest = pt;
					}
				}
			}
			if (closest) {
				this.applyForce(this.avoid(closest));
				fill(255, 120);
				noStroke();
				ellipse(closest.x, closest.y, 5);
			}
		}
	}

	//Стена поблизости
	wallIsNear(wall) {
		for (let ray of this.rays) {
			let closest = null;
			let record = Infinity;
			let d;

			const pt = ray.cast(wall);
			if (pt) {
				d = p5.Vector.dist(this.pos, pt);
				if (d < record) {
					record = d;
					closest = pt;
				}
			}
			if (closest && d < 50) {
				fill(255);
				noStroke();
				circle(pt.x, pt.y, 10);
				stroke(255, 120);
				line(this.pos.x, this.pos.y, closest.x, closest.y);
				return true;
			}
		}
		return false;
	}

	//Избегание стен
	avoidWalls(walls) {
		for (let i = 0; i < walls.length; i++) {
			let predict = this.vel.copy().setMag(this.maxSpeed).add(this.pos);
			let a = walls[i][0].copy();
			let b = walls[i][1].copy();
			let normalPoint = this.getNormalPoint(predict, a, b);
			let dir = walls[i][1].copy().sub(walls[i][1]);
			dir.setMag(this.maxSpeed*2);
			let target = normalPoint.copy().add(dir);
			let d = normalPoint.dist(predict);
			
			if (d < 50 && this.wallIsNear(walls[i])) {
				console.log('obstacle');
				stroke(255, 0, 0, 120);
				line(this.pos.x, this.pos.y, normalPoint.x, normalPoint.y);
				this.applyForce(this.avoid(target).mult(5));
			}
		}
	}

	//Вернуть нормаль
	getNormalPoint(predictPos, a, b) {
		let ap = predictPos.copy().sub(a);
		let ab = b.copy().sub(a);
		ab.normalize();
		ab.mult(ap.dot(ab));

		return a.copy().add(ab);
	}

}
