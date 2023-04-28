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

let currentScale = 300;

function setup() {
	createCanvas(windowWidth, windowHeight);
	// getImage();
}

function draw() {
	background(100);

	fill(50);
	noStroke();

	push();
		translate(width / 2, height / 2);
		scale(currentScale);
		rectMode(CORNERS);
		rect(-1, -1, 1, 1);

		for(let i = 0; i < img_tiles.length; i++) {
			// image(img_tiles[i].img, 1, -1, 0.5, 0.5);
			let n = Math.pow(2, img_tiles[i].z);
			let offset = 2/n;
			image(img_tiles[i].img, img_tiles[i].x * offset -1, img_tiles[i].y * offset-1, offset, offset);
		}
	pop();
	
	let x = constrain(map(mouseX, width/2-currentScale, width/2 + currentScale, -1, 1), -1, 1) * 180;
	let y = constrain(map(mouseY, height/2-currentScale, height/2 + currentScale, 1, -1), -1, 1) * 90	;
	fill(255);
	text(`${Math.floor(x)} ${Math.floor(y)} \n\n ${img_tiles.length}`, mouseX, mouseY);
	// let tiles = geoToTiles(x, y, 2);
	// console.log(tiles);
	// console.log(geoToTiles(x, y, 1));
	// text(`${tiles.xTiles} ${tiles.yTiles}`, mouseX, mouseY + 20);
	// ellipse(mouseX, mouseY, 21, 21);
	cleanTiles();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseDragged() {
	let x = constrain(map(mouseX, width/2-currentScale, width/2 + currentScale, -1, 1), -1, 1) * 180;
	let y = constrain(map(mouseY, height/2-currentScale, height/2 + currentScale, 1, -1), -1, 1) * 90	;
	let zoom = Math.floor(random(6, 12));
	getTile(geoToTiles(x, y, zoom))
	// console.log(x, y);
}

function mouseWheel(event) {
	currentScale += event.delta * 2;
}

function getImage(z, x, y) {
	let img = new Image();
	img.src = `https://a.tile.osm.org/${z}/${x}/${y}.png`;
	loadImage(img.src, image => {
		// state.imgs.push(image);
		// state.imgLoaded = true;
		// console.log(state);	
		img_tiles.push(new Tile(image, z, x, y));
		sortTiles();
	});
}

function sortTiles() {
	img_tiles.sort(function(a, b) { return a.z - b.z;})
}

function getTile({xTile, yTile, zoom}) {
	let download = true;
	for(let i = 0; i < tile_queue.length; i++) {
			if(tile_queue[i].z == zoom && tile_queue[i].x == xTile && tile_queue[i].y == yTile) {
				download = false;
				break;
			}
	}
	if(download) {
		tile_queue.push(new TileQueue(zoom, xTile, yTile));
		getImage(zoom, xTile, yTile);
		// let img = new Image();
		// let rand = Math.random();
		// let s = rand > 0.33 ? (rand > 0.66 ? 'c' : 'b') : 'a' ;
		
		// img.src = `http://${s}.basemaps.cartocdn.com/dark_all/${zoom}/${xTile}/${yTile}.png`;
		// console.log(img.src);
	}
}

function cleanTiles() {
	for(let i = 0; i < img_tiles.length; i++) {
		for(let j = i+1; j < img_tiles.length; j++) {
			if(img_tiles[i].z == img_tiles[j].z && img_tiles[i].x == img_tiles[j].x && img_tiles[i].y == img_tiles[j].y) {
				img_tiles.splice(j, 1);
				j--;
			}
		}
	}
}