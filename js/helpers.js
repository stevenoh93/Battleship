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