/*global d3:false */
/*jshint unused:false*/
function d3_tooltip(){
	var selection,tip,innertip,height,width = 250;

	function tooltip(sel){
		selection = sel;
		tooltip.init();
	}

	tooltip.init = function(){
		selection.each(function(d, i) {
			var sel = d3.select(this);

			tip = sel.append('div')
				.attr('id', 'tooltip')
				.attr('class', 'd3-tip');

			innertip = tip.append('div')
				.attr('id', 'tooltip-inner');

		});
	};

	tooltip.content = function(html){
		innertip.html(html);

		var visible = false;
		if(tip.style('display') === 'block'){
			visible = true;
		}
		tip.style('display','block');
		var bb = tip.node().getBoundingClientRect();
		height = bb.height;

		if(!visible){
			tip.style('display','none');
		}
	};

	tooltip.position = function(xy){
		tip.style('left', (xy[0]-width/2-4)+"px")
			.style('top', (xy[1]-height-12)+"px")
			.classed('right', false)
			.classed('left', false);

		if(xy[0]<width/2){
			tip.style('left', (xy[0]-10)+"px")
				.classed('left', true);
		}

		if(xy[0]>(window.innerWidth-width/2)){
			tip.style('left', (xy[0]-width+8)+"px")
				.classed('right', true);
		}
	};

	tooltip.show = function(){
		tip.style('display', 'block');
	};

	tooltip.hide = function(){
		tip.style('display', 'none');
	};

	return tooltip;
}