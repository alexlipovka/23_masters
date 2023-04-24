// const G = 0.0000000000667428;

class Attractor {
	constructor(pos, r) {
		this.pos = pos;
		this.r = r;
		this.mass = PI * r * r;
	}

	repel(p) {
		let dir = this.pos.copy().sub(p.pos);
		let d = dir.mag();
		d = constrain(d, 5, 100);
		dir.normalize();
		let force = G / (d * d);
		dir.mult(force);
		dir.mult(this.mass);
		return dir;
	}

	draw() {
		fill(0, 150, 0);
		noStroke();
		circle(this.pos.x, this.pos.y, this.r);
	}

	set(pos) {
		this.pos.set(pos);
	}
}