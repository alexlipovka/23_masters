// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let balls = [];

function setup () {
	createCanvas(windowWidth, windowHeight);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw () {
	blendMode(ADD);
	// background(255, 1);
	blendMode(BLEND);
	// fill(255, 1);
	// noStroke();
	// rect(0, 0, width, height);
	for(let i = 0; i < balls.length; i++) {
		balls[i].update();
		balls[i].draw();
	}
	// ellipse(mouseX, mouseY, 21, 21);
	// blendMode(OVERLAY);
	textSize(18);
	fill(0);
	noStroke();
	text("Кликни мышкой", 20, 20);
	// blendMode(BLEND);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
	balls.push(new Ball(new p5.Vector(mouseX, mouseY), new p5.Vector(Math.random() * 10 - 5, 0), new p5.Vector(0, 0.1)));
}