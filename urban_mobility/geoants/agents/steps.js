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
		if(red === 0 && green === 0 && blue === 0) {
			// console.log(`removing step ${i}`);
			steps.splice(i, 1);
			// i--;
		}
	}
}