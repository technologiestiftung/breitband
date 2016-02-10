/*global tooltip:false,L:false,d3:false,console:false */
/*jshint unused:false*/
function stateMap(){

	var map = false, info, infostate = false;

	function statemap(){}

	statemap.resize = function(){
		if(map){
			map.remove();
			$('#map *').remove();
		}

		if(window.innerHeight/2<600){
			$('#map_container').css('height', (window.innerHeight/2)+'px');
		}else{
			$('#map_container').css('height', '600px');	
		}

		statemap.build();
	};

	statemap.init = function(){
		statemap.resize();
	};

	statemap.build = function(){
		map = new L.Map('map', {
			center: new L.LatLng(52.5047, 13.4244), 
			zoom: 11,
			attributionControl:false,
			maxZoom:18,
			minZoom:11,
			maxBounds:L.latLngBounds(
				L.latLng(52.3642, 13.0928),
				L.latLng(52.6605, 13.7565)
			)
		}).on('click', function() { 
			map.scrollWheelZoom.enable();
		});

		var speedmap = new L.TileLayer('http://tiles.sebastianmeier.eu/v2/tiles/fullimage/{z}/{x}/{y}.png').addTo(map);

		var styles = [{featureType:"all",elementType: "geometry",stylers: [{ visibility: "off" }]},{featureType: "transit.line",elementType: "labels",stylers: [{ visibility: "off" }]},{featureType: "transit.station",elementType: "labels",stylers: [{ visibility: "off" }]},{featureType: "poi",elementType: "labels",stylers: [{ visibility: "off" }]},{"featureType": "road.highway","elementType": "labels","stylers": [{ "visibility": "off" }]},{featureType:"all",elementType: "labels.text.fill",stylers: [{ color: "#ffffff" }]},{featureType:"all",elementType: "labels.text.stroke",stylers: [{ color: "#111111" }]}];

		var streets = new L.Google('ROADMAP', {
			mapOptions: {
				styles: styles
			}
		});

		map.addLayer(streets);

		var satellite = new L.Google('SATELLITE', {});
		map.addLayer(satellite);

		var brainLayer = L.layerGroup();
		var brainToggle = true;

		var BrainControl = L.Control.extend({
			options: {
				position: 'topright' 
			},

			onAdd: function (map) {
				var container = L.DomUtil.create('div', 'leaflet-brain-btn leaflet-bar leaflet-control leaflet-control-custom');

				container.onclick = function(){
					if(infostate){
						map.removeControl(info);					
						infostate = false;
					}
					if(!brainToggle) {
						map.removeLayer(brainLayer);
					} else {
						map.addLayer(brainLayer);
					}
					brainToggle = !brainToggle;
				};

				return container;
			}
		});

		map.addControl(new BrainControl());

		var InfoControl = L.Control.extend({
			options: {
				position: 'bottomright' 
			},

			onAdd: function (map) {
				var container = L.DomUtil.create('div', 'leaflet-info-btn leaflet-bar leaflet-control leaflet-control-custom');
				container.innerHTML = '<div id="map_info" class="red company-help"><strong>Berlin im Detail</strong><p><span class="image image-interactive"></span>Erkunden Sie die Berliner Breitbandlandschaft oder nutzen Sie den Button oben rechts um sich das BRAIN-Netz anzeigen zu lassen.</p></div>';

				container.onclick = function(){
					map.removeControl(info);
					infostate = false;				
				};

				return container;
			}
		});
		
		info = new InfoControl();
		map.addControl(info);
		infostate = true;

		var brainConnections = [
			[1,37,44],
			[1,44,27],
			[1,27,62],
			[1,62,50],
			[1,62,47],
			[1,47,60],
			[1,47,33],
			[1,60,33],
			[1,50,45],
			[1,50,35],
			[1,35,51],
			[1,51,24],
			[1,35,52],
			[1,52,53],
			[1,24,58],
			[1,58,57],
			[1,58,60],
			[1,57,38],
			[1,48,60],
			[1,48,49],
			[1,57,61],
			[1,49,41],
			[1,41,59],
			[1,59,21],
			[1,21,63],
			[1,21,63],
			[1,61,63],
			[1,56,63],
			[1,56,55],
			[1,55,54],
			[1,55,54],
			[1,54,58],
			[1,52,64],
			[1,64,24],
			[2,55,6],
			[2,55,16],
			[2,55,28],
			[2,51,15],
			[2,52,7],
			[2,27,5],
			[2,27,2],
			[2,27,19],
			[2,40,62],
			[2,62,26],
			[2,23,47],
			[2,22,37],
			[2,3,37],
			[2,8,57],
			[2,38,39],
			[2,50,14],
			[2,1,24],
			[2,63,25],
			[2,42,33],
			[2,24,20],
			[2,50,36],
			[2,24,10]
		];

		d3.csv('data/brain.csv', function(err, data){
			brainConnections.forEach(function(d,i){
				brainLayer.addLayer(
					L.polyline(
						[
							new L.LatLng(data[(d[1]-1)].latitude, data[(d[1]-1)].longitude),
							new L.LatLng(data[(d[2]-1)].latitude, data[(d[2]-1)].longitude)
						],
						{
							color: '#ffffff',
							weight:5/d[0]
						}
					)
				);
			});

			data.forEach(function(d,i){
				brainLayer.addLayer(
					L.circleMarker(
						new L.LatLng(d.latitude, d.longitude),
						{
							radius:d.type*3,
							color:'#000000',
		    				fillColor:'#ffffff',
		    				weight:1,
		    				fillOpacity:1,
		    				opacity:1,
		    				title:d.name
						}
					).on('mouseover', function (e) {
						tooltip.content('<strong class="center">'+this.options.title+'</strong>');
						var p = $(this._container).offset();
						tooltip.position([(p.left+(this.options.radius)), (p.top+(this.options.radius))]);
						tooltip.show();
		        	}).on('mouseout', function (e) {
		            	tooltip.hide();
		        	})
				);
			});
		});
	};

	return statemap;
}