/*global d3:false,console:false,THREE:false,screenfull:false,TWEEN:false,saveAs */
/*jshint unused:false*/
function threeD(){
	var centroids = [{c:[-164.94678225444946,-63.029871437100326],n:"Mitte"},{c:[52.778130057326905,103.42041724165729],n:"Friedrichshain-Kreuzberg"},{c:[94.44270055577594,-432.5721103772772],n:"Pankow"},{c:[-499.09505521863184,119.66473570559107],n:"Charlottenburg-Wilmersdorf"},{c:[-818.1448708597577,-22.566868616095963],n:"Spandau"},{c:[-607.8190923800062,498.97261500635307],n:"Steglitz-Zehlendorf"},{c:[-113.29687363849465,462.53109998602974],n:"Tempelhof-Schöneberg"},{c:[145.7122760209756,463.22536731944496],n:"Neukölln"},{c:[691.0693806464119,528.9735270041073],n:"Treptow-Köpenick"},{c:[578.0995751704685,4.466256221793847],n:"Marzahn-Hellersdorf"},{c:[337.0342485538481,-74.80341059918459],n:"Lichtenberg"},{c:[-425.4280684254382,-423.6349448086686],n:"Reinickendorf"}];

	function threed() {}

	d3.select('.company-help').on('click',function(){ d3.select('.company-help').style('display','none'); });
	d3.select('.infobtn').on('click',function(){ d3.select('.company-help').style('display','block'); });

	d3.select(".instagram")
		.on("click", function(d){
			state.instagram = !state.instagram;
			d3.select(this).classed("active", state.instagram);
			threed.updateSocialStatus();
		});

	d3.select(".twitter")
		.on("click", function(d){
			state.twitter = !state.twitter;
			d3.select(this).classed("active", state.twitter);
			threed.updateSocialStatus();
		});

	d3.select(".menu .screenshot")
		.on("click", function(d){
			makeScreenshot = true;
		});

	// d3.select("body").on("contextmenu", function(data, index) {
	//  	makeScreenshot = true;
	//  	d3.event.preventDefault();
	// });

	var makeScreenshot = false;
	var clockDiv = d3.select(".time .clock");


	threed.updateSocialStatus = function(){
		if(!state.twitter && !state.instagram){
			d3.select('.time').style('display', 'none');
		}else{
			d3.select('.time').style('display', 'block');
		}
		toggleSocial();
	};

	threed.resize = function(){
		var bb = d3.select('#container').node().getBoundingClientRect();

		width = bb.width;
		height = bb.height;
		
		camera.aspect =  width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	};

	threed.play = function(){
		if(!state.play){
			state.play = true;
			animate();
		}
	};

	threed.pause = function(){
		state.play = false;
	};

	d3.select(".fullscreen")
		.on("click", function(d){
			screenfull.toggle();
			threed.play();
			d3.select(this).classed("active", screenfull.isFullscreen);
		})
		.style("display", function(){ return screenfull.enabled; });

	var bb = d3.select('#container').node().getBoundingClientRect(),
		width = bb.width,
		height = bb.height;

	var container = document.getElementById( 'container' );

	var renderer = new THREE.WebGLRenderer( {antialias:true, preserveDrawingBuffer: false } );
		renderer.setClearColor( 0x1E3791 );
	//	renderer.setClearColor( 0xFFFFFF );
		renderer.setSize( width, height );
		// renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		container.appendChild( renderer.domElement );

	var scene = new THREE.Scene();
	var scene2 = new THREE.Scene();
	var scene3 = new THREE.Scene();

	scene.add(scene2);
	scene2.add(scene3);

	var today = new Date(),
		yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	d3.select('.date').text(((yesterday.getDate()<10) ? "0" : "")+yesterday.getDate()+"."+((yesterday.getMonth()<10) ? "0" : "")+yesterday.getMonth()+"."+yesterday.getFullYear());


	scene.add( new THREE.HemisphereLight( 0xffffff, 0x1E3791 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( 1, 100, 300);
	scene.add( light );

	var camera = new THREE.PerspectiveCamera( 50, width / height, 1, 10000 );
		camera.position.x = 0;
		camera.position.y = -1800;
		camera.position.z = 1100;
		camera.lookAt(scene.position);	

	var drag = d3.behavior.drag()
		.on("dragstart", function() {
			d3.event.sourceEvent.stopPropagation(); 
		})
		.on("drag",function(d){
			scene2.rotation.z += d3.event.dx / 100;
		});

	var cameraStart = new THREE.Vector3().copy(camera.position);

	var zoom = d3.behavior.zoom()
	    .scaleExtent([1, 5])
		.on("zoom", function(d){
	  		camera.position.y = cameraStart.y / (d3.event.scale);
	  		camera.position.z = cameraStart.z / d3.event.scale;
	  		camera.lookAt(scene.position);
		});

	var oldScale = zoom.scale();

	var renderCanvas = d3.select(renderer.domElement)
		.datum({ drag: false })
		.call(drag)
		.call(zoom)
		.on("mousemove", function(){
			var m = d3.mouse(this);
			// console.log(m, event)
			mouse.x = ( m[0] / width ) * 2 - 1;
			mouse.y = - ( m[1] / height ) * 2 + 1;		

			if(!state.active){ raycast(); }
		});

	var state = { fullscreen:false, play: false, active: null, twitter: false, instagram: false };

	var parseDate = d3.time.format("%Y-%m-%d").parse;

	var z = d3.scale.linear().range([1,50]).domain([0, 5]);
	var zSocialTweets, zSocialInstagram;

	var centerCoord = [13.413215, 52.521918];
	var projection = d3.geo.mercator()
		.scale(240000)
		.center(centerCoord)
		.translate([0,0]);

	var geoPath = d3.geo.path()
		.projection(projection);

	var delaunay = d3.geom.voronoi().x(function(d) { return d.xr; }).y(function(d) { return d.yr; });


	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var INTERSECTED;

	var dataAll;

	d3.csv('data/50mbit.csv', function(err, data){
		d3.csv('http://tsb.sebastianmeier.eu/static/data.csv', function(err, social){
			dataLoaded(data, social);
		});
	});

	function dataLoaded(data, social) {

		dataAll = data;

		var xymap = [];

		data.forEach(function(d,i){
			var p = projection([d.longitude, d.latitude]);
			d.x = parseInt(p[0]);
			d.y = -parseInt(p[1]);
			d.xr = d.x+Math.random();
			d.yr = d.y+Math.random();
			d.percentage = parseInt(d.percentage);
			d.z = z(d.percentage);
			d.name = i;
			d.xx = parseInt(d.xx);
			d.yy = parseInt(d.yy);
			// d.social = d3.range(24).map(function(d){ return { instagram: 0, twitter: 0}});
			d.social = [];
			d.cube = null;

			if(!xymap[d.xx]){ xymap[d.xx]=[]; }
			xymap[d.xx][d.yy] = d;
		});

		social.forEach(function(d){
			var dd = xymap[d.x][d.y];
			// d.data = dd;
			d.x = dd.x;
			d.y = dd.y;
			d.z = dd.z;
			d.xr = dd.xr;
			d.yr = dd.yr;
			d.instagram *= 1;
			d.twitter *= 1;
			d.hour *= 1;

			dd.social[d.hour] = { twitter: d.twitter, instagram: d.instagram };
		});

		zSocialTweets = d3.scale.linear().range([100,150]).domain([0,d3.max(social, function(d){ return d.twitter; })]);
		zSocialInstagram = d3.scale.linear().range([100,150]).domain([0,d3.max(social, function(d){ return d.instagram; })]);

		var dataBezirke = d3.nest()
			.key(function(d){ return d.bezirk; })
			.entries(data);

		var meshBezirke = dataBezirke.map(function(d){
			return makeMesh(d);
		});

		var socialHours = d3.nest()
			.key(function(d){ return d.hour; })
			.entries(social);

		

		renderCanvas.on("click", function(){
			if (d3.event.defaultPrevented){ return; }

			if(state.active === INTERSECTED){
				state.active = INTERSECTED = null;

				meshBezirke.forEach(function(d){
					d.material.wireframe = false;
					d.material.opacity = 1;
					d.material.color.setHex( 0x6ECDF5 );
					d.intersected = false;
				});

				var tween1 = new TWEEN.Tween(scene3.position)
				    .to({ x: 0, y: 0 }, 1000)
				    .easing(TWEEN.Easing.Quadratic.InOut)
				    .start();

				var tween2 = new TWEEN.Tween({ scale: zoom.scale() })
				    .to({ scale: 1 }, 1000)
				    .onUpdate(function(d){
				    	zoom.scale(this.scale).event(renderCanvas);
				    })
				    .easing(TWEEN.Easing.Quadratic.InOut)
				    .start();

			}

			if(INTERSECTED){
				var geocenter = INTERSECTED.geometry.boundingBox.center().negate();

				var tween3 = new TWEEN.Tween(scene3.position)
				    .to({ x: geocenter.x, y: geocenter.y }, 1000)
				    .easing(TWEEN.Easing.Quadratic.InOut)
				    .start();

				var tween4 = new TWEEN.Tween({ scale: zoom.scale() })
				    .to({ scale: 3 }, 1000)
				    .onUpdate(function(d){
				    	zoom.scale(this.scale).event(renderCanvas);
				    })
				    .easing(TWEEN.Easing.Quadratic.InOut)
				    .start();

				meshBezirke.forEach(function(d){
					d.material.wireframe = !d.intersected;
					d.material.opacity = d.intersected ? 1 : 0.6;
				});

				state.active = INTERSECTED;
			}
		});

		var now = 0;
		makeSocialStatic(data, now);
		makeCenters();
		// animate();
		render();
		
	}

	var objects = [];

	function makeCenters(){

		centroids.forEach(function(bezirk,i,a){
			var centroid = bezirk.c;

			var geometry = new THREE.SphereGeometry( 10, 10, 10 );
			var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.x = centroid[0];
			mesh.position.y = -centroid[1];
			mesh.position.z = 100;
			mesh.visible = false;

			var inner = document.createElement( 'span' );
			inner.innerHTML = bezirk.n;
			mesh.domlabel = document.createElement( 'div' );
			mesh.domlabel.appendChild(inner);

			mesh.domlabel.style.display = 'none';
			document.getElementById( 'labels' ).appendChild( mesh.domlabel );

			scene3.add(mesh);
			objects.push(mesh);

		});
		
	}


	function raycast(){
		raycaster.setFromCamera( mouse, camera );	

		var intersects = raycaster.intersectObjects( scene3.children );

		if ( intersects.length > 0 ) {

			if ( INTERSECTED !== intersects[ 0 ].object && intersects[ 0 ].object.hasOwnProperty("bezirk") ) {

				if ( INTERSECTED ){
					INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					INTERSECTED.position.z = 0;
					INTERSECTED.material.wireframe = false;
					INTERSECTED.intersected = false;
				}

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.intersected = true;
				INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
				INTERSECTED.material.color.setHex( 0xE60032 );
				INTERSECTED.material.wireframe = false;

				container.style.cursor = "pointer";

			}

		} else {

			if ( INTERSECTED ) {
				INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				INTERSECTED.position.z = 0;
				INTERSECTED.material.wireframe = false;
				INTERSECTED.intersected = false;
			}

			INTERSECTED = null;

			container.style.cursor = "inherit";

		}

	}

	function animate( time ) {

		if(state.play || screenfull.isFullscreen){
			requestAnimationFrame( animate );
			TWEEN.update();
			render(time);
		}

	}

	var rotation = 0;
	var hour = 0;

	function toggleSocial(){
		dataAll.forEach(function(d){
			if(d.cube){
				if(state.instagram){
					d.cube.visible = true;
				}else{
					d.cube.visible = false;
				}
			}
			if(d.cube2){
				if(state.twitter){
					d.cube2.visible = true;
				}else{
					d.cube2.visible = false;
				}
			}
		});
	}

	function render(time) {
		// console.log("render")

		// TWEEN.update();
		scene2.rotation.z += 0.001;

		update_labels(objects);
		//raycast();
		if(state.twitter || state.instagram){
			updateSocial(time);
			animateSocial();
		}

		renderer.render( scene, camera );

		if(makeScreenshot){
			renderer.domElement.toBlob(function(blob) {
			    saveAs(blob, "breitband.png");
			});
			
			// var screenshot = renderer.domElement.toDataURL();
			// saveAs(dataURItoBlob(screenshot), "breitband.png");

			makeScreenshot = false;
		}

	}

	var clockSpeed = 400;
	function updateSocial(time){
		var now = parseInt(time/clockSpeed) % 24;
		if(now!==hour){
			hour = now;
			updateSocialBars(hour);
		}
	}

	function updateSocialBars(hour){
		clockDiv.text((hour < 10 ? "0"+hour : hour) + ":00");

		dataAll.forEach(function(d){
			var social = d.social[hour];
			var zInstagram = 0.2;
			var zTwitter = 0.2;
			var diff = (socialHoverPos-d.z);

			if(social){
				if(state.instagram){ zInstagram = diff + zSocialInstagram(social.instagram); }
				if(state.twitter){ zTwitter = diff + zSocialTweets(social.twitter); }
			}

			if(d.cube){ d.cube.animateZ = zInstagram; }
			if(d.cube2){ d.cube2.animateZ = zTwitter; }
		});	
	}

	var animationSpeed = 0.05;
	function animateSocial(){
		dataAll.forEach(function(d){
			if(d.cube){
				// d.cube.scale.z += (d.cube.animateZ - d.cube.scale.z)*0.1;
				d.cube.position.z += (d.z -10 + d.cube.animateZ - d.cube.position.z) * animationSpeed;
				// d.cube.visible = (d.cube.position.z > 1);
				d.cube.scale.z = d.cube.scale.x = d.cube.scale.y += (d.cube.animateZ/20 - d.cube.scale.z) * animationSpeed;
			}
			if(d.cube2){
				d.cube2.position.z += (d.z -10 + d.cube2.animateZ - d.cube2.position.z) * animationSpeed;
				d.cube2.scale.z = d.cube2.scale.x = d.cube2.scale.y += (d.cube2.animateZ/20 - d.cube2.scale.z) * animationSpeed;
				// d.cube2.visible = (d.cube2.scale.z > 1); 
			}
		});
	}

	function update_labels(objects) {
		for ( var i = 0; i < objects.length; i ++ ) {
			var pos = toScreenXY( objects[i] );
			
			objects[i].domlabel.style.display = 'block';
			objects[i].domlabel.style.transform = "translate("+pos.x+"px,"+pos.y+"px)";
		}
	}

	function toScreenXY(mesh){

	    var v = new THREE.Vector3().setFromMatrixPosition( mesh.matrixWorld ).project(camera);

	    var left = (v.x + 1) / 2 * width;
	    var top = (-v.y + 1) / 2 * height;

	    return {x: left, y:top };
	}

	var socialHoverPos = 60;

	function makeSocialStatic(data,hour){

		var geometry = new THREE.BoxGeometry( 5, 5, 5 );
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,0.5));

		var material = new THREE.MeshLambertMaterial({ 
			color: 0x4DAF4A,
			opacity: 0.9,
			transparent: false,
		});
		var material2 = new THREE.MeshLambertMaterial({ 
			color: 0xE60032,
			opacity: 0.9,
			transparent: false,
		});

		var material3 = new THREE.MeshBasicMaterial({ 
			color: 0xffffff,
			transparent: true,
			opacity: 0.8,
			fog: false
		});


		data.forEach(function(d){
			var cube;
			if(d.social.filter(function(d){ return d.instagram !== 0; }).length > 0){
				cube = new THREE.Mesh( geometry, material );
				
				cube.position.x = d.x;
				cube.position.y = d.y;
				cube.position.z = d.z;
				cube.visible = true;

				d.cube = cube;
				scene3.add(cube);
			}
			
			if(d.social.filter(function(d){ return d.twitter !== 0; }).length > 0){
				cube = new THREE.Mesh( geometry, material2 );
			
				cube.position.x = d.x+10;
				cube.position.y = d.y;
				cube.position.z = d.z;
				cube.visible = true;

				d.cube2 = cube;
				scene3.add(cube);
			}
			
		});	

		toggleSocial();
	}


	function makeMesh(bezirk){
		var selection = bezirk.values;
		var triangles = delaunay.triangles(selection);
		var geometryMesh = new THREE.Geometry();

		geometryMesh.vertices = selection.map(function(d,i){ d.id = i; return new THREE.Vector3(d.x,d.y,d.z); });

		triangles.forEach(function(d){
			var xdist = (Math.abs(d[0].x-d[1].x)+Math.abs(d[1].x-d[2].x)+Math.abs(d[0].x-d[2].x))/3;
			var ydist = (Math.abs(d[0].y-d[1].y)+Math.abs(d[1].y-d[2].y)+Math.abs(d[0].y-d[2].y))/3;
			if(xdist > 20 || ydist > 20){ return; } // hacky oh boy 

			geometryMesh.faces.push( new THREE.Face3( d[0].id, d[1].id, d[2].id ) );
		});

		geometryMesh.computeFaceNormals();
		geometryMesh.computeBoundingBox();

		var materialLambert = new THREE.MeshLambertMaterial({
			// color: new THREE.Color().setStyle("rgb(110,205,245)"),
			color: 0x6ECDF5,
			side: THREE.BackSide,
			wireframe:false,
			transparent: true
			// opacity: 0.6
		});

		var mesh = new THREE.Mesh( geometryMesh, materialLambert );
		mesh.bezirk = bezirk.key;

		scene3.add(mesh);

		return mesh;
	}

	function dataURItoBlob(dataURI) {
	    // convert base64 to raw binary data held in a string
	    var byteString = atob(dataURI.split(',')[1]);

	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	    // write the bytes of the string to an ArrayBuffer
	    var arrayBuffer = new ArrayBuffer(byteString.length);
	    var _ia = new Uint8Array(arrayBuffer);
	    for (var i = 0; i < byteString.length; i++) {
	        _ia[i] = byteString.charCodeAt(i);
	    }

	    var dataView = new DataView(arrayBuffer);
	    var blob = new Blob([dataView], { type: mimeString });
	    return blob;
	}

	try {
		if((window.self !== window.top)){
			//In iframe
		}else{
			//Not in iframe so play from beginning
			state.play = true;
			animate();
		}
	} catch (e) {
		//In iframe
	}

	return threed;
}