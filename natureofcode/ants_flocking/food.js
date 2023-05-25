class Food {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
	}

	draw() {
		fill(0, 0, 255);
		noStroke();
		circle(this.pos.x, this.pos.y, this.size);
	}
}