/*global d3:false,console:false,debouncer:false,NDTPlugin:false */
/*jshint unused:false*/
function speedTest(){

  var svgs = {}, 
    types =  ["upload","download"],
    max = {
      upload:6,
      download:30
    },
    labels = {
      upload:[0,1,2,3,4,5,6],
      download:[0,5,10,15,20,25,30]
    },
    fifties = {
      upload:false,
      download:false
    },
    short = {
      upload:'up',
      download:'down'
    },
    width = 300,
    height = 300,
    inner = 70,
    outer = 110,
    start = Math.PI/180*-70,
    end = Math.PI/180*251,
    aStart = start + Math.PI/2,
    aEnd = end + Math.PI/2,
    circleLines = {},
    scales = {},
    polarScale = d3.scale.linear().domain([0,360]).range([start,end]),
    donut = d3.svg.arc()
      .innerRadius(inner-15)
      .outerRadius(inner),
    state = false,
    ndt, interval,
    testScale = {
      upload : d3.scale.linear().range([aStart,aEnd]).domain([0,max.upload]),
      download : d3.scale.linear().range([aStart,aEnd]).domain([0,max.download])
    };

  function speed(){}

  speed.init = function () {
    types.forEach(function(d,i){
      //Build SVG
      svgs[d] = d3.select('#'+d).append('svg')
        .attr('height',width)
        .attr('width',height)
        .attr("viewBox", "0 0 "+width+" "+height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append('g').attr('transform','translate('+(width/2)+','+(height/2)+')');

       svgs[d].append('g').append('circle').attr('class','bg').attr('r',outer);

      //Build ticks and their labels
      svgs[d].append('g').selectAll('line').data(labels[d]).enter().append('line')
        .attr('class', 'ticks')
        .attr('x1', function(d,i){
          return speed.polarX(inner-15, start+(end-start)/6*i);
        })
        .attr('x2', function(d,i){
          return speed.polarX(outer+5, start+(end-start)/6*i);
        })
        .attr('y1', function(d,i){
          return speed.polarY(inner-15, start+(end-start)/6*i);
        })
        .attr('y2', function(d,i){
          return speed.polarY(outer+5, start+(end-start)/6*i);
        });

      svgs[d].append('g').selectAll('text').data(labels[d]).enter().append('text')
        .attr('class','speed-label')
        .attr('text-anchor', function(d){
          return (d===0)?'start':'middle';
        })
        .attr('dx', function(d,i){
          return speed.polarX(outer+15, start+(end-start)/6*i)-((d===0)?+5:0);
        })
        .attr('dy', function(d,i){
          return speed.polarY(outer+15, start+(end-start)/6*i)+6;
        })
        .text(function(d){
          return d+((d===0)?' Mbit/s':'');
        });

      //Build Background
      var c = [];
      for(var i = 1; i<4; i++){
        c.push(inner + (outer-inner)/4*i);
      }

      svgs[d].append('g').selectAll('circle').data(c).enter().append('circle')
        .attr('r', function(d){return d;})
        .attr('class', 'bg-circle');

    });
    
    d3.json('./data/data.json', function (err, data){
      if(err){console.log(err);}

      //the data is reduced to 360 items, 360 equals max-speed for type
      types.forEach(function(d,i){
        scales[d] = d3.scale.linear().domain([0, d3.max(data[d])]).range([inner, outer]);

        circleLines[d] = d3.svg.line()
          .x(function(dd,ii){
            return speed.polarX(scales[d](dd), polarScale(ii));
          })
          .y(function(dd,ii){
            return speed.polarY(scales[d](dd), polarScale(ii));
          });

        svgs[d].append('g').append('path').attr('class','trend').datum(data[d]).attr('d', circleLines[d]);

        svgs[d].append('g').append('circle').attr('class','overlay').attr('r',inner);

        svgs[d].append('g').append('path').attr('class','top-overlay').attr('d', function(){ 
          return d3.svg.arc()
            .innerRadius(inner-2)
            .outerRadius(outer+2)
            ({
              startAngle:aEnd,
              endAngle:(Math.PI*2)+aStart
            });

        });
        
        var c = [];
        for(var i = 0; i<4; i+=3){
          c.push(inner + (outer-inner)/3*i);
        }

        svgs[d].append('g').selectAll('circle').data(c).enter().append('circle')
          .attr('r', function(d){return d;})
          .attr('class', 'bg-circle');

          svgs[d].append('g').selectAll('line').data([start,end]).enter().append('line')
          .attr('class','startend')
          .attr('x1', function(d){
            return speed.polarX(inner,d);
          })
          .attr('x2', function(d){
            return speed.polarX(outer,d);
          })
          .attr('y1', function(d){
            return speed.polarY(inner,d);
          })
          .attr('y2', function(d){
            return speed.polarY(outer,d);
          });

        svgs[d].append('g').selectAll('line').data(labels[d]).enter().append('line')
          .attr('class', 'ticks inner-ticks')
          .attr('x1', function(d,i){
            return speed.polarX(inner-15, start+(end-start)/6*i);
          })
          .attr('x2', function(d,i){
            return speed.polarX(inner, start+(end-start)/6*i);
          })
          .attr('y1', function(d,i){
            return speed.polarY(inner-15, start+(end-start)/6*i);
          })
          .attr('y2', function(d,i){
            return speed.polarY(inner, start+(end-start)/6*i);
          });

        //Top Scale
        svgs[d].append('text').text('0%').attr('dy',15-inner).attr('class','speed-label topscale').attr('text-anchor','middle');
        svgs[d].append('text').text('100%').attr('dy',-outer-10).attr('class','speed-label topscale').attr('text-anchor','middle');
        svgs[d].append('line').attr('class','ticks topscale')
          .attr('y1',-inner)
          .attr('y2',-outer);
        svgs[d].append('g').selectAll('line').data(new Array(5)).enter().append('line').attr('class','ticks topscale')
          .attr('x1',-3)
          .attr('x2',3)
          .attr('y1',function(d,i){ return -inner - i*(outer-inner)/4; })
          .attr('y2',function(d,i){ return -inner - i*(outer-inner)/4; })
          .style('opacity', function(d,i){
            if(i===2){return 0;}else{return 0.5;}
          });
        svgs[d].append('rect').attr('y',-((outer-inner)/2+inner+5)).attr('x',-10).attr('width',20).attr('height',11).style('fill','#fff');
        svgs[d].append('text').text('50%').attr('dy',5-((outer-inner)/2+inner)).attr('class','speed-label topscale').attr('text-anchor','middle');

        //Speed Texts
        svgs[d].append('text').attr('dy',15).attr('text-anchor','middle').attr('id','spdtst_'+d).attr('class','speed_live').text('0.00');
        svgs[d].append('text').text(d).attr('text-anchor','middle').attr('dy',35).attr('class','speed_type');
        svgs[d].append('text').text('Mbit/s').attr('text-anchor','middle').attr('dy',-25).attr('class','speed_speed');

        //Finding the 50% marker position
        data[d].forEach(function(dd,ii){
          if(dd < data[d][0]/2 && !fifties[d]){
            fifties[d] = ii;
          }
        });

        var d2 = data[d][fifties[d]],
          d1 =  data[d][fifties[d]-1];

        fifties[d] = fifties[d]-1 + (d2-d1)/(d1 - data[d][0]/2);

        //Avg Point & Line

        svgs[d].append('g').append('circle').attr('class','avg').attr('r',3)
          .attr('cx', speed.polarX(scales[d](data[d][0]/2), polarScale(fifties[d])))
          .attr('cy', speed.polarY(scales[d](data[d][0]/2), polarScale(fifties[d])));

        svgs[d].append('g').append('line').attr('class','avg inneravg').attr('r',3)
          .attr('x1', speed.polarX(scales[d](data[d][0]/2), polarScale(fifties[d])))
          .attr('y1', speed.polarY(scales[d](data[d][0]/2), polarScale(fifties[d])))
          .attr('x2', speed.polarX(inner-15, polarScale(fifties[d])))
          .attr('y2', speed.polarY(inner-15, polarScale(fifties[d])));


        svgs[d].append('g').append('line').attr('class','avg')
          .attr('x1', speed.polarX(scales[d](data[d][0]/2), polarScale(fifties[d])))
          .attr('y1', speed.polarY(scales[d](data[d][0]/2), polarScale(fifties[d])))
          .attr('x2', speed.polarX(scales[d](data[d][0]/2), polarScale(fifties[d])))
          .attr('y2', height);

        d3.select('#'+d).append('div').attr('class','avg-text').html(function(){
          if(d==='upload'){
            return 'Durchschnitt Berliner Speed-Test Nutzer*innen: '+(d.charAt(0).toUpperCase() + d.slice(1))+'-Geschwindigkeit <strong>'+(fifties[d]/360*max[d]).toFixed(2)+'&nbsp;Mbit/s</strong>';
          }else{
            return '<span class="visible-xs">Durchschnitt Berliner Speed-Test Nutzer*innen: </span>'+(d.charAt(0).toUpperCase() + d.slice(1))+'-Geschwindigkeit <strong>'+(fifties[d]/360*max[d]).toFixed(2)+'&nbsp;Mbit/s</strong>';
          }
        });

      });

      d3.select('#spdtst-start').on('click', function(){
        if(!state){
          state = true;

          d3.select('#spdtst-start').text('Test läuft...').classed('active',true);

          types.forEach(function(d){
            //Resetting the numbers to be sure
            svgs[d].select('.speed_live').text('0.00').classed('waiting',true);

            //Removing old arcs
            svgs[d].select('.live-test').remove();
            var live = svgs[d].append('g').attr('class','live-test');

            //Add new arc
            live.append('path').datum({newEndAngle:aStart,newStartAngle:aStart,startAngle:aStart,endAngle:aStart}).attr('d', donut);

          });

          ndt = new NDTPlugin('./js');

          if(ndt.check()){
            ndt.getServer(
              function(success){
                ndt.setServer(success);
                ndt.run();
                interval = setInterval(speed.reportStatus, 100);
              },
              function(error){
                console.log('error', error);
              }
            );
          }else{
            console.log('sorry your browser does not support this');
          }
        }
      });
    });
  };

  speed.reportStatus = function () {
    var status = ndt.getStatus();

    types.forEach(function(d){
      var spd = speed.cleanSpeed(status[short[d]], max[d]);
      var txt = (spd<10)?spd.toFixed(2):spd.toFixed(1);
      if(spd === max[d]){
        if(d==="upload"){
          txt = max[d].toFixed(1)+'+';
        }else{
          txt = max[d]+'+ ';
        }
      }
      svgs[d].select('.speed_live').text(txt);
      if(spd > 0){
        svgs[d].select('.speed_live').classed('waiting',false);
      }

      svgs[d].select('.live-test path').datum(function(dd){
        dd.newStartAngle = aStart;
        dd.newEndAngle = testScale[d](spd);
        return dd;
      }).transition().duration(100).attrTween("d", speed.arcTween());
    });

    if(status.error.match(/completed/)){
      clearInterval(interval);
      state = false;
      d3.select('#spdtst-start').html('<span class="image image-speed"></span>Erneut testen!').classed('active',false);
    }
  };

  speed.polarX = function (radius, angle){
    return radius * Math.cos(angle);
  };

  speed.polarY = function(radius, angle){
    return radius * Math.sin(angle);
  };

  speed.cleanSpeed = function (s,limit) {
    s = parseFloat(s);
    if(isNaN(s)){s = 0;}
    if(s<0){s = 0;}
    if(s>limit){s = limit;}
    return s;
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