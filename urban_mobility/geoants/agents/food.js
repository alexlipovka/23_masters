class Food {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
	}

	draw() {
		fill(0, 0, 255, 120);
		noStroke();
		let plat = G.latDegFromY(this.pos.y, 2, conf.simZ);
		let plon = G.lonDegFromX(this.pos.x, 2, conf.simZ);
		// console.log(plat, plon);
		// console.log(G.geoToScreen({lat: plat, lon: plon}));
		let sc = G.geoToScreen({ lat: plat, lon: plon });
		let size = this.size / (614400/currentScale*6.85);
		circle(sc.x, sc.y, size);
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
		let plat = G.latDegFromY(this.pos.y, 2, conf.simZ);
		let plon = G.lonDegFromX(this.pos.x, 2, conf.simZ);
		// console.log(plat, plon);
		// console.log(G.geoToScreen({lat: plat, lon: plon}));
		let sc = G.geoToScreen({ lat: plat, lon: plon });
		let size = this.size / (614400/currentScale*6.85);
		circle(sc.x, sc.y, size);
	}
}