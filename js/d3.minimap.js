/*global d3:false,tooltip:false,topojson:false */
/*jshint unused:false*/
function d3_minimap(){
	var selection,
		geo_data,
		districts = {"Charlottenburg-Wilmersdorf":{"2011":{leitung16:683,leitung50:614,count:7},"2012":{leitung16:689,leitung50:630,count:7},"2013":{leitung16:693,leitung50:668,count:7},"2015":{leitung16:695,leitung50:670,count:7}},"Friedrichshain-Kreuzberg":{"2011":{leitung16:184,leitung50:149,count:2},"2012":{leitung16:194,leitung50:162,count:2},"2013":{leitung16:195,leitung50:163,count:2},"2015":{leitung16:198,leitung50:177,count:2}},"Lichtenberg":{"2011":{leitung16:853,leitung50:665,count:10},"2012":{leitung16:901,leitung50:747,count:10},"2013":{leitung16:892,leitung50:690,count:10},"2015":{leitung16:934,leitung50:764,count:10}},"Marzahn-Hellersdorf":{"2011":{leitung16:469,leitung50:336,count:5},"2012":{leitung16:477,leitung50:361,count:5},"2013":{leitung16:487,leitung50:397,count:5},"2015":{leitung16:492,leitung50:418,count:5}},"Mitte":{"2011":{leitung16:579,leitung50:524,count:6},"2012":{leitung16:588,leitung50:537,count:6},"2013":{leitung16:594,leitung50:560,count:6},"2015":{leitung16:600,leitung50:565,count:6}},"Neukölln":{"2011":{leitung16:474,leitung50:394,count:5},"2012":{leitung16:483,leitung50:404,count:5},"2013":{leitung16:489,leitung50:432,count:5},"2015":{leitung16:496,leitung50:433,count:5}},"Pankow":{"2011":{leitung16:1060,leitung50:682,count:13},"2012":{leitung16:1076,leitung50:731,count:13},"2013":{leitung16:1123,leitung50:831,count:13},"2015":{leitung16:1197,leitung50:929,count:13}},"Reinickendorf":{"2011":{leitung16:963,leitung50:761,count:10},"2012":{leitung16:973,leitung50:764,count:10},"2013":{leitung16:987,leitung50:853,count:10},"2015":{leitung16:997,leitung50:897,count:10}},"Spandau":{"2011":{leitung16:809,leitung50:668,count:9},"2012":{leitung16:818,leitung50:702,count:9},"2013":{leitung16:846,leitung50:780,count:9},"2015":{leitung16:862,leitung50:792,count:9}},"Steglitz-Zehlendorf":{"2011":{leitung16:670,leitung50:540,count:7},"2012":{leitung16:674,leitung50:548,count:7},"2013":{leitung16:687,leitung50:624,count:7},"2015":{leitung16:694,leitung50:627,count:7}},"Tempelhof-Schöneberg":{"2011":{leitung16:584,leitung50:511,count:6},"2012":{leitung16:589,leitung50:520,count:6},"2013":{leitung16:590,leitung50:554,count:6},"2015":{leitung16:598,leitung50:557,count:6}},"Treptow-Köpenick":{"2011":{leitung16:1394,leitung50:912,count:15},"2012":{leitung16:1395,leitung50:964,count:15},"2013":{leitung16:1446,leitung50:1220,count:15},"2015":{leitung16:1463,leitung50:1236,count:15}}},
		speed = 16,
		width=300,
		height=300,
		projection = d3.geo.mercator()
			.scale(20000)
			.precision(0.1)
			.center([13.403528,52.540212])
			.translate([width / 2, height / 2]),
		path = d3.geo.path()
    		.projection(projection),
    	colors = [{r:189,g:0,b:38,a:0.8},{r:240,g:59,b:32,a:0.8},{r:253,g:141,b:60,a:0.8},{r:254,g:204,b:92,a:0.8},{r:255,g:255,b:178,a:0.8}],
    	percentage_domain = [100, 95, 75, 50, 10],
    	color_scale = d3.scale.linear()
    		.domain(percentage_domain)
    		.range(colors);

	function minimap(sel){
		selection = sel;
		d3.json('data/berlin_bezirke.topojson', function(err, data){
			geo_data = data;
			minimap.init();
		});

		var legend = d3.select('#minimap-legend');

		var legend_x = d3.scale.linear().domain(percentage_domain).range([199,150,100,50,0]),
			x_axis = d3.svg.axis()
				.scale(legend_x)
				.orient("top")
				.tickValues(percentage_domain)
				.tickFormat(function(d, i){ return d+"%"; });

		legend.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(20,33)")
			.call(x_axis);

		var defs = legend.append("defs")
			.append("linearGradient")
				.attr("id", "gradient")
				.attr("x1", "100%")
				.attr("y1", "0%")
				.attr("x2", "0%")
				.attr("y2", "0%")
				.attr("spreadMethod", "pad");

		defs.selectAll('stop').data(colors).enter().append('stop')
			.attr("offset", function(d,i){ return (100/colors.length*i)+"%"; })
			.attr("stop-color", function(d){ return 'rgb('+d.r+','+d.g+','+d.b+')'; })
			.attr("stop-opacity", 1);

		legend.append("rect")
			.attr('x', 20)
			.attr('y', 30)
			.attr("width", 200)
			.attr("height", 20)
			.style('stroke', '#000')
			.style('stroke-width', 0.5)
			.style("fill", "url(#gradient)");

	}

	minimap.init = function(){
		selection.each(function() {
			var sel = d3.select(this);

			//Delete everything that exists (for resize, as not everything is data driven)
			sel.selectAll('*').remove();

			var svg = sel.append('svg')
				.attr('viewBox', '0 0 '+width+' '+height)
				.attr('preserveAspectRatio', 'xMidYMid meet');

			var year = sel.attr('data-year');

			svg.selectAll('path').data(topojson.feature(geo_data, geo_data.objects.berlin_bezirke).features).enter().append("path")
				.attr("d", path)
				.attr('data-year', year)
				.on('mouseover', function(){ 
					var o = d3.select(this);
					var d = o.data()[0];
					var bb = o.node().getBoundingClientRect();
					tooltip.content("<strong>"+d.properties.name+"</strong><br />Netz mit einer Geschwindigkeit von<br /> bis zu "+speed+" Mbit/s ist zu "+(districts[d.properties.name][year]["leitung"+speed]/districts[d.properties.name][year].count).toFixed(2)+"% verfügbar.");
					tooltip.position([bb.left+window.pageXOffset+bb.width/2, bb.top+window.pageYOffset+bb.height/2]);
					tooltip.show(); 
				})
				.on('mouseout', function(){
					tooltip.hide();
				});

			svg.append('text').text(year).attr('x',width/2).attr('y',height/2+130).attr('text-anchor', 'middle');
		});

		d3.selectAll('.switchrow .col').on('click',function(){
			var btn = d3.select(this);
			d3.selectAll('.switchrow .col .triangle').style('display', 'none');
			btn.select('.triangle').style('display', 'block');
			d3.selectAll('.mapswitch').attr('class', 'mapswitch light_red');
			btn.select('.mapswitch').attr('class', 'mapswitch red');

			d3.selectAll('.speed-info').style('display', 'none');
			d3.selectAll('.speed-info-'+btn.attr('data-speed')).style('display', 'block');

			minimap.switchSpeed(btn.attr('data-speed'));
		});

		minimap.updateColor();
		minimap.resize();
	};

	minimap.updateColor = function(){
		selection.each(function() {
			var sel = d3.select(this);

			var year = sel.attr('data-year');

			sel.selectAll('path').data(topojson.feature(geo_data, geo_data.objects.berlin_bezirke).features)
				.style("fill", function(d){
					var color = color_scale((districts[d.properties.name][year]["leitung"+speed]/districts[d.properties.name][year].count));
					return 'rgb('+Math.round(color.r)+','+Math.round(color.g)+','+Math.round(color.b)+')';
				});
		});
	};

	minimap.switchSpeed = function(s){
		speed = s;
		minimap.updateColor();
	};

	minimap.resize = function(){
		var sel = d3.select('.minimap');
		var bb = sel.node().getBoundingClientRect();
		var width = bb.width;

		selection.style('height', width+'px');
	};

	return minimap;
}