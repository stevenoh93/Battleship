var camera;
var renderer;
var scene;
var pivot;
var cameraControls;

var waters = [];

var boardGroup;

var pHit = [];
var pShipLoc = [];
var aShipLoc = [];
var aHit = [];
var pShipCount = 0;
var aShipCount = 0;
var gameInProgress = false;


var smallShipShape, medShipShape, largeShipShape;
var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

function init() {
	var innerWidth = window.innerWidth;
	var innerHeight = window.innerHeight;
	var aspectRatio = innerWidth / innerHeight;

	// Renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x111111 );
	renderer.setSize( innerWidth, innerHeight );

	// Camera
	camera = new THREE.PerspectiveCamera( 50, aspectRatio, 0.1, 10000 );
	camera.position.set( 0, -200, 400 );
	camera.up = new THREE.Vector3(0,0,1);
	// camera.lookAt(new THREE.Vector3(-100,0,500));

	// CameraControls
	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );

	// Game logic
	for (var i=0; i<10; i++) {
		var row1 = [];
		for (var j=0; j<10; j++) {
			row1.push(false);
		}
		pHit.push(row1);

		var row2 = [];
		for (var j=0; j<10; j++) {
			row2.push(false);
		}
		aHit.push(row2);

		var row3 = [];
		for (var j=0; j<10; j++) {
			row3.push(false);
		}
		aShipLoc.push(row3);
		
		var row4 = [];
		for (var j=0; j<10; j++) {
			row4.push(false);
		}
		pShipLoc.push(row4);
	}

	boardGroup = new THREE.Group();
	
	var container = document.getElementById( "container" );
	container.appendChild( renderer.domElement );    

	// Input handle
	window.addEventListener("keydown", makeMove, false);
	document.getElementById("submit").onclick = clickPlay;
}

function drawScene() {
	scene = new THREE.Scene();
	
	var ambientLight = new THREE.AmbientLight( 0xFFFFFF );
	var pointLight = new THREE.PointLight( 0xFFFFFFF, 1, 100 );
	pointLight.position.set(0, -200, 400);
	scene.add( ambientLight );
	scene.add( pointLight );

	makeBackground();
	makeShips();
	// Draw waters
	for (var i=0; i<waters.length; i++) {
		scene.add( waters[i] );
	}
	scene.add( boardGroup );

	textureAndAdd( smallShipShape, extrudeSettings, 4,4, 1,2, 1 );
	textureAndAdd( medShipShape, extrudeSettings, 6,8, 4,4, 1 );
	textureAndAdd( largeShipShape, extrudeSettings, 0,0, 6,9, 1 );
	textureAndAdd( smallShipShape, extrudeSettings, 4,4, 1,2, -1 );
	textureAndAdd( medShipShape, extrudeSettings, 6,8, 4,4, -1 );
	textureAndAdd( largeShipShape, extrudeSettings, 0,0, 6,9, -1 );
	textureAndAdd( largeShipShape, extrudeSettings, 1,1, 6,9, -1 );
	textureAndAdd( largeShipShape, extrudeSettings, 2,2, 6,9, -1 );
	textureAndAdd( largeShipShape, extrudeSettings, 3,3, 6,9, -1 );
	
	// debugaxis(1000);
}

function animate() {
	window.requestAnimationFrame( animate );
	render();
}

function render() {
	cameraControls.update(  );	
	renderer.render(scene, camera);
}

function makeBackground() {
	var boxGeo = new THREE.BoxGeometry( 20, 20, 10 );
	var texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 1 );
	
	var transparent = new THREE.MeshPhongMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0,
		specular: 0xffffff
	});
	
	for (var i=-17; i<=18; i++) {
		for (var j=-7; j<=8; j++) {
			var boxMaterial = new THREE.MeshPhongMaterial({
				map:texture,
				transparent: true, 
				opacity: 0.5, 
			});
			var materials = [transparent, transparent, transparent, transparent, boxMaterial, boxMaterial];
			if (i==-17)
				materials[1] = boxMaterial;
			if (j==-7)
				materials[3] = boxMaterial;
			if (j==8)
				materials[2] = boxMaterial;
			if (i==18)
				materials[0] = boxMaterial;
			var boxFaceMaterials = new THREE.MeshFaceMaterial( materials );
			var box = new THREE.Mesh( boxGeo, boxFaceMaterials );
			box.position.set(i*20-10, j*20-10, 0);
			waters.push( box );
		}
	}

	// Make grid
	for (var i=-10; i<=10; i+=2) {
		createAxis( new THREE.Vector3( i*10 + 200, 100, 5 ), new THREE.Vector3( i*10 + 200, -100, 5 ), 0xffffff);
		createAxis( new THREE.Vector3( 300, i*10, 5 ), new THREE.Vector3( 100, i*10, 5 ), 0xffffff);
		createAxis( new THREE.Vector3( i*10 - 200, 100, 5 ), new THREE.Vector3( i*10 - 200, -100, 5 ), 0xffffff);
		createAxis( new THREE.Vector3( -300, i*10, 5 ), new THREE.Vector3( -100, i*10, 5 ), 0xffffff);
	}

	// Add grid label
	// ys are numbers 0-9, xs are alphabets a-j
	var textMaterial = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, overdraw: 0.5} );
	var textSettings = {
			size: 18,
			height: 5,
			curveSegments: 2,
			font: "helvetiker"
		}
	for (var i=0; i<10; i++) {
		var numsGeo = new THREE.TextGeometry( i.toString(), textSettings);
		var alphGeo = new THREE.TextGeometry( String.fromCharCode(65+i), textSettings );
		var text1 = new THREE.Mesh( numsGeo, textMaterial );
		var text2 = new THREE.Mesh( numsGeo, textMaterial );
		var text3 = new THREE.Mesh( alphGeo, textMaterial );
		var text4 = new THREE.Mesh( alphGeo, textMaterial );
		text1.position.set( -300 + i*20 + 2, 100, 1 );
		scene.add( text1 );
		text2.position.set( 100 + i*20, 100, 1 );
		scene.add( text2 );
		text3.position.set( -99, 80 - i*20 - 1, 1 );
		scene.add( text3 );
		text4.position.set( 81, 80 - i*20 - 1, 1 );
		scene.add( text4 );
	}
}

// ex and ey must be >= sx and sy respectively
function textureAndAdd(shape, extrudeSettings, sx, ex, sy, ey, side) {
	var coords = board2canvas(sx,sy, ex,ey, side);
	if (sx != ex) {
		if (side < 0)	
			for (var i=0; i<ex-sx+1; i++) {
				pShipLoc[sx+i][sy] = true;
				pShipCount++;
			}
		else
			for (var i=0; i<ex-sx+1; i++) {
				aShipLoc[sx+i][sy] = true;
				aShipCount++;
			}
	} else {
		if (side < 0)	
			for (var i=0; i<ey-sy+1; i++){
				pShipLoc[sx][sy+i] = true;
				pShipCount++;
			}
		else
			for (var i=0; i<ey-sy+1; i++) {
				aShipLoc[sx][sy+i] = true;
				aShipCount++;
			}
	}
	if (side < 0) {
		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		var texture = new THREE.ImageUtils.loadTexture( "textures/ship_side.jpg" );
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		texture.minFilter = THREE.NearestFilter;
		var material = new THREE.MeshBasicMaterial({
			map:texture,
			side:THREE.TopSide
		});
		// var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, new     THREE.MeshBasicMaterial({
		//     color: 0x000000,
		//     wireframe: true,
		//     transparent: true
		// })]);
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( coords.xcoord, coords.ycoord, 1 );
		mesh.rotation.z = coords.rot;
		boardGroup.add( mesh );
	}
}


var debugaxis = function(axisLength){
	//Shorten the vertex function
	function v(x,y,z){
			return new THREE.Vector3(x,y,z);
	}
   
	createAxis(v(0, 0, 0), v(axisLength, 0, 0), 0xFF0000);
	createAxis(v(0, 0, 0), v(0, axisLength, 0), 0x00FF00);
	// createAxis(v(0, 0, 0), v(0, 0, axisLength), 0x0000FF);
};


function makeShips() {
	// Small ship
	var smallShipPts = [];
	smallShipPts.push( new THREE.Vector2 ( 0, 18 ) );
	smallShipPts.push( new THREE.Vector2 ( -7, 10 ) );
	smallShipPts.push( new THREE.Vector2 ( -7, -10 ) );
	smallShipPts.push( new THREE.Vector2 ( 0, -18 ) );
	smallShipPts.push( new THREE.Vector2 ( 7, -10 ) );
	smallShipPts.push( new THREE.Vector2 ( 7, 10 ) );
	smallShipShape = new THREE.Shape( smallShipPts );
	// textureAndAdd( smallShipShape, extrudeSettings, 1,1, 1,2, -1 );

	// Medium ship
	var medShipPts = [];
	medShipPts.push( new THREE.Vector2 ( 4, 28 ) );
	medShipPts.push( new THREE.Vector2 ( -4, 28 ) );
	medShipPts.push( new THREE.Vector2 ( -7, 15 ) );
	medShipPts.push( new THREE.Vector2 ( -7, 0 ) );
	medShipPts.push( new THREE.Vector2 ( -7, -15 ) );
	medShipPts.push( new THREE.Vector2 ( -4, -28 ) );
	medShipPts.push( new THREE.Vector2 ( 4, -28 ) );
	medShipPts.push( new THREE.Vector2 ( 7, -15 ) );
	medShipPts.push( new THREE.Vector2 ( 7, 15 ) );
	medShipShape = new THREE.Shape( medShipPts );
	// textureAndAdd( medShipShape, extrudeSettings, 6,6, 8,6, -1 );

	// Large ship
	var largeShipPts = [];
	largeShipPts.push( new THREE.Vector2 ( 3, 38 ) );
	largeShipPts.push( new THREE.Vector2 ( -3, 38 ) );
	largeShipPts.push( new THREE.Vector2 ( -5, 33 ) );
	largeShipPts.push( new THREE.Vector2 ( -7, 20 ) );
	largeShipPts.push( new THREE.Vector2 ( -7, -20 ) );
	largeShipPts.push( new THREE.Vector2 ( -5, -33 ) );
	largeShipPts.push( new THREE.Vector2 ( -3, -38 ) );
	largeShipPts.push( new THREE.Vector2 ( 3, -38 ) );
	largeShipPts.push( new THREE.Vector2 ( 5, -33 ) );
	largeShipPts.push( new THREE.Vector2 ( 7, -20 ) );
	largeShipPts.push( new THREE.Vector2 ( 7, 20 ) );
	largeShipPts.push( new THREE.Vector2 ( 5, 33 ) );
	largeShipShape = new THREE.Shape( largeShipPts );
	// textureAndAdd( largeShipShape, extrudeSettings, 3,3, 6,3, -1);
}
