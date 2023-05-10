class Feature {
	constructor(r, pos, danger, name) {
		this.pos = pos;
		this.r = r;
		this.danger = danger;
		this.active = false;
		this.name = name;
	}

	draw() {
		noStroke();
		let c1 = pg.pixels[(width * (this.pos.y + this.r) + this.pos.x) * 4 + 0];
		let c2 = pg.pixels[(width * (this.pos.y + this.r) + this.pos.x) * 4 + 1];
		let c3 = pg.pixels[(width * (this.pos.y + this.r) + this.pos.x) * 4 + 2];
		let c4 = pg.pixels[(width * (this.pos.y + this.r) + this.pos.x) * 4 + 3];
		if (c1 === 0 && c2 === 0 && c3 === 0 && c4 === 255)
			fill(225, 118, 118);
		else
			fill(30, 137, 137);
		circle(this.pos.x, this.pos.y, this.r * 2)

		fill(255);
		let ts = this.r/3;
		textSize(ts);
		textAlign(CENTER);
		text(this.name, this.pos.x, this.pos.y+ts/2);
	}

	ptInside(pt) {
		if (this.pos.dist(pt) <= this.r) return true;
		else return false;
	}

	setPos(pos) {
		// image.loadPixels();
		if (this.danger) {
			let c1 = pg.pixels[(width * (pos.y - this.r) + pos.x) * 4 + 0];
			let c2 = pg.pixels[(width * (pos.y - this.r) + pos.x) * 4 + 1];
			let c3 = pg.pixels[(width * (pos.y - this.r) + pos.x) * 4 + 2];
			let c4 = pg.pixels[(width * (pos.y - this.r) + pos.x) * 4 + 3];
			// console.log(c1, c2, c3, c4);
			if (c1 === 0 && c2 === 0 && c3 === 0 && c4 === 255) {
				// console.log(c.value);
				// this.pos.set(pos.x, this.pos.y);
				this.pos.set(pos);
			}
		} else {
			this.pos.set(pos);
		}
	}
}

var gui;

let settings = {
	border: 400,
};

let features = [];
let field;
let pg;

function preload() {
	field = loadImage('img/field.png');
}
// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	createCanvas(windowWidth, windowHeight);
	pg = createGraphics(windowWidth, windowHeight);
	pg.image(field, 0, 0, image.width, image.height);
	pg.loadPixels();
	features.push(new Feature(90, new p5.Vector(800 / 2, height - 200), true, "The Bad"));
	features.push(new Feature(90, new p5.Vector(200, height - 200), false, "The Good"));
	gui = new dat.GUI();
	gui.add(settings, 'border', 0, height, 10);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	// pg.loadPixels();
	background(100);
	image(field, 0, 0, image.width, image.height);

	features.forEach(feature => {
		feature.draw();
	});
	stroke(0);
	line(0, settings.border, width, settings.border);
	noStroke();
	fill(255);
	ellipse(mouseX, mouseY, 21, 21);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
	features.forEach(feature => {
		if (feature.ptInside(createVector(mouseX, mouseY))) {
			feature.active = true;
		}
	});
}

function mouseReleased() {
	features.forEach(feature => {
		feature.active = false;
	});
}

function mouseDragged() {
	features.forEach(feature => {
		if (feature.active) {
			feature.setPos(createVector(mouseX, mouseY));
		}
	});
}