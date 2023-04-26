// Настройка приложения
// Данная функция будет выполнена первой и только один раз

let balls = [];
// let attractor;

var gui;
let settingsObject = {
	radius: 10,
	forces_x: 0.1,
	forces_y: 0.1,
	useGlobal: false,
	cleanBackground: true,
	backAlpha: 50,
	playSim: false,
	effectField: 300,
	collide: true,
};

let particleSystems = [];
let repellers = [];
let attractors = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	// attractor = new p5.Vector(width / 2, height / 2);
	gui = new dat.GUI();
	let ballsController = gui.addFolder('Balls');
	ballsController.add(settingsObject, "radius", 5, 50);
	ballsController.add(settingsObject, "forces_x", -2, 2);
	ballsController.add(settingsObject, "forces_y", -2, 2);
	ballsController.add(settingsObject, "useGlobal").listen();
	ballsController.add(settingsObject, "backAlpha", 0, 255);
	ballsController.add(settingsObject, "cleanBackground");
	ballsController.add(settingsObject, "playSim").listen();
	ballsController.add(settingsObject, "effectField", 0, 600).listen();
	ballsController.add(settingsObject, "collide").listen();

}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	if (settingsObject.cleanBackground) {
		blendMode(ADD);
		background(255, settingsObject.backAlpha);
		blendMode(BLEND);
	}
	for(let j = 0; j < repellers.length; j++) {
		repellers[j].draw();
	}
	for(let j = 0; j < attractors.length; j++) {
		attractors[j].draw();
	}
	
	for(let i = 0; i < particleSystems.length; i++) {
		particleSystems[i].applyForce(new p5.Vector(0, 0.2));
		for(let j = 0; j < repellers.length; j++) {
			particleSystems[i].applyRepeller(repellers[j]);
		}
		for(let j = 0; j < attractors.length; j++) {
			particleSystems[i].applyAttractor(attractors[j]);
		}
		particleSystems[i].run();
	}
}
// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
	if (keyIsPressed && keyCode === CONTROL) {
		// particleSystem.add(new Particle(settingsObject.radius, new p5.Vector(mouseX, mouseY), new p5.Vector(0, 0), new p5.Vector(settingsObject.forces_x, settingsObject.forces_y)));
		particleSystems.push(new ParticleSystem(new p5.Vector(mouseX, mouseY)));
	}
	if(keyIsPressed && keyCode === ALT) {
		repellers.push(new Repeller(new p5.Vector(mouseX, mouseY), random(10, 50)));
	}
	if(keyIsPressed && keyCode === SHIFT) {
		attractors.push(new Attractor(new p5.Vector(mouseX, mouseY), random(10, 50)));
	}
}

function mouseMoved() {
	// attractor.set(new p5.Vector(mouseX, mouseY));
}

function keyPressed() {
	if (key == 'p') {
		settingsObject.playSim = !settingsObject.playSim;
	} else if (key == 'c') {
		settingsObject.collide = !settingsObject.collide;
	} else if (key == 'g') {
		settingsObject.useGlobal = !settingsObject.useGlobal;
	}
}

function mouseWheel(event) {
	settingsObject.effectField += event.delta;
}