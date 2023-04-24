const G = 6;

class Repeller {
	constructor(pos, r) {
		this.pos = pos;
		this.r = r;
		this.mass = PI * r * r;
	}

	repel(p) {
		let dir = this.pos.copy().sub(p.pos);
		let d = dir.mag();
		d = constrain(d, 5, 1000);
		dir.normalize();
		let force = -1 * G / (d * d);
		dir.mult(force);
		dir.mult(this.mass);
		return dir;
	}

	draw() {
		fill(150, 0, 0);
		noStroke();
		circle(this.pos.x, this.pos.y, this.r);
	}
}