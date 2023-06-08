let view = {
	center: new p5.Vector(0, 0),
	pCenter: new p5.Vector(0, 0),
	currentScale: 1,
	isDragging: false,
}

let myShader;

let lightPos = new p5.Vector(0, 0); //положение нового источника
let lightColor = new p5.Vector(255, 255, 255); //цвет нового источника
let lightRendered = []; //массив созданных изображений
let blocks = []; //массив блоков, создающих тени
let litG, maskG, objG; //объекты для внеэкранного рисования
let lightShader, maskShader; //шейдеры
//Вспомогательные переменные для расчета теней
let cur;
let next;
let edge;
let norm;
let lightDir;
let shadow_cur;
let shadow_next;

function s2w(pt) {
	let wPt = pt.copy();
	wPt.sub(view.center);
	wPt.mult(1 / view.currentScale);
	return wPt;
}

function preload() {
	myFont = loadFont('./assets/Roboto-Regular.ttf');
	myShader = loadShader('./assets/vert.glsl', './assets/frag.glsl');
	lightShader = loadShader("./assets/lightVert.glsl", "./assets/lightFrag.glsl");
	maskShader = loadShader("./assets/maskVert.glsl", "./assets/maskFrag.glsl");
}

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	// ortho();
	// view.center.set(width / 2, height / 2);
	// view.pCenter.set(view.center);

	// size(400, 400, P2D);
	litG = createGraphics(windowWidth, windowHeight, WEBGL);
	maskG = createGraphics(windowWidth, windowHeight, WEBGL);
	objG = createGraphics(windowWidth, windowHeight, WEBGL);
	lightPos = new p5.Vector(0, 0);
	lightColor = new p5.Vector(255, 255, 220);
	lightShader.setUniform("lightColor", lightColor.x, lightColor.y, lightColor.z);
	lightRendered = [];
	//Вспомогательные переменные для расчета теней
	cur = new p5.Vector();
	next = new p5.Vector();
	edge = new p5.Vector();
	norm = new p5.Vector();
	lightDir = new p5.Vector();
	shadow_cur = new p5.Vector();
	shadow_next = new p5.Vector();
	let blockNums = 5;
	for (let i = 0; i < blockNums; i++) {
		for (let j = 0; j < blockNums; j++) {
			blocks.push(new Block(width / (blockNums+1) * (i + 1) - 20 - width/2, height / (blockNums+1) * (j + 1) - 20 - height/2, 40, 40));
		}
	}
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	background(100);

	push();
	translate(-width / 2, -height / 2);

	updateMask(); //расчет теней
	updateObj(); //расчет освещения и совмещение с тенями
	
	blendMode(SCREEN); //режим смешения SCREEN
	// image(litG, 0, 0); //отображение внеэкранного изображения
	image(objG, 0, 0); //отображение внеэкранного изображения
	// image(maskG, 0, 0); //отображение внеэкранного изображения
	for (let i = 0; i < lightRendered.length; i++) {
		image(lightRendered[i], 0, 0); //отображение кэшированных изображений
	}
	pop();
	// image(litG, 0, 0); //отображение внеэкранного изображения
	// circle(lightPos.x, lightPos.y, 10);
	
	blendMode(BLEND); //режим смешения BLEND, для полного перекрытия
	fill(0); //цвет блоков
	for (let i = 0; i < blocks.length; i++) {
		beginShape(QUADS);
		for (let c = 0; c < blocks[i].corners.length; c++) {
			vertex(blocks[i].corners[c].x, blocks[i].corners[c].y);
		}
		endShape();
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
	}
	//При каждом нажатии мышки добавляем текущее...
	//...положение источника в память
	lightRendered.push(objG.get());
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
		console.log('up');
	}
	else {
		let diff = new p5.Vector(mouseX, mouseY).sub(view.center);
		view.center.sub(diff);
		console.log('down');
	}
	view.currentScale *= event.delta > 0 ? 2 : 0.5;
}

function keyPressed() {
	if (key == ' ') { //Пробел - удаляет все источники
		lightRendered = [];
	} else if (key == 'w') { //белый цвет источника
		lightColor.x = 255;
		lightColor.y = 255;
		lightColor.z = 255;
	} 
}

function updateMask() {
	maskG.background(255);
	for (let j = 0; j < blocks.length; j++) {
		for (let k = 0; k < blocks[j].corners.length; k++) {
			cur.set(blocks[j].corners[k]);
			next.set(blocks[j].corners[(k + 1) % blocks[j].corners.length]);
			edge.set(next);
			edge.sub(cur);
			norm.set(edge.y, -edge.x);
			lightDir.set(lightPos);
			lightDir.sub(cur);
			if (norm.dot(lightDir) > 0) {
				edge.set(cur);
				edge.sub(lightPos);
				edge.normalize();
				edge.mult(10000);
				shadow_cur.set(cur);
				shadow_cur.add(edge);
				edge.set(next);
				edge.sub(lightPos);
				edge.normalize();
				edge.mult(10000);
				shadow_next.set(next);
				shadow_next.add(edge);
				maskG.beginShape(QUADS);
				maskG.noStroke();
				maskG.fill(10, 10, 50);
				maskG.vertex(next.x, next.y);
				maskG.vertex(cur.x, cur.y);
				maskG.fill(80, 80, 150);
				maskG.vertex(shadow_cur.x, shadow_cur.y);
				maskG.vertex(shadow_next.x, shadow_next.y);
				maskG.endShape();
			}
		}
	}
	// mask.endDraw();
}

function updateObj() {
	

	
		//расчет освещенности
		litG.background(0);
		litG.shader(lightShader);
		lightShader.setUniform('light_pos', [lightPos.x+width/2, height - lightPos.y-height/2]);
		lightShader.setUniform("lightColor", [lightColor.x, lightColor.y, lightColor.z]);
		
		litG.rect(0, 0, width, height);

		//смешение с тенями
		objG.shader(maskShader);
		maskShader.setUniform("light", litG);
		maskShader.setUniform("mask", maskG);
		maskShader.setUniform("u_resolution", [width, height]);
		objG.rect(0, 0, width, height);
	
}

function mouseMoved() {
	//обновление текущего положения источника
	lightPos.set(mouseX-width/2, mouseY-height/2);
}

class Block {
	constructor(x, y, width, height) {
		//Конструктор, который принимает четыре параметра:
		//положение верхнего левого угла, ширину и высоту
		this.corners = []; //вершины блока
		this.corners.push(new p5.Vector(x, y));
		this.corners.push(new p5.Vector(x + width, y));
		this.corners.push(new p5.Vector(x + width, y + height));
		this.corners.push(new p5.Vector(x, y + height));
	}
}