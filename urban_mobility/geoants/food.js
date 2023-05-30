class Food {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;		
	}

	draw() {
		fill(0, 0, 255, 120);
		noStroke();
		circle(this.pos.x, this.pos.y, this.size);
	}

	eat() {
		this.size -= 5;
	}
}

class Home {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
	}

	draw() {
		fill(0, 255, 0, 120);
		noStroke();
		circle(this.pos.x, this.pos.y, this.size);
	}
}