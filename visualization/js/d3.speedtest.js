/*global d3:false,console:false,debouncer:false,NDTPlugin:false */
/*jshint unused:false*/
function speedTest(){

  var svgs = {indicator:{},graph:{}}, 
    types =  ["upload","download"],
    max = {
      upload:6,
      download:30
    },
    speeds = {
      upload:0,
      download:0
    },
    rotation = {
      upload:0,
      download:0
    },
    datamax = {
      upload:0,
      download:0
    },
    fifties = {
      upload:false,
      download:false
    },
    short = {
      upload:'up',
      download:'down'
    },
    axis = {
      upload:{x:null,y:null},
      download:{x:null,y:null}
    },
    indicator = {
      width : 150,
      height : 150,
      radius : 70
    },
    graph = {
      height : 150,
      width : 480
    },
    errMsg = false,
    graphHeight = 110,
    graphWidth = 400,
    scales = {},
    donut = d3.svg.arc()
      .innerRadius(indicator.radius-2)
      .outerRadius(indicator.radius+2),
    state = false,
    ndt, interval,
    max_items = 49,
    data,
    testScale = {
      upload : {
        x: d3.scale.linear().range([0,graphWidth]).domain([0,max.upload]),
        y: d3.scale.linear().range([0,graphHeight]).domain([100,0]),
        area: d3.svg.area()
          .x(function(d) { 
            return testScale.upload.x(d[1]/max_items*max.upload); 
          })
          .y1(function(d) { 
            return testScale.upload.y(d[0]/datamax.upload*100);
          })
          .y0(graphHeight)
      },
      download : {
        x: d3.scale.linear().range([0,graphWidth]).domain([0,max.download]),
        y: d3.scale.linear().range([0,graphHeight]).domain([100,0]),
        area: d3.svg.area()
          .x(function(d) {
            return testScale.download.x(d[1]/max_items*max.download); 
          })
          .y1(function(d) { 
            return testScale.download.y(d[0]/datamax.download*100); 
          })
          .y0(graphHeight)
      }
    };

  function speed(){}

  speed.init = function () {
    types.forEach(function(d,i){
      //Build SVG

      //INDICATOR
      svgs.indicator[d] = d3.select('#'+d+'_indicator').append('svg')
        .attr('height',indicator.height)
        .attr('width',indicator.width)
        .attr("viewBox", "0 0 "+indicator.width+" "+indicator.height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append('g').attr('transform','translate('+(indicator.width/2)+','+(indicator.height/2)+')');

      svgs.indicator[d].append('g').append('circle').attr('class','bg').attr('r',indicator.radius);

      //Speed Texts
      svgs.indicator[d].append('text').style('opacity',0.5).attr('dy',15).attr('text-anchor','middle').attr('id','spdtst_'+d).attr('class','speed_live').text('0.00');
      svgs.indicator[d].append('text').style('opacity',0.5).text(d).attr('text-anchor','middle').attr('dy',35).attr('class','speed_type');
      svgs.indicator[d].append('text').style('opacity',0.5).text('Mbit/s').attr('text-anchor','middle').attr('dy',-25).attr('class','speed_speed');

      svgs.indicator[d].append('path')
        .attr('transform','rotate('+rotation[d]+')')
        .attr('id',d+'_progress')
        .datum({newEndAngle:Math.PI/4,newStartAngle:0,startAngle:0,endAngle:Math.PI/4,opacity:0,type:d})
        .attr('d', donut)
        .attr('class','progress')
        .style('opacity',0);

      //GRAPH

      svgs.graph[d] = d3.select('#'+d+'_graph').append('svg')
        .attr('height',graph.height)
        .attr('width',graph.width)
        .attr("viewBox", "0 0 "+graph.width+" "+graph.height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append('g').attr('transform','translate('+((graph.width-graphWidth)/2)+','+((graph.height-graphHeight)/2)+')');

      //Background lines
      var bglines = [25,50,75,100];      
      svgs.graph[d].append('g').selectAll('line').data(bglines).enter().append('line')
        .attr('class','bglines')
        .attr('x1',0)
        .attr('x2',graphWidth)
        .attr('y1', testScale[d].y)
        .attr('y2', testScale[d].y);

      //Axis
      axis[d].x = d3.svg.axis().orient('bottom').scale(testScale[d].x).ticks(7)
        .tickFormat(function(dd){ 
          return dd + ((dd===max[d])?' Mbit/s':''); 
        });
      svgs.graph[d].append('g').attr('class','axis x-axis').attr('transform','translate(0,'+graphHeight+')').call(axis[d].x);

      axis[d].y = d3.svg.axis().orient('left').scale(testScale[d].y).tickValues([0,25,50,75,100]);
      svgs.graph[d].append('g').attr('class','axis y-axis').attr('transform','translate(0,0)').call(axis[d].y);

    });

    speed.animate();

    d3.json('./data/data.json', function (err, d){
      if(err){ console.log(err); }
      data = d;

      types.forEach(function(d,i){
        datamax[d] = d3.max(data[d], function(d){return d[0];});
        svgs.graph[d].append('g').append('path').datum(data[d]).attr('class','trend').attr('d', testScale[d].area);

        //Finding the 50% marker position
        data[d].forEach(function(dd,ii){
          if(dd[0] < data[d][0][0]/2 && !fifties[d]){
            fifties[d] = ii;
          }
        });

        var d2 = data[d][fifties[d]][0],
            d1 = data[d][fifties[d]-1][0],
            t = ((data[d][0][0]/2-d2)/(d1-d2));

        fifties[d] = data[d][fifties[d]][1] + t * (data[d][fifties[d]-1][1]-data[d][fifties[d]][1]);

        svgs.graph[d].append('g').attr('transform','translate('+testScale[d].x((fifties[d]/max_items*max[d]))+','+testScale[d].y(50)+')')
          .append('circle')
          .attr('r',3)
          .attr('class','avg');

        svgs.graph[d].append('g').append('path')
          .attr('class','avg')
          .attr('d', 'M'+testScale[d].x((fifties[d]/max_items*max[d]))+','+graphHeight+
            'L'+testScale[d].x((fifties[d]/max_items*max[d]))+','+testScale[d].y(50)+
            'L'+testScale[d].x(max[d]/2)+','+testScale[d].y(62.5)+
            'L'+(testScale[d].x(max[d])-((d==='upload')?0:57))+','+testScale[d].y(62.5)
          );

        var coverup = svgs.graph[d].append('g').append('line')
          .attr('class','coverup')
          .attr('y1',graphHeight/4)
          .attr('y2',graphHeight/4)
          .attr('x1',graphWidth/2-5);

        if(d==='upload'){
          coverup.attr('x2',graphWidth);
        }else{
          coverup.attr('x2',graphWidth-57);
        }

        var avgtext = svgs.graph[d].append('g').attr('transform','translate('+testScale[d].x((max[d]/2))+','+((d==='upload')?5:20)+')').append('text');

        if(d==='upload'){ avgtext.append('tspan').attr('x',0).attr('dy','1.25em').text('Durchschnitt Berliner Speed-Test'); }
        avgtext.append('tspan').attr('x',0).attr('dy','1.25em').text(((d==='upload')?'Nutzer*innen: ':'')+(fifties[d]/max_items*max[d]).toFixed(2)+' Mbit/s '+ d.charAt(0).toUpperCase() + d.slice(1));

      });

      d3.select('#spdtst-start').on('click', function(){
        if(!state){
          state = true;

          d3.select('#spdtst-start').text('Test läuft...').classed('active',true);
          d3.selectAll('.speed_live,.speed_speed,.speed_type,path').style('opacity',1);

          d3.selectAll('circle.userspeed').remove();

          d3.selectAll('#spdtst path.progress').datum(function(dd){
            dd.opacity = 1;
            dd.newEndAngle = Math.PI/4;
            dd.endAngle = Math.PI/4;
            return dd;
          });

          speed.animate();

          d3.selectAll('#spdtst .speed_live').text('0.00');

          ndt = new NDTPlugin('./js');

          if(ndt.check()){
            ndt.getServer(
              function(success){
                ndt.setServer(success);
                ndt.run();
                interval = setInterval(speed.reportStatus, 100);
              },
              function(error){
                if(error){
                  alert('Leider konnte der Test nicht erfolgreich durchgeführt werden. Dies kann möglicherweise an einer Firewall oder ähnlichen Sicherheitsvorkehrungen liegen.');
                  d3.selectAll('#spdtst path.progress').datum(function(dd){
                    dd.opacity = 0;
                    dd.newEndAngle = Math.PI*2;
                    return dd;
                  });
                }
                console.log('error', error);
              }
            );
          }else{
            d3.select('#spdtst-start').remove();
            if(!errMsg){
              d3.select('#spdtst>.container>.row>.col').append('p').attr('class','spd-note').text('Leider unterstütz Ihr Browser nicht die Mindestanforderungen.');
              errMsg = true;
            }
            d3.selectAll('#spdtst path.progress').datum(function(dd){
              dd.opacity = 0;
              dd.newEndAngle = Math.PI*2;
              return dd;
            });
            console.log('sorry your browser does not support this');
          }
        }
      });
    });
  };

  speed.speed2pop = function(s, d){
    var fifties = false;
    data[d].forEach(function(dd,ii){
      if(max[d]/max_items*ii > s && !fifties){
        fifties = ii;
      }
    });

    var d2 = data[d][fifties][1]/max_items*max[d],
        d1 = data[d][fifties-1][1]/max_items*max[d],
        t = ((s-d2)/(d1-d2));

    fifties = (data[d][fifties][0] + t * (data[d][fifties-1][0]-data[d][fifties][0]))/data[d][0][0]*100;
    return fifties;
  };

  speed.animate = function(){
    types.forEach(function(d,i){
      d3.select('#'+d+'_progress')
        .transition().duration(2000)//.ease('linear')
          .attrTween('transform',speed.rotTween())
          .style('opacity',function(d){return d.opacity;})
          .attrTween("d", speed.arcTween()).each('end', function(d){
            if(d.type === 'upload'){
              if(state){
                speed.animate();
              }
            }
          });
    });
  };

  speed.rotTween = function () {
    return function(d) {
      var i = d3.interpolate(0, 360);
      return function(t) {
        return "rotate(" + i(t) + ")";
      };
    };
  };

  speed.reportStatus = function () {
    var status = ndt.getStatus();

    if(status.error.indexOf('Test failed')>=0){
      d3.select('#spdtst-start').remove();
      if(!errMsg){
        d3.select('#spdtst>.container>.row>.col').append('p').attr('class','spd-note').text('Leider unterstütz Ihr Browser nicht die Mindestanforderungen oder eine Firewall verhindert das Durchführen des Tests.');
        errMsg = true;
      }
      d3.selectAll('#spdtst path.progress').datum(function(dd){
        dd.opacity = 0;
        dd.newEndAngle = Math.PI*2;
        return dd;
      });
      clearInterval(interval);
    }else{
      types.forEach(function(d){
        var spd = parseFloat(status[short[d]]);
        if(spd === 'NaN' ||isNaN(spd)){spd = 0;}
        speeds[d] = spd;
        var txt = (spd<10)?spd.toFixed(2):(spd>99)?Math.round(spd):spd.toFixed(1);
        svgs.indicator[d].select('.speed_live').text(txt);
        if(spd > 0){
          d3.select('#'+d+'_progress').datum(function(dd){
            dd.newEndAngle += Math.PI/100;
            return dd;
          });
          if(d==='download'){
            d3.select('#upload_progress').datum(function(dd){
              dd.newEndAngle = Math.PI*2;
              if(dd.opacity>0){
                speed.setPoint('upload');
              }
              dd.opacity = 0;
              return dd;
            });
          }
        }
      });

      if(status.error.match(/completed/)){
        clearInterval(interval);
        d3.select('#download_progress').datum(function(dd){
          dd.newEndAngle = Math.PI*2;
          dd.opacity = 0;
          return dd;
        });

        setTimeout(function(){
          state = false;
          speed.setPoint('download');
          d3.select('#spdtst-start').html('<span class="image image-speed"></span>Erneut testen!').classed('active',false);
        }, 2000);
      }
    }
  };

  speed.setPoint = function(d){
    if(speeds[d] < max[d]){
      var pop = speed.speed2pop(speeds[d], d);
      for(var i = 0; i<2; i++){
        var p = svgs.graph[d].append('circle')
          .attr('r', 5)
          .attr('cx',testScale[d].x(speeds[d]))
          .attr('cy',testScale[d].y(pop))
          .attr('class','userspeed'+((i===0)?' ani':''));

        if(i===0){
          p.transition().duration(500).style('opacity',0).attr('r',20);
        }
      }
    }
  };

  //http://bl.ocks.org/mbostock/5100636
  speed.arcTween = function () {
    return function(d) {
      var interpolateStart = d3.interpolate(d.startAngle, d.newStartAngle);
      var interpolateEnd = d3.interpolate(d.endAngle, d.newEndAngle);
      return function(t) {
        d.endAngle = interpolateEnd(t);
        d.startAngle = interpolateStart(t);
        return donut(d);
      };
    };
  };

  return speed;
}