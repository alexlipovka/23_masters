let view = {
	center: new p5.Vector(0, 0),
	pCenter: new p5.Vector(0, 0),
	currentScale: 1,
	isDragging: false,
}


function s2w(pt) {
	let wPt = pt.copy();
	wPt.sub(view.center);
	wPt.mult(1 / view.currentScale);
	// console.log(wPt);
	return wPt;
}

let ants = [];
let cellSize = 50;
let gridSize = 10;
let grid;
let steps = [];
let stepExtent = [new p5.Vector(0, 0), new p5.Vector(0, 0)];


function preload() {
	myFont = loadFont('./assets/Roboto-Regular.ttf');
}

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	ortho();
	view.center.set(width / 2, height / 2);
	view.pCenter.set(view.center);

	grid = createImage(gridSize, gridSize);
	grid.loadPixels();
	for (let p = 0; p < grid.pixels.length; p += 4) {
		grid.pixels[p] = 0;
		grid.pixels[p + 1] = 0;
		grid.pixels[p + 2] = 0;
		grid.pixels[p + 3] = 255;
	}
	grid.updatePixels();
	smooth();
}

function pushStep(x, y) {
	let colorShift = 5;
	for (let i = 0; i < steps.length; i++) {
		if (steps[i].x === x && steps[i].y === y) {
			let c = steps[i].color;
			let red = constrain(c.levels[0] + colorShift, 0, 255)
			let green = constrain(c.levels[1] + colorShift, 0, 255)
			let blue = constrain(c.levels[2] + colorShift, 0, 255)
			let alpha = constrain(c.levels[3], 0, 255)
			steps[i].color = color(red, green, blue, alpha);
			return;
		}
	}
	steps.push({ 'x': x, 'y': y, 'color': color(colorShift, colorShift, colorShift, 255) });
	stepExtent[0].x = min(x - cellSize / 2, stepExtent[0].x);
	stepExtent[0].y = min(y - cellSize / 2, stepExtent[0].y);
	stepExtent[1].x = max(x + cellSize / 2, stepExtent[1].x);
	stepExtent[1].y = max(y + cellSize / 2, stepExtent[1].y);
	// console.log(steps);
}

function fadeSteps() {
	for (let i = 0; i < steps.length; i++) {
		let c = steps[i].color;
		let colorShift = -1;
		let red = constrain(c.levels[0] + colorShift, 0, 255)
		let green = constrain(c.levels[1] + colorShift, 0, 255)
		let blue = constrain(c.levels[2] + colorShift, 0, 255)
		let alpha = constrain(c.levels[3], 0, 255)
		steps[i].color = color(red, green, blue, alpha);
	}
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	background(0);
	if (frameCount % 20 === 0)
		fadeSteps();

	fill(50);
	noStroke();
	translate(-width / 2, -height / 2);

	push();
	{
		if (view.isDragging) {
			let diff = new p5.Vector(mouseX, mouseY).sub(view.pCenter);
			translate(diff.x, diff.y);
		}
		translate(view.center.x, view.center.y);
		scale(view.currentScale, view.currentScale, 1);

		ellipse(0, 0, 10, 10);
		stroke(255);
		line(-200, 0, 200, 0);
		line(0, -200, 0, 200);


		let gridOff = cellSize * gridSize / 2 - cellSize / 2;
		grid.loadPixels();
		rectMode(CENTER);
		for (let a = 0; a < ants.length; a++) {
			let x = round(ants[a].pos.x / cellSize) * cellSize;
			let y = round(ants[a].pos.y / cellSize) * cellSize;
			pushStep(x, y);

		}


		rectMode(CENTER)
		noStroke();
		for (let i = 0; i < steps.length; i++) {
			fill(steps[i].color);
			rect(steps[i].x, steps[i].y, cellSize, cellSize);
			// circle(steps[i].x, steps[i].y, cellSize, cellSize);
		}


	}

	ants.forEach(ant => {
		ant.applyFlockBehaviour(ants);
		// ant.seek(s2w(createVector(mouseX, mouseY)));
		ant.run();
	});

	stroke(255);
	noFill();
	rectMode(CORNERS);
	rect(stepExtent[0].x, stepExtent[0].y, stepExtent[1].x, stepExtent[1].y);

	pop();

	fill(200);
	let wpt = s2w(createVector(mouseX, mouseY));
	textFont(myFont);
	textSize(14);
	text(`(${round(wpt.x, 1)}; ${round(wpt.y, 1)})`, mouseX+10, mouseY+20);
	let extentX = (stepExtent[1].x - stepExtent[0].x) / cellSize;
	let extentY = (stepExtent[1].y - stepExtent[0].y) / cellSize;
	let sparsity = round(steps.length / ((extentX * extentY) > 0 ? (extentX * extentY) : 1), 2);
	text(`${extentX}×${extentY}\n${steps.length} vs ${extentX * extentY} : ${sparsity}`, 20, 20);
	if(ants.length > 0) {
		text(`Agents: ${ants.length}`, 20, 60);
		text(`v_max=${ants[0].maxSpeed}\nf_max=${ants[0].maxForce}`, 20, 80);
	}
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight, WEBGL);
}

function mousePressed() {
	if (mouseButton === CENTER) {
		view.isDragging = true;
		view.pCenter.set(mouseX, mouseY);
	} else if (mouseButton === LEFT) {
		ants.push(new Ant(s2w(createVector(mouseX, mouseY)), steps));
	}

}

function mouseReleased() {
	if (mouseButton === CENTER) {
		view.isDragging = false;
		let diff = new p5.Vector(mouseX, mouseY).sub(view.pCenter);
		view.center.add(diff);
		view.pCenter.set(view.center);
	}
}

function mouseWheel(event) {
	if (event.delta < 0) {
		let diff = new p5.Vector(mouseX, mouseY).sub(view.center);
		diff.mult(0.5);
		view.center.add(diff);
		// console.log('up');
	}
	else {
		let diff = new p5.Vector(mouseX, mouseY).sub(view.center);
		view.center.sub(diff);
		// console.log('down');
	}
	view.currentScale *= event.delta > 0 ? 2 : 0.5;
}

