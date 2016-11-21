//example slider:
/*
var slider = {
	x:10,
	y:10,
	width:20,
	height:10,
	active:false,
	colour: 0
	draw: function() {drawSlider(this)},
	click:function(point) {sliderClick(slider, point)},
}*/

//draws a slider
function drawSlider(slider) {
	strokeWeight(strokeWidth/2);
	stroke(0);
	var divX = slider.width*1/5;
	if (slider.active) {
		divX = divX*3;
	}
	fill(slider.colour);
	rect(slider.x,slider.y,divX,slider.height);
	fill(250);
	rect(slider.x+divX, slider.y, slider.width-divX, slider.height);
	fill(80);
	rect(slider.x+divX, slider.y-slider.height/3, slider.width*1.3/5, slider.height*5/3);
}

//where slider is an object, and point is an array where 0=x 1=y
//requires inside box in maths.js
//returns true if clicked and changes state of slider
function sliderClick(slider, point) {
	if (insideBox([slider.x,slider.y,slider.x+slider.width,slider.y+slider.height], point)) {
		slider.active = !slider.active;
		//console.log("clicked");
		return true;
	}
	else {
		var divX = slider.width*1/5;
		if (slider.active) {
			divX = divX*3;
		}
		if (insideBox([slider.x+divX,slider.y-slider.height/3,slider.x+divX+slider.width*1.3/5, slider.y+slider.height*5/3], point)) {
			slider.active = !slider.active;
			return true;
		}
	}	
	return false;
}
