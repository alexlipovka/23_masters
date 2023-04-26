let state = {
	zoom: 0,
	imgs: [],
	imgLoaded: false,
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	getImage();
}

function draw() {
	background(100);

	fill(50);
	noStroke();

	push();
		translate(width / 2, height / 2);
		scale(300);
		rectMode(CORNERS);
		rect(-1, -1, 1, 1);

		if (state.imgLoaded) {
			image(state.imgs[0], -1, -1, 2, 2);
		}
	pop();
	
	ellipse(mouseX, mouseY, 21, 21);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function getImage() {
	let img = new Image();
	img.src = "https://a.tile.osm.org/0/0/0.png";
	loadImage(img.src, image => {
		state.imgs.push(image);
		state.imgLoaded = true;
		console.log(state);		
	});
}