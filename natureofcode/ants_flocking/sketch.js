var gui;
let conf = {
	use_separation : false,
	use_alignment : false,
	use_cohesion : false,
	track_steps : true,
	obey_limits : true,
	go_random : true,
	val_separation : 0.5,
	val_alignment : 0.5,
	val_cohesion : 0.5,
	val_steps : 3.0,
	val_limits : 2.0,
	val_random : 1.0,
	draw_circle_steps: true,
	min_step_size: 0.1,
	max_step_size: 3
}



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
let food = [];
let home = [];
let cellSize = 50;
let gridSize = 10;
let grid;
let steps = [];
let stepExtent = [new p5.Vector(0, 0), new p5.Vector(0, 0)];

let walls = [[new p5.Vector(-500, -500), new p5.Vector(-500, 500)],
						[new p5.Vector(500, -500), new p5.Vector(500, 500)],
						[new p5.Vector(-2000, -2000), new p5.Vector(-2000, 2000)],
						[new p5.Vector(2000, -2000), new p5.Vector(2000, 2000)]];


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

	gui = new dat.GUI();
	let bhvFolder = gui.addFolder('Behaviour');
	bhvFolder.add(conf, 'use_separation');
	bhvFolder.add(conf, 'val_separation', 0, 5);
	bhvFolder.add(conf, 'use_alignment');
	bhvFolder.add(conf, 'val_alignment', 0, 5);
	bhvFolder.add(conf, 'use_cohesion');
	bhvFolder.add(conf, 'val_cohesion', 0, 5);
	bhvFolder.add(conf, 'track_steps');
	bhvFolder.add(conf, 'val_steps', 0, 5);
	bhvFolder.add(conf, 'obey_limits');
	bhvFolder.add(conf, 'val_limits', 0, 5);
	bhvFolder.add(conf, 'go_random');
	bhvFolder.add(conf, 'val_random', 0, 5);
	let visFolder = gui.addFolder('Visual');
	visFolder.add(conf, 'draw_circle_steps');
	visFolder.add(conf, 'min_step_size', 0.1, 4);
	visFolder.add(conf, 'max_step_size', 0.1, 4);
}

function pushStep(x, y, pushColor) {
	let colorShift = 5;
	for (let i = 0; i < steps.length; i++) {
		if (steps[i].x === x && steps[i].y === y) {
			let c = steps[i].color;
			let red = constrain(c.levels[0] + pushColor.levels[0], 0, 255)
			let green = constrain(c.levels[1] + pushColor.levels[1], 0, 255)
			let blue = constrain(c.levels[2] + pushColor.levels[2], 0, 255)
			let alpha = constrain(c.levels[3], 0, 255)
			steps[i].color = color(red, green, blue, alpha);
			return;
		}
	}
	steps.push({ 'x': x, 'y': y, 'color': color(pushColor.levels[0], pushColor.levels[1], pushColor.levels[2], 255) });
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
		if(red == 0 && green == 0 && blue == 0)
			steps.splice(i, 1);
			i--;
	}
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	background(0);
	if (frameCount % 50 === 0)
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
			if(ants[a].state === STATES.SEEK)
				pushStep(x, y, color(0, 5, 0, 255));
			else if(ants[a].state === STATES.HOME)
				pushStep(x, y, color(0, 0, 15, 255));

		}


		rectMode(CENTER)
		noStroke();
		for (let i = 0; i < steps.length; i++) {
			fill(steps[i].color);
			let v = (steps[i].color.levels[1] + steps[i].color.levels[2]) / 2;
			let cs = map(v, 0, 255, cellSize * conf.min_step_size, cellSize * conf.max_step_size);
			conf.draw_circle_steps
				? circle(steps[i].x, steps[i].y, cs)
				: rect(steps[i].x, steps[i].y, cs);
		}


	}

	ants.forEach(ant => {
		// ant.look(walls);
		ant.foundFood(food);
		ant.reachedHome(home);
		ant.applyFlockBehaviour(ants);
		// ant.seek(s2w(createVector(mouseX, mouseY)));
		ant.run();
	});

	for(let i = 0; i < food.length; i++) {
		food[i].draw();
	}
	for(let i = 0; i < home.length; i++) {
		home[i].draw();
	}


	stroke(255);
	noFill();
	rectMode(CORNERS);
	rect(stepExtent[0].x, stepExtent[0].y, stepExtent[1].x, stepExtent[1].y);

	drawWalls();

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

function drawWalls() {
	stroke(80);
	for(let i = 0; i < walls.length; i++) {
		line(walls[i][0].x, walls[i][0].y, walls[i][1].x, walls[i][1].y);
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
	} else if (mouseButton === LEFT && keyIsPressed === false) {
		ants.push(new Ant(s2w(createVector(mouseX, mouseY)), steps, home.length > 0 ? home[0].pos : s2w(createVector(mouseX, mouseY))));
	} else if(mouseButton === LEFT && keyCode === CONTROL) {
		food.push(new Food(s2w(createVector(mouseX, mouseY)), random(150, 600)));
		console.log('food add');
	} else if(mouseButton === LEFT && keyCode === ALT) {
		home.push(new Home(s2w(createVector(mouseX, mouseY)), 300));
		console.log('home add');
	} else if (mouseButton === LEFT && keyCode === SHIFT) {
		let coord = s2w(createVector(mouseX, mouseY));
		for(let i = 0; i < food.length; i++) {
			if(coord.dist(food[i].pos) < food[i].size) {
				food.splice(i, 1);
				i--;
			}
		}
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

