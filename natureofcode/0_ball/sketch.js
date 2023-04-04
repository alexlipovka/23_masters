// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let ball = new Ball(new p5.Vector(20, 20), new p5.Vector(0, 0), new p5.Vector(0.4, 0.4));

function setup () {
	createCanvas(windowWidth, windowHeight);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw () {
	blendMode(ADD);
	background(255, 1);
	blendMode(BLEND);
	// fill(255, 1);
	// noStroke();
	// rect(0, 0, width, height);
	ball.update();
	ball.draw();
	// ellipse(mouseX, mouseY, 21, 21);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}