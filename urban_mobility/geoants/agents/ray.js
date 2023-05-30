class Ray {
	constructor(pos, angle) {
		this.pos = pos;
		this.dir = p5.Vector.fromAngle(angle);
	}

	lookAt(x, y) {
		this.dir.x = x - this.pos.x;
		this.dir.y = y - this.pos.y;
		this.dir.normalize();
	}

	show() {
		stroke(255);
		push();
		translate(this.pos.x, this.pos.y);
		line(0, 0, this.dir.x * 10, this.dir.y * 10);
		pop();
	}

	cast([startPt, endPt]) {
		//формула на https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
		const x1 = startPt.x;
		const y1 = startPt.y;
		const x2 = endPt.x;
		const y2 = endPt.y;
		// console.log(x1, y1, x2, y2);

		const x3 = this.pos.x;
		const y3 = this.pos.y;
		const x4 = this.pos.x + this.dir.x;
		const y4 = this.pos.y + this.dir.y;

		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (den == 0) {
			return; //параллельны
		}

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

		if (t > 0 && t < 1 && u > 0) {
			const pt = createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
			return pt;
		} else {
			return;
		}
	}
}
