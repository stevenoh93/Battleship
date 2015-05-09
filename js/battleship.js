var camera;
var renderer;
var scene;
var pivot;
var cameraControls;

var waters = [];

var boardGroup;

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

    boardGroup = new THREE.Group();
    
	var container = document.getElementById( "container" );
    container.appendChild( renderer.domElement );    
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
    var boxGeo = new THREE.BoxGeometry( 20, 20, 10 );
    var texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );
    var boxMaterial = new THREE.MeshPhongMaterial({
        map:texture,
        transparent: true, 
        opacity: 0.5, 
        
    });
    var transparent = new THREE.MeshPhongMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0,
        specular: 0xffffff
    });
    var materials = [transparent, transparent, transparent, transparent, boxMaterial, transparent];
    var boxFaceMaterials = new THREE.MeshFaceMaterial( materials );
	for (var i=-17; i<=18; i++) {
        for (var j=-7; j<=8; j++) {
            var box = new THREE.Mesh( boxGeo, boxFaceMaterials );
            box.position.set(i*20-10, j*20-10, 0);
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
        side:THREE.TopSide
    });
    // var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, new     THREE.MeshBasicMaterial({
	//     color: 0x000000,
	//     wireframe: true,
	//     transparent: true
	// })]);
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set( px, py, 1 );
    mesh.rotation.z = rot;
	boardGroup.add( mesh );
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


