class Food {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
	}

	draw() {
		fill(0, 0, 255, 120);
		noStroke();
		let plat = G.latDegFromY(this.pos.y, 2, simZ);
		let plon = G.lonDegFromX(this.pos.x, 2, simZ);
		// console.log(plat, plon);
		// console.log(G.geoToScreen({lat: plat, lon: plon}));
		let sc = G.geoToScreen({ lat: plat, lon: plon });

		circle(sc.x, sc.y, this.size);
	}

	eat() {
		this.size -= 1;
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

		// let p = ant.pos.copy();
		// console.log(p.x, p.y);
		let plat = G.latDegFromY(this.pos.y, 2, simZ);
		let plon = G.lonDegFromX(this.pos.x, 2, simZ);
		// console.log(plat, plon);
		// console.log(G.geoToScreen({lat: plat, lon: plon}));
		let sc = G.geoToScreen({ lat: plat, lon: plon });

		circle(sc.x, sc.y, this.size);
	}
}