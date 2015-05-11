// Create axis (point1, point2, colour)
function createAxis(p1, p2, color){
    var line, lineGeometry = new THREE.Geometry(),
    lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 5});
    lineGeometry.vertices.push(p1, p2);
    line = new THREE.Line(lineGeometry, lineMat);
    scene.add(line);
}

// Convert board coordinates to canvas coordinates
// Board coordinates range 0-9 starting 2nd quad
// canvas coordinates range -100-100
// side=-1 for player's board, 1 for ai's board
function board2canvas(sx, sy, ex, ey, side) {
	if (sx == ex) {
		var length = Math.abs(ey - sy) + 1;
		return {
			xcoord : (sx*20+10) - 100 + side*200,
			ycoord : 100 - (sy*20 + 10*length),
			rot : 0
		};
	} else { 
		var length = Math.abs(ex - sx) + 1;
		return {
			xcoord : (sx*20+10*length) - 100 + side*200,
			ycoord : 100 - (sy*20+10),
			rot : Math.PI / 2
		};
	}
}

// side=-1 for player's board, 1 for ai's board
function xy2lin(xcoord, ycoord, side) {
	lin = xcoord*16+60 - ycoord;
	if (side > 0)
		lin += 320;
	return lin;
}

function makeMove(event) {
	if (event.keyCode == 13) { // Enter
		var input = document.getElementById("move");
		var value = input.value;
		input.value = "";

		if (isNaN(value[0])) {
			var x = parseInt(value[1]);
			if (value[0].charCodeAt(0) > 96)
				var y = value[0].charCodeAt(0) - 97;
			else	
				var y = value[0].charCodeAt(0) - 65;
		} else {
			if (value[1].charCodeAt(0) > 96)
				var y = value[1].charCodeAt(0) - 97;
			else	
				var y = value[1].charCodeAt(0) - 65;
			var x = parseInt(value[0]);			
		}
		console.log("("+x+", "+y+")");
		if (processHit(x,y,1))
			console.log("HIT");//Display hit
	}
}

function processHit(x, y, side) {
	var shipLoc, hit;
	if (side > 0) {
		shipLoc = aShipLoc;
		hit = aHit;
	}
	else {
		shipLoc = pShipLoc;
		hit = pHit;
	}
	var lin = xy2lin(x, y, side);
	hit[x][y] = true;
	// console.log("shipLoc: \n");
	// printMatrix(shipLoc);
	// console.log("hit: \n");
	// printMatrix(hit);
	if (shipLoc[x][y] && hit[x][y]) { // Ship hit
		shipLoc[x][y] = false;
		waters[lin].material.materials[4].color.setHex(0xff0000);
		return true;
	}
	waters[lin].material.materials[4].color.setHex(0x0000ff);
	return false;
}

function printMatrix(mat) {
	var out = ""
	for (var i=0; i<mat.length; i++) {
		for (var j=0; j<mat[i].length; j++)
			out += mat[i][j] + ", ";
		console.log(out);
		out = "";
	}
}