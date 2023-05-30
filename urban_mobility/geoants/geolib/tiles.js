function getImage(z, x, y, serverName = 'osm') {
	let img = new Image();

	img.src = getWMTS(x, y, z, serverName);

	loadImage(img.src, image => {
		img_tiles.push(new Tile(image, z, x, y));
		sortTiles();
	});
}

function sortTiles() {
	img_tiles.sort(function (a, b) { return a.z - b.z; })
}

function getTile({ xTile, yTile, zoom }, serverName = 'osm') {
	let download = true;
	for (let i = 0; i < tile_queue.length; i++) {
		if (tile_queue[i].z == zoom && tile_queue[i].x == xTile && tile_queue[i].y == yTile) {
			download = false;
			break;
		}
	}
	if (download) {
		tile_queue.push(new TileQueue(zoom, xTile, yTile));
		getImage(zoom, xTile, yTile, serverName);
	}
}

function cleanTiles() {
	for (let i = 0; i < img_tiles.length; i++) {
		for (let j = i + 1; j < img_tiles.length; j++) {
			if (img_tiles[i].z == img_tiles[j].z && img_tiles[i].x == img_tiles[j].x && img_tiles[i].y == img_tiles[j].y) {
				img_tiles.splice(j, 1);
				j--;
			}
		}
	}
}