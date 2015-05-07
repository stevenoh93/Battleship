var camera;
var renderer;
var scene;
var pivot;
var cameraControls;

var waters = [];

var group;

function init() {
	var innerWidth = window.innerWidth;
    var innerHeight = window.innerHeight;
    var aspectRatio = innerWidth / innerHeight;

    //Renderer:
	renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x111111 );
    renderer.setSize( innerWidth, innerHeight );

    //Camera:
    camera = new THREE.PerspectiveCamera( 40, aspectRatio, 0.1, 10000 );
    camera.position.set( 0, -200, 400 );
    camera.up = new THREE.Vector3(0,0,1);
    camera.lookAt(new THREE.Vector3(0,0,0));

    //CameraControls:
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );

    group = new THREE.Group();
    // group.position.y=50;
	
	var container = document.getElementById( "container" );
    container.appendChild( renderer.domElement );    
}

function drawScene() {
    scene = new THREE.Scene();
	
    var ambientLight = new THREE.AmbientLight( 0xFFFFFF );
	scene.add( ambientLight );

	makeBackground();
	makeShips();
    // Draw waters
	for (var i=0; i<27; i++) {
		scene.add( waters[i] );
	}

	scene.add( group );
    
    debugaxis(1000);
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
    var boxGeo = new THREE.BoxGeometry( 200, 200, 10 );
    var texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );
    var boxMaterial = new THREE.MeshBasicMaterial({
        map:texture,
        side:THREE.DoubleSide,
        transparent: true, 
        opacity: 0.5, 
        color: 0xFFFFFF
    });
	for (var i=-1; i<=1; i++) {
        for (var j=-1; j<=1; j++) {
            var box = new THREE.Mesh( boxGeo, boxMaterial );
            box.position.set(i*200, j*200, 0);
    		waters.push( box );
        }
	}

	// Make grid
	for (var i=-10; i<=10; i+=2) {
		createAxis( new THREE.Vector3( i*10, 100, 0 ), new THREE.Vector3( i*10, -100, 0 ), 0x000000);
		createAxis( new THREE.Vector3( 100, i*10, 0 ), new THREE.Vector3( -100, i*10, 0 ), 0x000000);
	}
	
}

function makeShips() {
	var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

	// Small ship
	var smallShipPts = [];
	smallShipPts.push( new THREE.Vector2 ( 0, 20 ) );
	smallShipPts.push( new THREE.Vector2 ( -8, 10 ) );
	smallShipPts.push( new THREE.Vector2 ( -8, -10 ) );
	smallShipPts.push( new THREE.Vector2 ( 0, -20 ) );
	smallShipPts.push( new THREE.Vector2 ( 8, -10 ) );
	smallShipPts.push( new THREE.Vector2 ( 8, 10 ) );
	var smallShipShape = new THREE.Shape( smallShipPts );
	textureAndAdd( smallShipShape, extrudeSettings, 0, -50, 1 );

	// Medium ship
	var medShipPts = [];
	medShipPts.push( new THREE.Vector2 ( 4, 30 ) );
	medShipPts.push( new THREE.Vector2 ( -4, 30 ) );
	medShipPts.push( new THREE.Vector2 ( -8, 15 ) );
	medShipPts.push( new THREE.Vector2 ( -8, 0 ) );
	medShipPts.push( new THREE.Vector2 ( -8, -15 ) );
	medShipPts.push( new THREE.Vector2 ( -4, -30 ) );
	medShipPts.push( new THREE.Vector2 ( 4, -30 ) );
	medShipPts.push( new THREE.Vector2 ( 8, -15 ) );
	medShipPts.push( new THREE.Vector2 ( 8, 15 ) );
	var medShipShape = new THREE.Shape( medShipPts );
	textureAndAdd( medShipShape, extrudeSettings, -50, -50, 1 );

	// Large ship
	var largeShipPts = [];
	largeShipPts.push( new THREE.Vector2 ( 3, 40 ) );
	largeShipPts.push( new THREE.Vector2 ( -3, 40 ) );
	largeShipPts.push( new THREE.Vector2 ( -6, 35 ) );
	largeShipPts.push( new THREE.Vector2 ( -9, 20 ) );
	largeShipPts.push( new THREE.Vector2 ( -9, -20 ) );
	largeShipPts.push( new THREE.Vector2 ( -6, -35 ) );
	largeShipPts.push( new THREE.Vector2 ( -3, -40 ) );
	largeShipPts.push( new THREE.Vector2 ( 3, -40 ) );
	largeShipPts.push( new THREE.Vector2 ( 6, -35 ) );
	largeShipPts.push( new THREE.Vector2 ( 9, -20 ) );
	largeShipPts.push( new THREE.Vector2 ( 9, 20 ) );
	largeShipPts.push( new THREE.Vector2 ( 6, 35 ) );
	var largeShipShape = new THREE.Shape( largeShipPts );
	textureAndAdd( largeShipShape, extrudeSettings, 50, -50, 1);
}

function textureAndAdd(shape, extrudeSettings, px, py, pz) {
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	var texture = new THREE.ImageUtils.loadTexture( "textures/ship_side.jpg" );
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.minFilter = THREE.NearestFilter;
	var material = new THREE.MeshBasicMaterial({
        map:texture,
        // side:THREE.DoubleSide
    });
    // var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, new     THREE.MeshBasicMaterial({
	//     color: 0x000000,
	//     wireframe: true,
	//     transparent: true
	// })]);
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set( px, py, pz );
	group.add( mesh );
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

// Create axis (point1, point2, colour)
function createAxis(p1, p2, color){
    var line, lineGeometry = new THREE.Geometry(),
    lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 2});
    lineGeometry.vertices.push(p1, p2);
    line = new THREE.Line(lineGeometry, lineMat);
    scene.add(line);
}

// Convert board coordinates to canvas coordinates
// Board coordinates range 0-9 starting 2nd quad
// canvas coordinates range -100-100
var board2canvas = function(x, y) {
	board2canvas = {
		xcoord : (x*20+10) - 100,
		ycoord : 100 - (y*20+10) 
	};
}