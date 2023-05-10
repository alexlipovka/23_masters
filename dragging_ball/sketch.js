class Feature {
	constructor(r, pos, danger) {
		this.pos = pos;
		this.r = r;
		this.danger = danger;
		this.active = false;
	}

	draw() {
		noStroke();
		if(this.pos.y + this.r >= border)
			fill(225, 118, 118);
		else
			fill(30,137,137);
		circle(this.pos.x, this.pos.y, this.r * 2)
	}

	ptInside(pt) {
		if (this.pos.dist(pt) <= this.r) return true;
		else return false;
	}

	setPos(pos) {
		if (this.danger) {
			if (pos.y - this.r >= border) {
				this.pos.set(pos);
			}
		} else {
			this.pos.set(pos);
		}
	}
}

border = 700;
features = [];
// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	createCanvas(windowWidth, windowHeight);
	features.push(new Feature(90, new p5.Vector(800 / 2, height - 200), true));
	features.push(new Feature(90, new p5.Vector(200, height - 200), false));
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	background(100);

	features.forEach(feature => {
		feature.draw();
	});
	stroke(0);
	line(0, border, width, border);
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