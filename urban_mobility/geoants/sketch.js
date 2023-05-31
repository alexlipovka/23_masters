let conf = {
	drawGeoGrid: true,
	drawTileGrid: false,

	use_separation: false,
	use_alignment: false,
	use_cohesion: false,
	track_steps: true,
	obey_limits: true,
	go_random: true,
	val_separation: 0.5,
	val_alignment: 0.5,
	val_cohesion: 0.5,
	val_steps: 3.0,
	val_limits: 2.0,
	val_random: 1.0,
	val_home: 0.2,
	draw_circle_steps: false,
	min_step_size: 1,
	max_step_size: 1,
	use_noise_random: false, //Использовать Perlin Noise вместо Random
	cellSize: 50,
	simZ: 22,
	walkDistance: 2000
}

let useServers = ['osm'];

class Tile {
	constructor(img, z, x, y) {
		this.img = img;
		this.z = z;
		this.x = x;
		this.y = y;
	}
}

class TileQueue {
	constructor(z, x, y) {
		this.z = z;
		this.x = x;
		this.y = y;
	}
}

let img_tiles = [];
let tile_queue = [];

let Rearth = 6378137.;
let currentScale = 600000; //614400;
let curZ = 11;
let isDragging = false;
let center;
let pCenter;
let sizeT = 2;

//AGENTS
let ants = [];
let food = [];
let home = [];
// let cellSize = 50;
let steps = [];
let stepExtent = [new p5.Vector(0, 0), new p5.Vector(0, 0)];
// let simZ = 22;


let myFont;

//
let shiftKeyDown = false;



var gui;

function preload() {
	myFont = loadFont('./assets/FiraSans-Regular.ttf');
}

function setup() {
	document.addEventListener('contextmenu', event => event.preventDefault());

	createCanvas(windowWidth, windowHeight, WEBGL);
	ortho();
	// center = new p5.Vector(width / 2, height / 2);
	center = new p5.Vector(-309544, 226360);
	pCenter = center.copy();
	gui = new dat.GUI();
	let serverController = gui.addFolder('Servers');
	for (let i = 0; i < serverNames.length; i++) {
		serverController.add(serverNames[i], serverNames[i].name);
	}
	let bhvFolder = gui.addFolder('Agents');
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
	bhvFolder.add(conf, 'val_home', 0, 5);
	bhvFolder.add(conf, 'use_noise_random');
	let visFolder = gui.addFolder('Visual');
	visFolder.add(conf, 'draw_circle_steps');
	visFolder.add(conf, 'min_step_size', 0.1, 4);
	visFolder.add(conf, 'max_step_size', 0.1, 4);
	let simFolder = gui.addFolder('Simulation')
	simFolder.add(conf, 'cellSize', 10, 200);
	simFolder.add(conf, 'simZ', 0, 24);
	simFolder.add(conf, 'walkDistance', 100, 10000);
}

function draw() {
	background(100);

	if (frameCount % 10 === 0)
		fadeSteps();

	textFont(myFont);
	textSize(14);
	fill(50);
	noStroke();

	//Тайлы
	drawTiles();
	//Агенты
	drawAgents();
	//Инфотекст
	drawInfoText();
	//Курсор
	drawCursor();

	cleanTiles();
	compileServersList();
}

function drawTiles() {
	//ТАЙЛЫ
	push();
	{
		if (isDragging) {
			let diff = new p5.Vector(mouseX, mouseY).sub(pCenter);
			translate(diff.x, diff.y);
		}
		translate(center.x, center.y);
		scale(currentScale, currentScale, 1);
		rectMode(CORNERS);
		rect(-1, -1, 1, 1);

		for (let i = 0; i < img_tiles.length; i++) {
			let n = Math.pow(2, img_tiles[i].z);
			let offset = 2 / n;
			push();
			texture(img_tiles[i].img);
			translate(img_tiles[i].x * offset - 1 + offset / 2, img_tiles[i].y * offset - 1 + offset / 2);
			translate(0, 0, img_tiles[i].z / 1000);
			plane(offset, offset);
			pop();
		}

		//Сетка градусная
		if (conf.drawGeoGrid)
			drawGeoGrid();

		//Сетка тайлов
		if (conf.drawTileGrid)
			drawTileGrid();

	}
	pop();
}

function drawAgents() {
	//АГЕНТЫ
	push();
	{
		if (isDragging) {
			let diff = new p5.Vector(mouseX, mouseY).sub(pCenter);
			translate(diff.x, diff.y);
		}
		translate(0, 0, 1);

		rectMode(CENTER)
		noStroke();

		//Отрисовка следов
		steps.forEach(step => {
			fill(step.color.levels[0], step.color.levels[1], step.color.levels[2], 100);
			let v = (step.color.levels[1] + step.color.levels[2]) / 2;
			let cs = map(v, 0, 255, conf.cellSize * conf.min_step_size, conf.cellSize * conf.max_step_size);
			cs /= 600000 / currentScale * 7; //?! почему именно  7 ?!
			let stepPos = createVector(step.x, step.y);
			let steplat = G.latDegFromY(stepPos.y, 2, conf.simZ);
			let steplon = G.lonDegFromX(stepPos.x, 2, conf.simZ);
			let stepScreen = G.geoToScreen({ lat: steplat, lon: steplon });
			conf.draw_circle_steps
				? circle(stepScreen.x, stepScreen.y, cs)
				: rect(stepScreen.x, stepScreen.y, cs);
		});

		//Отрисовка целей
		food.forEach(f => { f.draw() });

		//Отрисовка домиков
		home.forEach(h => { h.draw() });

		//Отрисовка агентов
		ants.forEach(ant => {
			//Агенты оставляют следы
			let x = round(ant.pos.x / conf.cellSize) * conf.cellSize;
			let y = round(ant.pos.y / conf.cellSize) * conf.cellSize;
			if (ant.state === STATES.SEEK)
				pushStep(x, y, color(0, 15, 0, 255));
			else if (ant.state === STATES.HOME)
				pushStep(x, y, color(0, 0, 15, 255));

			//Сами агенты
			ant.foundFood(food);
			ant.reachedHome(home);
			ant.applyFlockBehaviour(ants);
			// ant.avoidWalls(walls);
			// console.log(ant.pos.x);
			// ant.run();
			ant.update();
			let p = ant.pos.copy();
			let plat = G.latDegFromY(p.y, 2, conf.simZ);
			let plon = G.lonDegFromX(p.x, 2, conf.simZ);
			let sc = G.geoToScreen({ lat: plat, lon: plon });
			// fill(255);
			// noStroke();
			// circle(sc.x, sc.y, 10);
			push();
			translate(sc.x, sc.y);
			ant.draw();
			pop();
			fill(0);
			// text(`${p.x} ${p.y}`, sc.x, sc.y);
			// text(`${sc.x} ${sc.y}`, sc.x, sc.y+16);
		});

	}
	pop();
}

function drawCursor() {
	push();
	{
		translate(mouseX - width / 2, mouseY - height / 2);
		scale(currentScale, currentScale, 1);
		translate(0, 0, 1);
		rectMode(CENTER);
		noFill()
		stroke(150, 150, 200);
		// drawingContext.setLineDash([10,5]);
		let n = Math.pow(2, curZ);
		rectSize = 2 / n;
		rect(0, 0, rectSize, rectSize);
	}
	pop();
}

function drawInfoText() {
	//TEXT OUT
	//TODO: сделать рендер текста нормальный
	blendMode(EXCLUSION);
	push();
	{
		translate(0, 0, 1);
		let geo = G.screenToGeo();

		fill(255);
		let c = G.screenToGeo();
		let m = {};
		m.x = G.xFromLonDeg(c.x, 2, conf.simZ);
		m.y = G.yFromLatDeg(c.y, 2, conf.simZ);
		text(`${curZ} ${currentScale} ${center.x} ${center.y}`, mouseX - width / 2, mouseY - height / 2 - 8);
		text(`${c.x} ${c.y}`, mouseX - width / 2, mouseY - height / 2 + 8);
		text(`${m.x} ${m.y}`, mouseX - width / 2, mouseY - height / 2 + 24);
		fill(255, 0, 0);
		noStroke();
		circle(mouseX - width / 2, mouseY - height / 2, 6);
	}
	pop();

	blendMode(BLEND);
}



function compileServersList() {
	useServers = [];
	serverNames.forEach(server => {
		// console.log(server);
		if (server[server.name] === true) useServers.push(server.name);
	});
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseDragged() {
	if (mouseButton === RIGHT) {
		let geo = G.screenToGeo();
		getTile(G.geoToTiles(geo.x, geo.y, curZ), useServers[Math.floor(random(useServers.length))]);
	}

}

function mousePressed() {
	if (mouseButton === CENTER) {
		isDragging = true;
		pCenter.set(mouseX, mouseY);
	}
	if (mouseButton === RIGHT && keyCode === CONTROL && keyIsPressed) {
		let c = G.screenToGeo();
		let m = {};
		m.x = G.xFromLonDeg(c.x, 2, conf.simZ);
		m.y = G.yFromLatDeg(c.y, 2, conf.simZ);
		ants.push(new Ant(createVector(m.x, m.y), steps, home));
	}
	if (mouseButton === LEFT && keyCode === CONTROL && keyIsPressed) {
		let c = G.screenToGeo();
		let m = {};
		m.x = G.xFromLonDeg(c.x, 2, conf.simZ);
		m.y = G.yFromLatDeg(c.y, 2, conf.simZ);
		food.push(new Food(createVector(m.x, m.y), 500));
		console.log('food add');
	} else if (mouseButton === LEFT && keyCode === ALT && keyIsPressed) {
		let c = G.screenToGeo();
		let m = {};
		m.x = G.xFromLonDeg(c.x, 2, conf.simZ);
		m.y = G.yFromLatDeg(c.y, 2, conf.simZ);
		home.push(new Home(createVector(m.x, m.y), 300));
		for (let ant in ants) {
			ant.home = home[home.length - 1];
		}
		console.log('home add');
	} else if (mouseButton === LEFT && keyCode === SHIFT && keyIsPressed) {
		let c = G.screenToGeo();
		let m = {};
		m.x = G.xFromLonDeg(c.x, 2, conf.simZ);
		m.y = G.yFromLatDeg(c.y, 2, conf.simZ);
		let coord = createVector(m.x, m.y);
		for (let i = 0; i < food.length; i++) {
			if (coord.dist(food[i].pos) < food[i].size) {
				food.splice(i, 1);
				i--;
			}
		}
	}
}

function mouseReleased() {
	if (mouseButton === CENTER) {
		isDragging = false;
		let diff = new p5.Vector(mouseX, mouseY).sub(pCenter);
		center.add(diff);
		pCenter.set(center);
	}
}

function mouseWheel(event) {
	if(shiftKeyDown === true)
		console.log('key');
	if(shiftKeyDown === false)
		console.log('no key');
	if (event.delta < 0) {
		if (!shiftKeyDown) {
			console.log('zoom out');
			let diff = new p5.Vector(mouseX - width / 2, mouseY - height / 2).sub(center);
			diff.mult(0.5);
			center.add(diff);
		} else {
			curZ += 1;
		}
	}
	else {
		if (!shiftKeyDown) {
			console.log('zoom in');
			let diff = new p5.Vector(mouseX - width / 2, mouseY - height / 2).sub(center);
			diff.mult(1);
			center.sub(diff);
		} else {
			curZ -= 1;
		}
	}
	// let diff = center.sub(new p5.Vector(mouseX, mouseY));
	if (!shiftKeyDown) {
		currentScale *= event.delta > 0 ? 2 : 0.5;
	}
}

function keyPressed() {
	if (key === '+') {
		curZ += 1;
	}
	else if (key === '-') {
		curZ -= 1;
	}
	else if (key === 'g') {
		conf.drawGeoGrid = !conf.drawGeoGrid;
	}
	else if (key === 't') {
		conf.drawTileGrid = !conf.drawTileGrid
	}
	// console.log(key);
	if(keyCode === SHIFT)
		shiftKeyDown = true;
}

function keyReleased() {
	shiftKeyDown = false;
}