function d3_technologie(){function t(a){e=a,t.init(),t.updateFocus(),$("#techCarousel").on("slide.bs.carousel",function(e){setTimeout(function(){t.updateFocus()},10)})}var e,a=!1;return t.updateFocus=function(){var t=$("#techCarousel .carousel-indicators .active").data("speed");$(".outline-circle").css("display","none"),$(".outline-circle-"+t).css("display","block")},t.resize=function(){t.init()},t.init=function(){e.each(function(t,e){var r=d3.select(this);r.selectAll("*").remove();var n=r.node().getBoundingClientRect(),s=n.width,i=n.height,o=(s-200)/1.5,l=i-50;440>s?(a=!0,o=s-100,i/=2,l=i-50):a=!1;var d=r.append("svg").attr("width",s).attr("height",i).append("g").attr("transform","translate(30 0)"),p=r.append("svg").attr("class","mobileSvg").attr("width",s).attr("height",i).append("g").attr("transform","translate(30 0)"),c=[1,2,6,16,30,50],g=0,u=0,h=[0,25,50,70,85,95,100],f=l/h.length,m=[6*f,5*f,4*f,3*f,2*f,f,0],b=d3.scale.linear().domain([0,5]).range([0,o]),v=d3.scale.ordinal().domain(["1","2","3","4","5","6"]).rangePoints([0,o]),y=d3.scale.linear().domain([0,2]).range([0,o]),x;x=a?d3.scale.ordinal().domain(["1","2","3"]).rangePoints([0,o]):d3.scale.ordinal().domain(["1","2","3"]).rangePoints([0,o/2]);var F=d3.scale.linear().domain(h).range(m),k=d3.svg.line().x(function(t,e){return b(e)}).y(function(t){return F(t)}),w=d3.svg.line().x(function(t,e){return y(e)}).y(function(t){return F(t)}),P=d3.svg.axis().scale(F).orient("left").tickFormat(function(t,e){var a=t;return 100===t&&(a+="%"),a}).tickValues([0,25,50,70,85,95,100]),L=d3.svg.axis().scale(F).orient("right").tickFormat(function(t,e){var a=t;return 100===t&&(a+="%"),a}).tickValues([0,25,50,70,85,95,100]),S=d3.svg.axis().scale(v).orient("bottom").tickFormat(function(t,e){var a="≥"+c[parseInt(t)-1];return a}),T=d3.svg.axis().scale(x).orient("bottom").tickFormat(function(t,e){var a="≥"+c[parseInt(t)-1];return 3===parseInt(t)&&(a+=" Mbit/s"),a}),_=d.append("g").attr("transform","translate(50, 50)");_.append("text").attr("class","headline").text("Leitungsgebunden").attr("transform","translate(-5, -25)");var A;A=a?p.append("g").attr("transform","translate(50, 50)"):d.append("g").attr("transform","translate("+(50+o+50)+", 50)"),A.append("text").attr("class","headline").text("Drahtlos").attr("transform","translate(-5, -25)");var E=d.append("g"),I=A.append("g");A.append("image").attr("class","technology").attr("xlink:href","images/wireless@2x.png").attr("width",50).attr("height",30).attr("x",-50).attr("y",-50),_.append("image").attr("class","technology").attr("xlink:href","images/cable@2x.png").attr("width",40).attr("height",27.5).attr("x",-50).attr("y",-50),[0,25,50,70,85,95,100].forEach(function(t,e,r){var n=[_];a&&n.push(A),n.forEach(function(e,r,n){e.append("line").attr("class","bg").attr("x1",-10).attr("x2",function(t){return a?o:1.5*o+10+50}).attr("y1",F(t)).attr("y2",F(t))})});var z=[{"short":"DSL","long":"Digital Subscriber Line",description:"",type:"cabel",speeds:[99.7,99.86,99.37,95.66,81.43,37.54]},{"short":"CATV","long":"Kabelnetz",description:"",type:"cabel",speeds:[88.92,88.92,88.92,88.92,88.92,88.92]},{"short":"FTTX","long":"Faseroptische Technologie",description:"",type:"cabel",speeds:[.35,.35,.35,.35,.35,.35]},{"short":"LTE","long":"Long Term Evolution",description:"",type:"mobile",speeds:[100,100,95.07]},{"short":"HSDPA","long":"Breitband-UMTS",description:"",type:"mobile",speeds:[99.94,43.47]}],B=["translate("+(b(0)+50)+" "+(F(z[0].speeds[0])+50+20)+")","translate("+(b(0)+50)+" "+(F(z[1].speeds[0])+50+20)+")","translate("+(b(0)+50)+" "+(F(z[2].speeds[0])+50-10)+")",a?"translate("+(y(z[3].speeds.length-2)-20)+" "+(F(z[3].speeds[z[3].speeds.length-2])+20)+")":"translate("+(b(z[3].speeds.length-1)+o+100+5)+" "+(F(z[3].speeds[z[3].speeds.length-1])+50+6)+")",a?"translate("+(y(z[4].speeds.length-1)+10)+" "+(F(z[4].speeds[z[4].speeds.length-1])+6)+")":"translate("+(b(z[4].speeds.length-1)+o+100+5)+" "+(F(z[4].speeds[z[4].speeds.length-1])+50+6)+")"];d.append("defs").append("pattern").attr("id","missing_pattern").attr("width",44).attr("height",44).attr("patternUnits","userSpaceOnUse").append("image").attr("width",44).attr("height",44).attr("x",0).attr("y",0).attr("xlink:href","images/pattern.png"),_.append("path").attr("class","missing").attr("fill","url(#missing_pattern)").attr("d",k(z[0].speeds)+"L"+b(z[0].speeds.length-1)+",0Z"),A.append("path").attr("class","missing").attr("fill","url(#missing_pattern)").attr("d",a?w(z[3].speeds)+"L"+y(z[3].speeds.length-1)+",0Z":k(z[3].speeds)+"L"+b(z[3].speeds.length-1)+",0Z"),z.forEach(function(t,e,r){var n;"mobile"===t.type?(n="rgba("+colorPalletes.green[u][0]+","+colorPalletes.green[u][1]+","+colorPalletes.green[u][2]+",1)",u++):(n="rgba("+colorPalletes.blue[g][0]+","+colorPalletes.blue[g][1]+","+colorPalletes.blue[g][2]+",1)",g++);var s=_;"mobile"===t.type&&(s=A);var i=E;a&&e>2&&(i=I),i.append("text").text(t["short"]).attr("class","speed-label").style("fill",n).attr("transform",B[e]);var l=s.append("g");l.append("path").attr("class","line").style("stroke",n).datum(t.speeds).attr("d","mobile"===t.type&&a?w:k),l.selectAll("circle.fill-cirlce").data(t.speeds).enter().append("circle").on("mouseover",function(){var t=d3.select(this);tooltip.content("<strong>"+t.attr("data-short")+"</strong><br />mit einer Geschwindigkeit von<br /> bis zu "+c[parseInt(t.attr("data-speed"))]+" Mbit/s ist in "+t.attr("data-d")+"%<br /> von Berlin verfügbar.");var e="mobile"===t.attr("data-type")&&a?$("#d3_technologie svg.mobileSvg").offset():$("#d3_technologie").offset(),r=e.left+50+30+("mobile"===t.attr("data-type")&&a?y(parseFloat(t.attr("data-i"))):"mobile"===t.attr("data-type")?b(parseFloat(t.attr("data-i")))+o+50:b(parseFloat(t.attr("data-i")))),n=e.top+50+F(parseFloat(t.attr("data-d")));tooltip.position([r,n]),tooltip.show()}).on("mouseout",function(){tooltip.hide()}).attr("r",3).attr("data-type",t.type).attr("data-short",t["short"]).attr("data-long",t["long"]).attr("data-d",function(t){return t}).attr("data-i",function(t,e){return e}).attr("data-speed",function(t,e){return e}).attr("data-description",t.description).attr("class","fill-circle").style("fill",n).attr("cx",function(e,r){return"mobile"===t.type&&a?y(r):b(r)}).attr("cy",function(t,e){return F(t)}),l.selectAll("circle.outline-cirlce").data(t.speeds).enter().append("circle").attr("r",5).on("mouseover",function(){var t=d3.select(this);tooltip.content("<strong>"+t.attr("data-short")+"</strong><br />mit einer Geschwindigkeit von<br /> bis zu "+c[parseInt(t.attr("data-speed"))]+" Mbit/s ist in "+t.attr("data-d")+"%<br /> von Berlin verfügbar.");var e="mobile"===t.attr("data-type")&&a?$("#d3_technologie svg.mobileSvg").offset():$("#d3_technologie").offset(),r=e.left+50+30+("mobile"===t.attr("data-type")&&a?y(parseFloat(t.attr("data-i"))):"mobile"===t.attr("data-type")?b(parseFloat(t.attr("data-i")))+o+50:b(parseFloat(t.attr("data-i")))),n=e.top+50+F(parseFloat(t.attr("data-d")));tooltip.position([r,n]),tooltip.show()}).on("mouseout",function(){tooltip.hide()}).attr("data-type",t.type).attr("data-short",t["short"]).attr("data-long",t["long"]).attr("data-d",function(t){return t}).attr("data-i",function(t,e){return e}).attr("data-speed",function(t,e){return e}).attr("data-description",t.description).style("fill",n).attr("class","outline-circle outline-circle-"+t["short"]).attr("cx",function(e,r){return"mobile"===t.type&&a?y(r):b(r)}).attr("cy",function(t,e){return F(t)})}),_.append("g").attr("class","x axis").attr("transform","translate(0,"+(l-f+10)+")").call(S),_.append("g").attr("transform","translate(-10, 0)").attr("class","y axis").call(P),A.append("g").attr("transform","translate("+(a?-10:o/2+10)+", 0)").attr("class","y axis").call(a?P:L),A.append("g").attr("class","x axis").attr("transform","translate(0,"+(l-f+10)+")").call(T)})},t}