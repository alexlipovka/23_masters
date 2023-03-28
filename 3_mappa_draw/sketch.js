// Объект карты
let myMap;
// Холст p5js
let canvas;
// Объект mappa
const mappa = new Mappa('Leaflet');
// Дополнительные настройки карты (координаты центра, масштаб, сервер)
const options = {
	lat: 56,
	lng: 93,
	zoom: 12,
	// style: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'

	// style: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
	style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png'
	// style: 'http://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'

	// style: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
	// style: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png'
	// style: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png'
};

class tileObj {
	constructor(index, width, height, color, posx, posy) {
		this.index = index;
		this.width = width;
		this.height = height;
		this.color = color;
		this.posx = posx;
		this.posy = posy;
	}

}

let objs = [];

let canvasPos = [0, 0];
let zoomPos = [0, 0];
let gridTransform = [];
let tileNum = 0;
let tileColors = [];

let tiles = [];

// Настройка приложения
// Данная функция будет выполнена первой и только один раз
function setup() {
	canvas = createCanvas(windowWidth, windowHeight);

	myMap = mappa.tileMap(options);

	myMap.overlay(canvas);
	myMap.onChange(onChangedMap);
}

// Основная функция отрисовки
// Выполняется 60 раз в секунду (как правило)
function draw() {
	// background(100);
	clear();
	drawGrid();
	// objs.forEach(element => {
	// 	let pt = myMap.latLngToPixel(element);
	// 	ellipse(pt.x, pt.y, 15, 15);
	// });

	for (let i = 0; i < objs.length; i++) {
		fill(255. / objs.length * i, 0, 0);
		let pt = myMap.latLngToPixel(objs[i]);
		ellipse(pt.x, pt.y, 3 + 5 * i, 3 + 5 * i);
	}


	ellipse(mouseX, mouseY, 51, 51);
}

// Вспомогательная функция, которая реагирует на изменения размера
function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
	myMap.mappaDiv.style.width = windowWidth + 'px';
	myMap.mappaDiv.style.height = windowHeight + 'px';
}

function mouseClicked() {
	if (keyIsPressed === true && keyCode === CONTROL) {
		objs.push(myMap.pixelToLatLng(mouseX, mouseY));
	}
}

function mouseDragged() {
}

function onChangedMap() {
	tiles = [];
	// console.log('onChangedMap')
	const regex = /translate\(([-\d]+)px,\s+([-.\d]+)px\)/;
	const regex3d = /translate3d\(([-\d]+)px,\s+([-.\d]+)px,\s+([-.\d]+)px\)/;

	let zooms = selectAll('.leaflet-zoom-animated').length;
	let curZoom = 0;
	for (let i = 0; i < zooms; i++) {
		curZoom = selectAll('.leaflet-zoom-animated')[i].elt.childElementCount > 0 ? i : curZoom;
		// console.log(curZoom);
	}
	let zt = selectAll('.leaflet-zoom-animated')[curZoom].elt.style.transform;
	let zoomTrans = zt.match(regex3d);
	zoomPos[0] = zoomTrans[1];
	zoomPos[1] = zoomTrans[2];
	// tileNum = selectAll('.leaflet-tile-loaded').length;
	tileNum = selectAll('.leaflet-zoom-animated')[curZoom].length;
	let t = select('#defaultCanvas0').elt.style.transform;
	const matches = t.match(regex);
	let mp = select('.leaflet-map-pane').elt.style.transform;
	const matches3d = mp.match(regex3d);
	let imgs = document.getElementsByTagName("img");
	gridTransform = [];
	tileColors = [];
	for (let i = 0; i < imgs.length; i++) {
		let gt = imgs[i].style.transform.match(regex3d);
		gridTransform.push([gt[1], gt[2]]);
		tileColors.push([0, 0, 0, 0]);
		
		var img = new Image();
		img.src = imgs[i].src;
		loadImage(img.src, image => {
			var pixels = image.loadPixels();
			for(let j = 0; j < tiles.length; j++) {
				if(tiles[j].index == i) {
					tiles[j].color = image.get(127, 127);
				}
			}
		});	
		tiles.push(new tileObj(i, 256, 256, [100, 100, 100, 0], gt[1], gt[2]));
		// ctx = imgs[i].getContext('2d');
	}


	if (matches3d) {
		canvasPos[0] = matches3d[1];
		canvasPos[1] = matches3d[2];
	}
	// drawGrid();
	// console.log(matches);
	// console.log(matches3d);
	redraw();
}

function drawGrid() {
	// console.log('drawGrid');
	push();
	translate(Number(canvasPos[0]), Number(canvasPos[1]));
	push();
	translate(Number(zoomPos[0]), Number(zoomPos[1]));
	textSize(12);

	// for (let i = 0; i < gridTransform.length; i++) {
	for (let i = 0; i < tiles.length; i++) {
		push();
		translate(Number(tiles[i].posx), Number(tiles[i].posy));
		fill(0, 0, 150);
		let textC = i + ' x' + tiles[i].posx + ' y' + tiles[i].posy + '\n' + 'x' + canvasPos[0] + ' y' + canvasPos[1];
		text(textC, 20, 20);
			fill(tiles[i].color[0], tiles[i].color[1], tiles[i].color[2], 200);
		rect(0, 0, 256, 256);
		pop();
	}

	pop();
	pop();
}