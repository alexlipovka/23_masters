class ParticleSystem {
	constructor(origin) {
		this.particles = [];
		this.origin = origin;
	}

	run() {
		for (let i = 0; i < this.particles.length; i++) {
			if (!this.particles[i].isDead()) {
				this.particles[i].run();
			} else {
				this.particles.splice(i, 1);
				i--;
			}
		}
		if(Math.random() < 0.01) {
			this.add();
		}
		fill(0, 100, 0);
		noStroke();
		circle(this.origin.x, this.origin.y, 10);
	}

	add() {
		this.particles.push(new Particle(settingsObject.radius, this.origin.copy(), new p5.Vector(0, 0), new p5.Vector(0, 0)));
	}

	applyForce(force) {
		for(let i = 0; i < this.particles.length; i++) {
			this.particles[i].applyForce(force);
		}
	}

	applyRepeller(repeller) {
		for(let i = 0; i < this.particles.length; i++) {
			let force = repeller.repel(this.particles[i]);
			this.particles[i].applyForce(force);
		}
	}

	applyAttractor(attractor) {
		for(let i = 0; i < this.particles.length; i++) {
			let force = attractor.repel(this.particles[i]);
			this.particles[i].applyForce(force);
		}
	}
}