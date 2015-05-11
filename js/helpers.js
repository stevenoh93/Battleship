function clickPlay() {
	gameInProgress = true;
	document.getElementById("enterpos").style.display = "none";
	document.getElementById("entermove").style.display = "inline";
}

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
		var length = ey - sy;
		if (length > 0) length++; else length--;
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

var aiPrevMove = [];
var aiFirstHit = [];
var aiDir = 0; // -1 -> -x, 1 -> +x, -2 -> -y, 2 -> +y, 0 -> miss
var aiLen = 0;

function makeMove(event) {
	if (!gameInProgress && event.keyCode == 13) { // Ship positioned
		var input = document.getElementById("pos");
		var value = input.value;
		input.value = "";
		var points = value.split(" ");
		var start = string2xy(points[0]);
		var end = string2xy(points[1]);
		if (start[0]>end[0] || start[1]>end[1]) {
			var temp = end;
			end = start;
			start = temp;
		}
		var length = Math.max(Math.abs(start[0]-end[0]), Math.abs(start[1]-end[1]));
		switch (length) {
			case 1:
				textureAndAdd(smallShipShape, extrudeSettings, start[0],end[0], start[1],end[1], -1);
				break;
			case 2:
				textureAndAdd(medShipShape, extrudeSettings, start[0],end[0], start[1],end[1], -1);
				break;
			case 3:
				textureAndAdd(largeShipShape, extrudeSettings, start[0],end[0], start[1],end[1], -1);
				break;
		}
	}
	if (gameInProgress && event.keyCode == 13) { // Move made
		var input = document.getElementById("move");
		var value = input.value;
		input.value = "";

		var point = string2xy(value);

		if (processHit(point[0],point[1],1)) {
			// Display hit
			console.log("HIT");
			gameInProgress = !checkGameOver();
		}
		else {
			// AI move
			var hit = true;
			while (hit) {
				var curMove = [0,0];
				if (aiPrevMove.length == 0) // First move
					curMove = randomMove();
				else if (aiDir != 0) { // If a direction is defined
					switch (aiDir) {
						case -2:
							curMove[1] = (aiFirstHit[1]-aiLen)%10;
							curMove[0] = aiFirstHit[0];
							break;
						case 2:
							curMove[1] = (aiFirstHit[1]+aiLen)%10;
							curMove[0] = aiFirstHit[0];
							break;
						case -1:
							curMove[0] = (aiFirstHit[0]-aiLen)%10;
							curMove[1] = aiFirstHit[1];
							break;
						case 1:
							curMove[0] = (aiFirstHit[0]+aiLen)%10;
							curMove[1] = aiFirstHit[1];
							break;
					}
				} else // No direction
					curMove = randomMove();


				if (processHit(curMove[0],curMove[1],-1)) { // Hit a ship
					console.log("HIT");
					aiLen++;
					hit = true;
					gameInProgress = !checkGameOver();
					if (aiDir == 0) { // Hit a new ship
						aiFirstHit = curMove;
						if (curMove[1] == 9)
							if (curMove[0] == 0)
								aiDir = 1;	
							else
								aiDir = -1;
						else
							aiDir = -2;
					} 

					if (aiLen > 3) // Finished a ship
						aiDir = 0; 

					if ((curMove[1]==9)&&(aiDir==-2) || (curMove[0]==0)&&(aiDir==-1) || (curMove[1]==0)&&(aiDir==2) || (curMove[0]==9)&&(aiDir==1)) {
						curMove = randomMove();
						aiDir = 0;
						aiLen = 0;
					}
					aiPrevMove = curMove;	
				} else { // Missed
					hit = false;
					if (aiDir != 0) { // If ship was hit before this move
						aiDir++;
						if (aiDir == 0) aiDir++;
						if (aiDir == 3) {
							aiDir = 0;
							aiLen = 0;
						}
					} else
						aiPrevMove = curMove;	
				}
			}
		}
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
	if (shipLoc[x][y] && hit[x][y]) { // Ship hit
		shipLoc[x][y] = false;
		waters[lin].material.materials[4].color.setHex(0xff0000);
		if (side < 0)
			pShipCount--;
		else
			aShipCount--;
		return true;
	}
	waters[lin].material.materials[4].color.setHex(0x0000ff);
	return false;
}

function checkGameOver() {
	if (aShipCount == 0) {
		// Player wins
		console.log("Player wins");
		document.getElementById("winmessage").style.display="inline";
		return true;
	} else if (pShipCount == 0) {
		// Player loses
		console.log("Player loses");
		document.getElementById("lostmessage").style.display="inline";
		return true;
	}
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

function string2xy(value) {
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
	return [x, y];
}

function randomMove() {
	var	x = Math.floor(Math.random()*10);
	var	y = Math.floor(Math.random()*10);
	while (pHit[x][y]) {
		y = Math.round((y+Math.random())) % 10;
		x = Math.round((x+Math.random())) % 10;
	}
	return [x,y];
}