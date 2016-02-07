/*global d3:false */
/*jshint unused:false*/
function d3_company(){
	var selection,
		y_count = 53,
		n = 3,
		o = 8,
		m = 9,
		width, height,
		fullwidth, fullheight;

	var companies = {
		airdata:{
			url:'http://www.airdata.ag/',
			desc:'',
			offset:{
				height:5,
				y:-1
			},
			img:'airdata',
			con:[
				{
					type:'hsdpa',
					path:[[0,3],[n+8,3],[n+8,4],[2*n+m,4]]
				}
			]
		},
		eplus:{
			url:'http://www.eplus.de/',
			desc:'',
			img:'eplus',
			offset:{
				height:5,
				y:4
			},
			con:[
				{
					type:'hsdpa',
					path:[[0,6],[n,6],[n,5],[2*n+m,5]]
				},
				{
					type:'lte',
					path:[[0,7],[n,7],[n,14],[2*n+m,14]]
				}
			]
		},
		telekom:{
			url:'http://www.telekom.de',
			desc:'',
			img:'telekom',
			offset:{
				height:5,
				y:15
			},
			con:[
				{
					type:'hsdpa',
					path:[[0,10],[n+1,10],[n+1,6],[2*n+m,6]]
				},
				{
					type:'lte',
					path:[[0,11],[n+2,11],[n+2,15],[2*n+m,15]]
				},
				{
					type:'dsl',
					path:[[0,12],[n+3,12],[n+3,27+o],[2*n+m,27+o]]
				},
				{
					type:'fttx',
					path:[[0,13],[n+1,13],[n+1,o+36],[2*n+m,o+36]]
				}
			]
		},
		o2:{
			url:'http://www.o2online.de/',
			desc:'',
			img:'o2',
			offset:{
				height:7,
				y:11
			},
			con:[
				{
					type:'hsdpa',
					path:[[0,16],[n+4,16],[n+4,7],[2*n+m,7]]
				},
				{
					type:'dsl',
					path:[[0,17],[n+4,17],[n+4,28+o],[2*n+m,28+o]]
				},
				{
					type:'lte',
					path:[[0,18],[n+8,18],[n+8,17],[2*n+m,17]]
				}
			]
		},
		vodafone:{
			url:'http://www.vodafone.de',
			desc:'',
			img:'vodafone',
			offset:{
				height:10,
				y:14
			},
			con:[
				{
					type:'hsdpa',
					path:[[0,23+o],[n+5,23+o],[n+5,8],[2*n+m,8]]
				},
				{
					type:'dsl',
					path:[[0,24+o],[n,24+o],[n,30+o],[2*n+m,30+o]]
				},
				{
					type:'lte',
					path:[[0,25+o],[n+7,25+o],[n+7,16],[2*n+m,16]]
				},
				{
					type:'catv',
					path:[[0,26+o],[n+2,26+o],[n+2,o+44],[2*n+m,o+44]]
				}
			]
		},
		dnsnet:{
			url:'http://www.dns-net.de/',
			desc:'',
			img:'dnsnet',
			con:[
				{
					type:'dsl',
					path:[[0,29+o],[2*n+m,29+o]]
				}
			]
		},
		versatel:{
			url:'https://www.versatel.de',
			desc:'',
			img:'versatel',
			con:[
				{
					type:'dsl',
					path:[[0,32+o],[n+8,32+o],[n+8,31+o],[2*n+m,31+o]]
				}
			]
		},
		ewe:{
			url:'https://www.ewe.de/',
			desc:'',
			img:'ewe',
			con:[
				{
					type:'fttx',
					path:[[0,35+o],[n+8,35+o],[n+8,37+o],[2*n+m,37+o]]
				}
			]
		},
		swap:{
			url:'http://www.swap-gmbh.de/',
			desc:'',
			img:'swap',
			con:[
				{
					type:'fttx',
					path:[[0,38+o],[2*n+m,38+o]]
				}
			]
		},
		rft:{
			url:'http://www.rftkabel.de/',
			desc:'',
			img:'rft',
			offset:{
				height:-2,
				y:6
			},
			con:[
				{
					type:'fttx',
					path:[[0,41+o],[n,41+o],[n,39+o],[2*n+m,39+o]]
				},
				{
					type:'catv',
					path:[[0,42+o],[n+8,42+o],[n+8,45+o],[2*n+m,45+o]]
				}
			]
		},
		primacom:{
			url:'http://www.primacom.de/',
			desc:'',
			img:'primacom',
			con:[
				{
					type:'catv',
					path:[[0,45+o],[n+7,45+o],[n+7,46+o],[2*n+m,46+o]]
				}
			]
		},
		dtk:{
			url:'http://www.deutschetelekabel.de/',
			desc:'',
			img:'deutschetelekabel',
			con:[
				{
					type:'catv',
					path:[[0,48+o],[2*n+m,48+o]]
				}
			]
		},
		telecolumbus:{
			url:'https://www.telecolumbus.de/home/',
			desc:'',
			img:'telecolumbus',
			con:[
				{
					type:'catv',
					path:[[0,51+o],[n+4,51+o],[n+4,47+o],[2*n+m,47+o]]
				}
			]
		},
	};

	var satellite = {
		eusanet:{
			url:'http://www.satspeed.de/en/',
			desc:'',
			img:'eusanet'	
		},
		eutelsat:{
			url:'http://www.tooway.de',
			desc:'Tochterunternehmen von Eutelsat',
			img:'tooway'	
		},
		filiago:{
			url:'https://www.filiago.de/',
			desc:'',
			img:'filiago'	
		},
		satinternet:{
			url:'http://www.satinternet.com/',
			desc:'',
			img:'satinternet'	
		},
		skydsl:{
			url:'https://www.skydsl.eu/de-DE/Satelliten-Internet',
			desc:'',
			img:'skydsl'	
		},
		stardsl:{
			url:'https://www.stardsl.net/',
			desc:'',
			img:'stardsl'	
		}
	};

	function company(sel){
		selection = sel;
		company.init();
	}

	company.resize = function(){
		company.init();
	};

	company.init = function(){
		selection.each(function(d) {
			var sel = d3.select(this);
			//Delete everything that exists (for resize, as not everything is data driven)
			sel.selectAll('*').remove();

			//Get current Size
			var bb = sel.node().getBoundingClientRect();
			fullwidth = bb.width-30;
			if(fullwidth > 450){
				fullwidth = 450;
			}
			fullheight = bb.height-100;
			width = fullwidth-200;
			height = fullheight-50;

			//Create SVG
			var svg = sel.append('svg')
						.attr('width', fullwidth)
						.attr('height', fullheight)
						.append('g')
							.attr('transform', 'translate(127 50)');

			//Scales
			var x = d3.scale.linear()
				.domain([0, 2*n+m])
				.range([0,width]),

			y = d3.scale.linear()
				.domain([0, y_count+o])
				.range([0,height]),

			//Line Helper
			line = d3.svg.line()
				.x(function(d) { return x(d[0]); })
				.y(function(d) { return y(d[1]); });

			var types = [], t;

			for(var i in companies){
				var first = true;
				for(var c in companies[i].con){

					var exists = false;
					for(t in types){
						if(types[t].name === companies[i].con[c].type){
							exists = true;
							if(types[t].y > companies[i].con[c].path[(companies[i].con[c].path.length-1)][1]){
								types[t].y = companies[i].con[c].path[(companies[i].con[c].path.length-1)][1];
							}
						}
					}
					if(!exists){
						types.push({
							name : companies[i].con[c].type,
							y :  companies[i].con[c].path[(companies[i].con[c].path.length-1)][1]
						});
					}

					svg.append('path')
						.attr('class', companies[i].con[c].type + " " + i)
						.datum(companies[i].con[c].path)
						.attr('d', line);

					if(first){
						var ih = 20;
						if(companies[i].offset && companies[i].offset.height){
							ih += companies[i].offset.height;
						}

						var iy = y(companies[i].con[0].path[0][1]-1);
						if(companies[i].offset && companies[i].offset.y){
							iy += companies[i].offset.y;
						}

						var img_class = i;
						for(var cc in companies[i].con){
							img_class += " "+companies[i].con[cc].type;
						}

						["bw", "color"].forEach(function(dd, ii, aa){
							svg.append('image')
								.attr('class', img_class+" "+dd)
								.attr('data-type', i)
								.attr('xlink:href', 'images/'+companies[i].img+'@2x'+((dd==="bw")?"_bw":"")+'.png')
								.attr('width', 80)
								.attr('height', ih)
								.attr('x', -100)
								.attr('y', iy)
								.on('mouseover', function(){ company.highlightComp(d3.select(this).attr('data-type')); })
								.on('mouseout', function(){ company.deHighlight(); });
						});					

						first = false;
					}
				}
			}

			for(t in types){
				svg.append('text')
					.text(types[t].name.toUpperCase())
					.attr('x', width+10)
					.attr('y', y(types[t].y)+7)
					.attr('data-type', types[t].name)
					.on('mouseover', function(){ company.highlight(d3.select(this).attr('data-type')); })
					.on('mouseout', function(){ company.deHighlight(); });
			}

			company.deHighlight();

			//Mobile
			svg.append('image')
				.attr('class', 'technology')
				.attr('xlink:href', 'images/wireless@2x.png')
				.attr('width', 100)
				.attr('height', 60)
				.attr('x', width-20)
				.attr('y', y(3)-65);

			svg.append('image')
				.attr('class', 'technology')
				.attr('xlink:href', 'images/cable@2x.png')
				.attr('width', 80)
				.attr('height', 55)
				.attr('x', width-8)
				.attr('y', y(21+o)-5);
		});
	};

	company.deHighlight = function(){
		d3.selectAll('#companies path')
			.style('stroke-width','2px')
			.style('stroke','rgba(110,205,245,1)');

		d3.selectAll('#companies image.color')
			.style('opacity', 0);

		d3.selectAll('#companies image.bw')
			.style('opacity', 1);
	};

	company.highlight = function(t){
		d3.selectAll('#companies path.'+t)
			.style('stroke-width','4px')
			.style('stroke','rgba(30,55,145,1)');

		d3.selectAll('#companies image.bw.'+t)
			.style('opacity', 0);

		d3.selectAll('#companies image.color.'+t)
			.style('opacity', 1);
	};

	company.highlightComp = function(t){
		d3.selectAll('#companies path.'+t)
			.style('stroke-width','4px')
			.style('stroke','rgba(30,55,145,1)');

		d3.selectAll('#companies image.bw.'+t)
			.style('opacity', 0);

		d3.selectAll('#companies image.color.'+t)
			.style('opacity', 1);
	};

	return company;
}