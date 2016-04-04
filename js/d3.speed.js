/*global d3:false,console:false,debouncer:false */
/*jshint unused:false*/
function d3_speed(){
	var selection, image, btns = [
        {
            obj:false,
            x:50,
            y:234,
            title:'',
            copy:'',
            img:''
        },
        {
            obj:false,
            x:244,
            y:135,
            title:'',
            copy:'',
            img:''
        },
        {
            obj:false,
            x:344,
            y:377,
            title:'',
            copy:'',
            img:''
        },
        {
            obj:false,
            x:555,
            y:250,
            title:'',
            copy:'',
            img:''
        },
        {
            obj:false,
            x:612,
            y:145,
            title:'',
            copy:'',
            img:''
        }
    ],
    width=750,
    height=422;

	function speed(sel){
		selection = sel;
		speed.init();
	}

	speed.init = function(){
		selection.each(function(d, i) {
			var sel = d3.select(this);
			//Delete everything that exists (for resize, as not everything is data driven)
			sel = sel.append("svg");

            var defs = sel.append("defs")
                .append("radialGradient")
                .attr("id", "cgrad")
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%")
                .attr("fy", "50%")
                .attr("fx", "50%");

            defs.append("stop")
                .attr("offset", "0%")
                .attr("style", "stop-color:rgb(255,255,255); stop-opacity:1");

            defs.append("stop")
                .attr("offset", "100%")
                .attr("style", "stop-color:rgb(255,255,255); stop-opacity:0");

              image = sel.append("image")
                .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
                .attr("xlink:href","images/illu/speed_desc.gif");

            for(var j = 0; j<btns.length; j++){
                btns[j].obj = sel.append("g");

                btns[j].obj.append("circle")
                    .attr("r", 20)
                    .attr("fill", "url(#cgrad)");

                btns[j].obj.append("circle")
                    .attr("r", 10)
                    .attr("class", "fullcircle");

                btns[j].obj.append("circle")
                    .attr("r", 15)
                    .attr("class", "outercircle-1");

                btns[j].obj.append("circle")
                    .attr("r", 21)
                    .attr("class", "outercircle-2");

                btns[j].obj.append("circle")
                    .attr("r", 30)
                    .attr("class", "clickcircle")
                    .attr("id", "clickcircle-"+j)
                    .on("mouseenter", function(d){
                        var id = parseInt(d3.select(this).attr("id").split("-")[1]);
                        btns[id].obj.classed('active',true);
                    })
                    .on("mouseleave", function(d){
                        var id = parseInt(d3.select(this).attr("id").split("-")[1]);
                        btns[id].obj.classed('active',false);
                    })
                    .on("click", function(d){
                        var id = parseInt(d3.select(this).attr("id").split("-")[1]);
                        //showInfo
                    });
            }

            speed.resize();
        });
	};

    speed.resize = function(){
        selection.each(function(d, i) {
			var sel = d3.select(this);
            var bb = sel.node().getBoundingClientRect();

            var trans = bb.width/width;

            sel.selectAll("svg, image").attr("width", trans*width).attr("height", trans*height);

            for(var j = 0; j<btns.length; j++){
                btns[j].obj.attr("transform", "translate("+(btns[j].x*trans)+" "+(btns[j].y*trans)+") scale("+trans+")");
            }

        });
    };

	return speed;
}
