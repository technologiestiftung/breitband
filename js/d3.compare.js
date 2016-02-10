/*global d3:false,tooltip:false */
/*jshint unused:false*/
function d3_compare(){
	var selection, data, bezirke, nest, yearMean,
		width, height, x, y, scaleStep, scaleRange,
		xAxis, yAxis, line, lineAll,
		menu, linechartSvg, linechart, entry,
		state = { activeMenu: false, item: null },
		title = { leitung16: "> 16Mbit", leitung50: "> 50Mbit"},
		scaleDomain = [0,25,50,70,85,95,100],
		margin = {top: 20, right:45, bottom: 20, left: 45},
		labelPos = {
			leitung16:{},
			leitung50:{}
		},labelAlt={
			"Wilmersdorf":"Charlottenburg-Wilmersdorf",
			"Kreuzberg":"Friedrichshain-Kreuzberg",
			"Wartenberg":"Lichtenberg",
			"Hellersdorf":"Marzahn-Hellersdorf",
			"Rudow":"Neukölln",
			"Wilhelmsruh":"Pankow",
			"Hansaviertel":"Mitte",
			"Wittenau":"Reinickendorf",
			"Wilhelmsstadt":"Spandau",
			"Tempelhof":"Tempelhof-Schöneberg",
			"Zehlendorf":"Steglitz-Zehlendorf",
			"Schmöckwitz":"Treptow-Köpenick"
		};


	function compare(sel){
		selection = sel;
		d3.csv("data/all.csv").get(function(error, csv) {
			csv.forEach(function(d){
				d.jahr *= 1;
				d.leitung50 *= 1;
				d.leitung16 *= 1;
			});

			data = ["leitung16", "leitung50"].map(function(type){
			  return csv.map(function(d){
			    return {
			      type: type,
			      value: d[type],
			      ortsteil: d.ortsteil,
			      bezirk: d.bezirk,
			      jahr: d.jahr,
			      data: d
			    };
			  });
			}).reduce(function(d1,d2){ return d1.concat(d2); },[]);
			
			yearMean = d3.nest()
				.key(function(d) { return d.type; })
				.key(function(d) { return d.bezirk; })
				.key(function(d) { return d.jahr; })
				.rollup(function(leaves) {
					var mean = d3.mean(leaves, function(d){ return d.value; });
					leaves.forEach(function(d){
						d.mean = mean;
					});
					return mean;
				})
				.entries(data);

			yearMean.forEach(function(d,i,a){
				d.values.forEach(function(dd,ii,aa){
					labelPos[d.key][dd.key] = dd.values[2].values;
				});
			});

			nest = d3.nest()
				.key(function(d) { return d.type; })
				.key(function(d) { return d.bezirk; })
				.key(function(d) { return d.ortsteil; })
				.entries(data);

			bezirke = d3.nest()
				.key(function(d) { return d.bezirk; })
				.entries(data);

			bezirke.forEach(function(d){
				d.mean = parseInt(d3.mean(d.values.filter(function(d) { return d.jahr === 2015; }), function(d){ return d.value; }));
			});

			bezirke.sort(function(a,b){ return b.mean - a.mean; });
			compare.init();
		});
	}

	compare.resize = function(){
		linechart.selectAll('*').remove();

		var sel = d3.select('#compare .chart .col');
		var bb = sel.node().getBoundingClientRect();
		width = bb.width-margin.right-margin.left;
		height = bb.height - margin.top-margin.bottom;

		x = d3.scale.linear()
			.range([0, width])
			.domain([2011,2015]);

		scaleStep = height/(scaleDomain.length-1);
		scaleRange = [scaleStep*6, scaleStep*5, scaleStep*4, scaleStep*3, scaleStep*2, scaleStep, 0];
			
		y = d3.scale.linear()
			.range(scaleRange)
			.domain(scaleDomain);

		xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickValues([2011,2012,2013,2015])
			.tickFormat(d3.format(""));

		yAxis = d3.svg.axis()
			.tickFormat(function(d) { if(d>0){ return d+"%"; }else{ return; } })
			.scale(y)
			.orient("left")
			.tickSize(-width);

		line = d3.svg.line()
			//.interpolate("basis")
			.x(function(d) { return x(d.jahr); })
			.y(function(d) { return y(d.mean); });

		lineAll = d3.svg.line()
			//.interpolate("basis")
			.x(function(d) { return x(d.jahr); })
			.y(function(d) { return y(d.value); });	

		linechart.call(compare.makeAxis);

		var bezirkeG = linechart
			.selectAll(".bezirke")
			.data(function(d){ return d.values; })
			.enter()
			.append("g")
			.attr('class', 'real')
			.attr('data-key', function(d){ return d3.select(this.parentNode).data()[0].key; })
			.classed("bezirke", true);

		var bezirkeA = linechart
			.selectAll(".bezirke.alpha")
			.data(function(d){ return d.values; })
			.enter()
			.append("g")
			.attr('class', 'alpha')
			.attr('data-key', function(d){ return d3.select(this.parentNode).data()[0].key; })
			.classed("bezirke", true);

		[bezirkeG,bezirkeA].forEach(function(b,index,array){
			b.selectAll(".ortsteil")
				.data(function(d){ return d.values; })
				.enter()
				.append("path")
				.attr('id', function(d){ return 'ortsteil_'+d.key; })
				.attr('class', function(d){ if(labelAlt[d.key] in labelPos.leitung50){ return 'overbezirk'; }else{ return 'normalbezirk'; } })
				.classed("ortsteil", true)
				.attr("d", function(d){ return line(d.values); }) 
				.on("mouseenter", function(d1){
					var parent = d3.select(this.parentNode).datum();
					var key = d3.select(this.parentNode).attr('data-key');

					var o = $('#'+key).offset();
					var tx = o.left + x(d1.values[2].jahr) + margin.left, ty;
					if(!state.activeMenu){
						ty = o.top + y(d1.values[2].mean) + margin.top + 3;
					}else{
						ty = o.top + y(d1.values[2].value) + margin.top + 3;
					}

					menu
						.selectAll(".entry")
						.classed("hover", function(d2){ return d2.key === parent.key && !state.activeMenu; });

					linechartSvg
						.classed("hover", true)
						.selectAll(".bezirke")
						.classed("active", function(d2){return parent.key === d2.key;})
						.filter(".active")
						.moveToFront();
						
					linechartSvg
						.selectAll(".bezirke")
						.selectAll(".ortsteil")
						.classed("hover", function(d2){return d1.key === d2.key;})
						.filter(".hover")
						.moveToFront();

					var text = state.activeMenu ? d1.key : parent.key;
					tooltip.content("<strong class=\"center\">"+text+"</strong>");
					tooltip.position([tx, ty]);
					tooltip.show(); 

				})
				.on("mouseleave", function(d1){

					menu
						.selectAll(".entry")
						.classed("hover", false);

					linechartSvg
						.classed("hover", false)
						.selectAll(".bezirke")
						.classed("hover", false)
						.selectAll(".ortsteil")
						.classed("hover", false);

					tooltip.hide(); 
				})
				.on("click", function(d1){
					var parent = d3.select(this.parentNode).datum();
					var m = menu
						.selectAll(".entry")
						.filter(function(d2){
							return parent.key === d2.key;
						})
						.node()
						.click();
				});
		});
	};

	compare.init = function(){
		menu = d3.select("#compare-legend").append("div").classed("menu", true);
		linechartSvg = d3.select("#compare .chart");

		menu.on("mouseout", function(d1){
			if(state.activeMenu){ return; }
			linechartSvg
				.classed("active", false)
				.selectAll(".bezirke")
				.classed("active", false);
		});

		entry = menu
			.selectAll("div")
			.data(bezirke)
			.enter()
			.append("div")
			.classed("entry", true)
			.on("click", function(d1){

				menu
					.selectAll(".entry")
					.classed("hover", false);

				if(state.item === d1.key && state.activeMenu){

					state.activeMenu = false;

					linechartSvg
						.selectAll(".bezirke")
						.selectAll(".ortsteil")
						.transition()
						.attr("d", function(d){ return line(d.values); })
						.each("end", function(d,i){
							if(i === 0){ linechartSvg.classed("expand", false).classed("active", false); }
						});

				} else {
					state.activeMenu = true;
					linechartSvg.classed("expand", true).classed("active", true);

					linechartSvg 
						.selectAll(".bezirke")
						.selectAll(".ortsteil")
						.transition()
						.attr("d", function(d){ return line(d.values); });


					linechartSvg
						.selectAll(".bezirke")
						.classed("active", function(d2){ return d1.key === d2.key; })
						.filter(".active")
						.moveToFront()
						.selectAll(".ortsteil")
						.transition()
						.attr("d", function(d){ return lineAll(d.values); });
						
				}

				state.item = d1.key;

				menu.selectAll(".entry")
					.classed("active", function(d2){ return (d1.key === d2.key) && state.activeMenu; });

				tooltip.hide();
			
			})
			.on("mouseenter", function(d1){
				if(state.activeMenu){ return; }

				menu
					.selectAll(".entry")
					.classed("hover", function(d2){ return d2.key === d1.key; });

				linechartSvg
					.classed("active", true)
					.selectAll(".bezirke")
					.classed("active", function(d2){ return d1.key === d2.key; })
					.filter(".active")
						.moveToFront();

			});

		entry.append("div")
			.text("×")
			.classed("close", true);

		entry.append("div")
			.text(function(d){ return d.mean+"%"; })
			.classed("labell", true);

		entry.append("div")
			.classed("labell", true)
			.text(function(d,i){ return d.key; });

		var tlinechart = linechartSvg
			.selectAll("div")
			.data(nest)
			.enter()
			.append("div")
			.each(function(d){
				return d;
			})
			.attr("class", "col col-xs-12 col-sm-4 col-lg-4")
			.append("svg")
			.attr('id', function(d){ return d.key; })
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		tlinechart.append("text")
			.text(function(d){ return title[d.key]; })
			.attr("y", -10);

		linechart = tlinechart.append("g");
			

		compare.resize();
	};

	compare.makeAxis = function(selection){
		var svgAxis = selection.append("g");

		svgAxis.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		var gy = svgAxis.append("g")
				.attr("class", "y axis")
				.call(yAxis);
					
		gy.selectAll("text")
				.attr("x", -6);

		gy.selectAll("g").filter(function(d) { return d; })
				.classed("minor", true);
	};

	return compare;
}

d3.selection.prototype.moveToFront = function () {
	return this.each(function () {
		this.parentNode.appendChild(this);
	});
};