/*global d3:false,console:false,debouncer:false */
/*jshint unused:false*/
function d3_speed(){
	var selection, image, btns = [
        {
            obj:false,
            x:50,
            y:234
        },
        {
            obj:false,
            x:244,
            y:135
        },
        {
            obj:false,
            x:344,
            y:377
        },
        {
            obj:false,
            x:555,
            y:250
        },
        {
            obj:false,
            x:612,
            y:145
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
			sel.selectAll('*').remove();

            image = sel.append("image")
                .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
                .attr("xlink:href","images/illu/speed_desc.gif");

            for(var j = 0; j<btns.length; j++){
                btns[j].obj = sel.append("g");

                btns[j].obj.append("circle")
                    .attr("r", 10)
                    .attr("class", "fullcircle");

                btns[j].obj.append("circle")
                    .attr("r", 15)
                    .attr("class", "outercircle");

                btns[j].obj.append("circle")
                    .attr("r", 20)
                    .attr("class", "outercircle");

                btns[j].obj.append("circle")
                    .attr("r", 25)
                    .attr("class", "clickcircle");
            }

            speed.resize();
        });
	};

    speed.resize = function(){
        selection.each(function(d, i) {
			var sel = d3.select(this);
            var bb = sel.node().getBoundingClientRect();

            var trans = bb.width/width;

            image.attr("width", trans*width).attr("height", trans*height);

            for(var j = 0; j<btns.length; j++){
                btns[j].obj.attr("transform", "translate("+(btns[j].x*trans)+" "+(btns[j].y*trans)+") scale("+trans+")");
            }

        });
    };

	return speed;
}
