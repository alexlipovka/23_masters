class Geo {
	zoom = 0;
	size = 2;

	//Lon in radians
	xFromLonRad(lon, size = this.size, zoom = this.zoom) {
		return size / (2 * PI) * Math.pow(2, zoom) * (lon + PI);
	}

	xFromLonDeg(lon, size = this.size, zoom = this.zoom) {
		return this.xFromLonRad(this.deg2rad(lon), size, zoom);
	}

	//Lat in radians
	yFromLatRad(lat, size = this.size, zoom = this.zoom) {
		return size / (2 * PI) * (Math.pow(2, zoom)) * (PI - Math.log(Math.tan(PI / 4 + lat / 2)));
	}

	yFromLatDeg(lat, size = this.size, zoom = this.zoom) {
		return this.yFromLatRad(this.deg2rad(lat), size, zoom);
	}

	lonRadFromX(x, size = this.size, zoom = this.zoom) {
		return constrain(-(size * PI - PI * x * Math.pow(2, 1 - zoom)) / size, -PI, PI);
	}

	lonDegFromX(x, size = this.size, zoom = this.zoom) {
		return this.rad2deg(this.lonRadFromX(x, size, zoom));
	}

	latRadFromY(y, size = this.size, zoom = this.zoom) {
		return constrain(-(PI-4*Math.atan(Math.exp(PI-(PI*y*Math.pow(2,(1-zoom)))/size)))/2, -PI/2, PI/2);
	}

	latDegFromY(y, size = this.size, zoom = this.zoom) {
		return this.rad2deg(this.latRadFromY(y, size, zoom));
	}

	deg2rad(deg) {
		return deg * PI / 180;
	}

	rad2deg(rad) {
		return rad * 180 / PI;
	}

	geoToTiles(lon, lat, zoom) {
		lat = constrain(lat, -84.69, 84.69);
		let lonRad = lon * Math.PI / 180;
		let latRad = lat * Math.PI / 180;
		let n = Math.pow(2, zoom);
		let xTile = n * ((lon + 180) / 360);
		let yTile = n * (1. - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2.;
		xTile = Math.floor(xTile);
		yTile = Math.floor(yTile);
		return { xTile, yTile, zoom };
	}

	screenToGeo() {
		let offset = new p5.Vector(mouseX- width/2, mouseY-height/2);
		offset.sub(center);
		offset.div(currentScale);
		offset.add(new p5.Vector(1, 1));
		let x = this.lonRadFromX(offset.x);
		let y = this.latRadFromY(offset.y);
		x = this.rad2deg(x);
		y = this.rad2deg(y);
		return { x, y };
	}

	geoToScreen({lat, lon}) {
		// console.log(lon, lat);
		let x = this.xFromLonDeg(lon);
		let y = this.yFromLatDeg(lat);
		let pos = createVector(x, y);
		pos.sub(createVector(1,1));
		pos.mult(currentScale);
		pos.add(center);

		return pos;
	}
}

let G = new Geo();
