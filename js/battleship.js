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
    camera = new THREE.PerspectiveCamera( 50, aspectRatio, 0.1, 10000 );
    camera.position.set( 0, -200, 400 );
    camera.up = new THREE.Vector3(0,0,1);
    // camera.lookAt(new THREE.Vector3(-100,0,500));

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
		createAxis( new THREE.Vector3( i*10 + 200, 100, 0 ), new THREE.Vector3( i*10 + 200, -100, 0 ), 0xffffff);
		createAxis( new THREE.Vector3( 300, i*10, 0 ), new THREE.Vector3( 100, i*10, 0 ), 0xffffff);
        createAxis( new THREE.Vector3( i*10 - 200, 100, 0 ), new THREE.Vector3( i*10 - 200, -100, 0 ), 0xffffff);
        createAxis( new THREE.Vector3( -300, i*10, 0 ), new THREE.Vector3( -100, i*10, 0 ), 0xffffff);
	}
	
}

function makeShips() {
	var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

	// Small ship
	var smallShipPts = [];
	smallShipPts.push( new THREE.Vector2 ( 0, 18 ) );
	smallShipPts.push( new THREE.Vector2 ( -8, 10 ) );
	smallShipPts.push( new THREE.Vector2 ( -8, -10 ) );
	smallShipPts.push( new THREE.Vector2 ( 0, -18 ) );
	smallShipPts.push( new THREE.Vector2 ( 8, -10 ) );
	smallShipPts.push( new THREE.Vector2 ( 8, 10 ) );
	var smallShipShape = new THREE.Shape( smallShipPts );
    var smallShipPos = board2canvas(1,1, 1,2, -1);
	textureAndAdd( smallShipShape, extrudeSettings, smallShipPos.xcoord, smallShipPos.ycoord, smallShipPos.rot );

	// Medium ship
	var medShipPts = [];
	medShipPts.push( new THREE.Vector2 ( 4, 28 ) );
	medShipPts.push( new THREE.Vector2 ( -4, 28 ) );
	medShipPts.push( new THREE.Vector2 ( -8, 15 ) );
	medShipPts.push( new THREE.Vector2 ( -8, 0 ) );
	medShipPts.push( new THREE.Vector2 ( -8, -15 ) );
	medShipPts.push( new THREE.Vector2 ( -4, -28 ) );
	medShipPts.push( new THREE.Vector2 ( 4, -28 ) );
	medShipPts.push( new THREE.Vector2 ( 8, -15 ) );
	medShipPts.push( new THREE.Vector2 ( 8, 15 ) );
	var medShipShape = new THREE.Shape( medShipPts );
    var medShipPos = board2canvas(6,6, 8,6, -1);
	textureAndAdd( medShipShape, extrudeSettings, medShipPos.xcoord, medShipPos.ycoord, medShipPos.rot );

	// Large ship
	var largeShipPts = [];
	largeShipPts.push( new THREE.Vector2 ( 3, 38 ) );
	largeShipPts.push( new THREE.Vector2 ( -3, 38 ) );
	largeShipPts.push( new THREE.Vector2 ( -6, 33 ) );
	largeShipPts.push( new THREE.Vector2 ( -9, 20 ) );
	largeShipPts.push( new THREE.Vector2 ( -9, -20 ) );
	largeShipPts.push( new THREE.Vector2 ( -6, -33 ) );
	largeShipPts.push( new THREE.Vector2 ( -3, -38 ) );
	largeShipPts.push( new THREE.Vector2 ( 3, -38 ) );
	largeShipPts.push( new THREE.Vector2 ( 6, -33 ) );
	largeShipPts.push( new THREE.Vector2 ( 9, -20 ) );
	largeShipPts.push( new THREE.Vector2 ( 9, 20 ) );
	largeShipPts.push( new THREE.Vector2 ( 6, 33 ) );
	var largeShipShape = new THREE.Shape( largeShipPts );
    var largeShipPos = board2canvas(3,3, 3,6, -1);
	textureAndAdd( largeShipShape, extrudeSettings, largeShipPos.xcoord, largeShipPos.ycoord, largeShipPos.rot );
}

function textureAndAdd(shape, extrudeSettings, px, py, rot) {
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
	mesh.position.set( px, py, 1 );
    mesh.rotation.z = rot;
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


