//example slider:
/*
var slider = {
	x = 10,
	y = 10,
	width = 20,
	height = 10,
	active = false,
	draw = drawSlider(x, y, width, height, active),
	clicked = sliderClick(this, [x,y])
}
*/

//draws a slider
function drawSlider(x, y, width, height, active) {
	strokeWeight(strokeWidth/2);
	stroke(0);
	var divX = width*1/5;
	if (active) {
		divX = width*3/5;
	}
	fill(0);
	rect(x,y,divX,height);
	fill(250);
	rect(x+divX, y, width-divX, height);
	fill(80);
	rect(x+divX, y-height/3, width*1.3/5, height*5/3);
}

//where slider is an object, and point is an array where 0=x 1=y
//requires inside box in maths.js
function sliderClick(slider, point) {

}
