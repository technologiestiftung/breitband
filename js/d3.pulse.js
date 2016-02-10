/*global d3:false,console:false,debouncer:false */
/*jshint unused:false*/
function d3_pulse(){
	var selection, hour = -1, odata, layer = [], state=true;

	function pulse(sel){
		selection = sel;
		pulse.init();
	}

	pulse.init = function(){
		selection.each(function(d, i) {
			var sel = d3.select(this);
			//Delete everything that exists (for resize, as not everything is data driven)
			sel.selectAll('*').remove();

			var size = 3,
				oversize = 2,
				gx_min = 56,
				gx_max = 235,
				gy_min = 1,
				gy_max = 147,
				line_pad = 10,
				cols = gx_max-gx_min,
				rows = gy_max-gy_min,
				width = cols*size,
				height = rows*size,
				line_height = 200,
				line_width = 180;

			var svg = selection.append('svg')
				.attr('id', 'timemap')
				.attr('viewBox', '0 0 '+width+' '+height)
				.attr('preserveAspectRatio', 'xMidYMid meet');

			var line_svg = d3.select('#d3_circular').append('svg')
				.attr('id', 'timeline')
				.attr('viewBox', '0 0 '+line_width+' '+line_height)
				.attr('preserveAspectRatio', 'xMidYMid meet')
				.append('g');

			/* CIRCULAR TIMELINE */

			var start = 0;
			var end = 24;

			var min_r = 20;
			var max_r = line_width/2-line_pad-5;
			var steps_r = 5;

			var l_width = 60;
			var l_height = 30;
			var l_min_r = 5;
			var l_max_r = 15;

			var xy = function(h, r, v){
				var theta = 2 * Math.PI / 24;
				var tr = min_r + v(r)*(max_r - min_r);
				return [
					(tr * Math.cos(h * theta - Math.PI/2.0)),
					(tr * Math.sin(h * theta - Math.PI/2.0))
				];
			};

			var l_xy = function(h, r, v){
				var theta = 2 * Math.PI / 24;
				var tr = l_min_r + v(r)*(l_max_r - l_min_r);
				return [
					(tr * Math.cos(h * theta - Math.PI/2.0)),
					(tr * Math.sin(h * theta - Math.PI/2.0))
				];
			};

			//Background Grid
			var grid = line_svg.append('g').attr('class', 'grid').attr('transform', 'translate('+(line_width/2)+','+(line_height/2)+')');
			var hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
			grid.selectAll('line').data(hours).enter().append('line')
				.attr('x1', function(d){ var l_xy = xy(d, 1, function(d){return d;}); return l_xy[0]; })
				.attr('x2', function(d){ var l_xy = xy(d, 0, function(d){return d;}); return l_xy[0]; })
				.attr('y1', function(d){ var l_xy = xy(d, 1, function(d){return d;}); return l_xy[1]; })
				.attr('y2', function(d){ var l_xy = xy(d, 0, function(d){return d;}); return l_xy[1]; })
				.style('stroke', function(d, i){ return 'rgba(0,0,0,'+(0.3/24*i+0.1)+')'; });

			var arc = d3.svg.arc()
				.innerRadius(min_r)
				.outerRadius(max_r)
				.startAngle(function(d){ return Math.PI/12 * d; })
				.endAngle(function(d){ return Math.PI/12 * (d+1); });

			grid.selectAll('path.bg-pattern').data(hours).enter().append("path")
				.attr('class', function(d, i){ var r = 'bg-'+i+' bg-pattern'; if(i % 2 === true){ r += ' odd'; }else{ r += ' even'; } return r; })
				.attr("d", arc);

			for(i = 0; i<steps_r; i++){
				grid.append('circle')
					.attr('cx', 0)
					.attr('cy', 0)
					.attr('r', (((max_r-min_r)/steps_r)*i+min_r));
			}

			//svg group for background patterns
			var defs = line_svg.append('defs');

			//Mask for inner hole
			var mask = defs.append('mask').attr('id', 'hole');
			mask.append('rect')
				.attr('x', -line_width/2)
				.attr('y', -line_height/2)
				.attr('width', line_width)
				.attr('height', line_height)
				.style('fill', 'white');

			mask.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', min_r);

			grid.append('text')
				.attr('class', 'timetext')
				.attr('x', 0)
				.attr('y', 7)
				.attr('text-anchor', 'middle')
				.text(24);

			grid.append('text')
				.attr('class', 'octext')
				.attr('x', 0)
				.attr('y', -(max_r+5))
				.attr('text-anchor', 'middle')
				.text('00:00');

			grid.append('text')
				.attr('class', 'octext')
				.attr('x', 0)
				.attr('y', (max_r+13))
				.attr('text-anchor', 'middle')
				.text('12:00');

			grid.append('text')
				.attr('class', 'octext')
				.attr('x', (max_r+5))
				.attr('y', 3)
				.attr('text-anchor', 'start')
				.text('06:00');

			grid.append('text')
				.attr('class', 'octext')
				.attr('x', -(max_r+5))
				.attr('y', 3)
				.attr('text-anchor', 'end')
				.text('18:00');

			//svg groups for circles
			var species_g = {};
			//svg groups for paths
			var species_p = {};
			//d3 scales
			var species_s = {};
			//Legends
			var species_l = {cix:null,instagram:null,twitter:null};

			var species = {
				cix:[],
				instagram:[],
				twitter:[]
			};

			var line_colors = {
				cix:'rgba(152,78,163,1)',
				instagram:'rgba(77,175,74,1)',
				twitter:'rgba(55,126,184,1)'
			};

			var line_fill_colors = {
				cix:'rgba(152,78,163,0.2)',
				instagram:'rgba(77,175,74,0.2)',
				twitter:'rgba(55,126,184,0.2)'
			};

			//fill species with empty data
			for(var s in species){
				for(i = 0; i<24; i++){
					species[s].push(0);
				}

				species_g[s] = line_svg.append('g').attr('transform', 'translate('+(line_width/2)+','+(line_height/2)+')');
				species_p[s] = line_svg.append('g').attr('transform', 'translate('+(line_width/2)+','+(line_height/2)+')');
				species_s[s] = d3.scale.linear().range([0,1]);

				species_l[s] = d3.select('#legend_'+s+' div').append('svg').attr('height',l_height);
				if(s!=='cix'){
					species_l[s].attr('width', l_width);
				}else{
					species_l[s].attr('width', l_width/2);
				}
				
			}

			line_svg.append('image')
				.attr('class', 'playbtn')
				.style('opacity', 0)
				.attr('x', line_width/2-28.5)
				.attr('y', line_height/2-28.5)
				.attr('width', 59)
				.attr('height', 59)
				.attr('xlink:href', 'images/play@2x.png');

			line_svg.append('circle')
				.attr('id', 'timebutton')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', line_width/2)
				.on('click', function(){
					var m = d3.mouse(this);
					var r = Math.sqrt(Math.pow(m[0],2)+Math.pow(m[1],2));
					if(r>20){
						var a = Math.floor((Math.atan(m[1] / m[0]))/(Math.PI/2)*6);
						if(a<0){
							a+=7;
						}
						if(m[0]>0&&m[1]>0){
							a+=7;
						}else if(m[0]>0&&m[1]<0){
							a+=0;
						}else if(m[0]<0&&m[1]<0){
							a+=19;
						}else{
							a+=12;
						}

						if(!state && hour === a){
							state = true;
							requestAnimationFrame(pulse.iterate);
							pulse.stateUpdate();
						}else{
							hour = a;
							if(!state){
								requestAnimationFrame(pulse.iterate);
							}
							state = false;
							pulse.stateUpdate();
						}
					}else if(!state){
						state = true;
						requestAnimationFrame(pulse.iterate);
						pulse.stateUpdate();
					}
				})
				.attr('transform', 'translate('+(line_width/2)+','+(line_height/2)+')');

			d3.json('http://tsb.sebastianmeier.eu/static/info.json', function(err, info_data){
				if(err){ return console.error(err); }
				
				for(var s in species){
					var max = -Number.MAX_VALUE;
					var data;
					switch(s){
						case 'cix':
							var tdata = [66,48,40,32,29,27,23,19,17,16,14,14,14,15,18,20,23,28,32,37,40,45,46,49,53,54,57,60,65,69,67,71,76,74,71,77,75,78,88,74,78,84,83,87,81,74,74,72,66];
							data = [];
							for(var i = 0; i<tdata.length; i++){
								data.push({x:i/2, y:tdata[i]});
							}
						break;
						case 'instagram':
							data = pulse.reorder('instagram', info_data);
						break;
						case 'twitter':
							data = pulse.reorder('twitter', info_data);
						break;
					}

					species[s] = data;
					
					for(i = 0; i<data.length; i++){
						if(data[i].y > max){ max = data[i].y; }
					}

					species_s[s].domain([0, max]);

					species_g[s].selectAll('circle').data(species[s]).enter().append('circle')
						.attr('cx', function(d, i){ var c_xy = xy(d.x, d.y, species_s[s]); return c_xy[0]; })
						.attr('cy', function(d, i){ var c_xy = xy(d.x, d.y, species_s[s]); return c_xy[1]; })
						.style('fill', line_colors[s])
						.attr('r', 1);

					var line = d3.svg.line()
						.x(function(d, i){ var c_xy = xy(d.x, d.y, species_s[s]); return c_xy[0]; })
						.y(function(d, i){ var c_xy = xy(d.x, d.y, species_s[s]); return c_xy[1]; });

					var l_line = d3.svg.line()
						.x(function(d, i){ var c_xy = l_xy(d.x, d.y, species_s[s]); return c_xy[0]; })
						.y(function(d, i){ var c_xy = l_xy(d.x, d.y, species_s[s]); return c_xy[1]; });

					species_p[s].append('path')
						.attr('d', function(){ return line(species[s])+' Z'; })
						.style('stroke', line_colors[s])
						.style('fill', line_fill_colors[s])
						.attr('mask', 'url(#hole)')
						.attr('class', s);

					species_l[s].append('path')
						.attr('d', function(){ return l_line(species[s])+' Z'; })
						.style('stroke', line_colors[s])
						.style('fill', line_fill_colors[s])
						.attr('transform', 'translate('+l_height/2+' '+l_height/2+')');

					species_l[s].append('circle')
						.attr('cx', 0)
						.attr('cy', 0)
						.attr('r', l_min_r-2)
						.style('stroke', line_colors[s])
						.style('fill', '#fff')
						.attr('transform', 'translate('+l_height/2+' '+l_height/2+')');

					if(s!=="cix"){
						species_l[s].append('line')
							.attr('x1', l_width/2)
							.attr('x2', l_width/2)
							.attr('y1', 0)
							.attr('y2', l_height)
							.attr('stroke', 'rgba(0,0,0,0.2)');

						for(i = 0; i<6; i++){
							species_l[s].append('circle')
								.attr('cx', (l_width-l_height+10)+Math.random()*(l_width-l_height-12))
								.attr('cy', Math.random()*(l_height-4) + 2)
								.attr('r', 2)
								.style('fill', line_colors[s])
								.style('stroke', 'none');
						}
					}
				}

			});

			/*--- END DRAW CIRCLE TIMELINE ---*/


			/*------ DRAW THE MAP -------*/


			var data, 
				hdata,
				hdata_objects,
				max_instagram, 
				min_instagram,
				max_twitter, 
				min_twitter,
				o = {
					twitter : null,
					instagram : null
				};

			svg.append('image')
				.attr('xlink:href', 'images/pulse_background_lg.png')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', 542)
				.attr('height', 441);

			for(var h = 0; h<24; h++){
				svg.append('image')
					.attr('xlink:href', 'http://prjcts.sebastianmeier.eu/tsb/images/animation_'+h+'.png')
					.attr('x', 0)
					.attr('class', "animationLayer")
					.attr('id', "animationLayer_"+h)
					.attr('y', 0)
					.attr('width', 542)
					.attr('height', 441);
			}

			requestAnimationFrame(pulse.iterate);

		});
	};

	pulse.stateUpdate = function(){
		if(state){
			d3.select('.timetext').style('opacity', 1);
			d3.select('.playbtn').style('opacity', 0);
		}else{
			d3.select('.timetext').style('opacity', 0.3);
			d3.select('.playbtn').style('opacity', 1);
		}
	};

	pulse.iterate = function(){
		d3.selectAll('.animationLayer').style('display', 'none');
		d3.select('#animationLayer_'+hour).style('display', 'block');

		d3.selectAll('path.bg-pattern.odd').style('opacity',0.01);
		d3.selectAll('path.bg-pattern.even').style('opacity',0.03);

		var mh1 = hour-2; if(mh1<0){mh1 += 24;}
		var mh2 = hour-3; if(mh2<0){mh2 += 24;}
		var mh3 = hour-4; if(mh3<0){mh3 += 24;}

		d3.select('path.bg-'+(mh1)).style('opacity', 0.2);
		d3.select('path.bg-'+(mh2)).style('opacity', 0.1);
		d3.select('path.bg-'+(mh3)).style('opacity', 0.05);
		d3.select('path.bg-'+(hour-1)).style('opacity', 0.3);

		d3.select('.timetext').text(hour);
		
		if(state){
			hour++;
			if(hour>23){
				hour = 0;
			}

			requestAnimationFrame(debouncer(pulse.iterate, 200));
		}
	};

	pulse.reorder = function(key, array){
		var data = [];
		for(var i in array.histogram[key]){
			data.push({x:i, y:parseInt(array.histogram[key][i])});
		}
		return data;
	};

	return pulse;
}