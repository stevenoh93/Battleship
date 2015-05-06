var camera;
var renderer;
var scene;
var pivot;
var cameraControls;

var waters = [];

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
    camera.position.set( 0, 500, 500 );
    camera.up = new THREE.Vector3(0,0,1);
    camera.lookAt(new THREE.Vector3(0,0,0));

    //CameraControls:
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
	
	var container = document.getElementById( "container" );
    container.appendChild( renderer.domElement );    
}

function drawScene() {
    scene = new THREE.Scene();
	
    var ambientLight = new THREE.AmbientLight( 0xFFFFFF );
	scene.add( ambientLight );

	makeBackground();
    
    // Draw waters
	for (var i=0; i<27; i++) {
		scene.add( waters[i] );
	}
    
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
    var boxGeo = new THREE.BoxGeometry( 100, 100, 10 );
    var texture = THREE.ImageUtils.loadTexture("textures/water.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3,3);
    var boxMaterial = new THREE.MeshBasicMaterial({
        map:texture,
        side:THREE.DoubleSide
    });
	for (var i=-10; i<=10; i+=10) {
        for (var j=-10; j<=10; j+=10) {
            var box = new THREE.Mesh( boxGeo, boxMaterial );
            box.position.set(i*10, j*10, 0);
    		waters.push( box );
        }
	}
    
}


var debugaxis = function(axisLength){
    //Shorten the vertex function
    function v(x,y,z){
            return new THREE.Vector3(x,y,z);
    }
   
    //Create axis (point1, point2, colour)
    function createAxis(p1, p2, color){
            var line, lineGeometry = new THREE.Geometry(),
            lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat);
            scene.add(line);
    }
   
    createAxis(v(0, 0, 0), v(axisLength, 0, 0), 0xFF0000);
    createAxis(v(0, 0, 0), v(0, axisLength, 0), 0x00FF00);
    createAxis(v(0, 0, 0), v(0, 0, axisLength), 0x0000FF);
};
