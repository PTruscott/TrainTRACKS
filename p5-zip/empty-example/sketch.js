var fr = 60
var mouseClicked = false;
var activeType = 0;
var roadStatus = "blank";
var radius = 40;
var trainSelected = false;

var sideStations = new Array();
var placedStations = new Array();
var pinnedStation;

var roads = new Array();
var road = {x: 0, y: 0};
var train = {x: 0, y: 0};
var trains = new Array();

var trainSpeed = 1;
var osc;

function newStation(example, type, x, y) {
	if (example) {
		sideStations.push({type: type, x: x, y: y});
	}
	else {
		placedStations.push({type: type, x: x, y: y});
	}
}

function setup() {
	createCanvas(800, 800);
	frameRate(fr);
	for (var i = 0; i < 4; i++) {
		newStation(true, i, radius, (i+1)*radius*2.5);
	}
	road.y = 6*radius*2;
	road.x = radius/2;
	train.x = road.x;
	train.y = 7*radius*2;

	// A triangle oscillator
	osc = new p5.TriOsc();
	// Start silent
  	osc.start();
  	osc.amp(0);
}

function draw() {
	background(255);

	stroke(0);
	for (var i = 0; i < roads.length; i++) {
		line(roads[i].station1.x, roads[i].station1.y,
			roads[i].station2.x, roads[i].station2.y);
	}
	if (roadStatus == "pinned") {
		stroke(153);
		line(pinnedStation.x, pinnedStation.y, mouseX, mouseY);
	}


	var colour;
	for (var i = 0; i < sideStations.length; i++) {
		colour = getColourFromType(sideStations[i].type)
		fill(colour);
		ellipse(sideStations[i].x, sideStations[i].y, radius, radius);
	}
	for (var i = 0; i < placedStations.length; i++) {
		colour = getColourFromType(placedStations[i].type)
		fill(colour);

		ellipse(placedStations[i].x, placedStations[i].y, radius, radius);
	}
	fill(0);
	rect(road.x, road.y, radius, radius/2);
	fill("#FF0000");
	rect(train.x, train.y, radius, radius/2);//.transform({rotation:90});
	if (trainSelected) {
		rect(mouseX-radius/2, mouseY-radius/4, radius, radius/2);
	}
	for (var i = 0; i < trains.length; i++) {
		rect(trains[i].road.station1.x-radius/2, trains[i].road.station1.y-radius/4, radius, radius/2);
	}
	if (mouseClicked) {
		fill(getColourFromType(activeType));
		ellipse(mouseX, mouseY, radius, radius);;
	}


}

function mousePressed() {
	if (mouseClicked) {
		newStation(false, activeType, mouseX, mouseY);
		mouseClicked = false;
	}
	else {
		//check collisions and select if example or delete
		if (mouseY > train.y && mouseY < (train.y + radius/2)
				&& mouseX > train.x && mouseX < (train.x + radius)) {
				trainSelected = !trainSelected;
		}
		else if (trainSelected) {
			for (var i = 0; i < roads.length; i++) {			
				if (line_intersects(
					roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
					mouseX-radius/2, mouseY-radius/4, mouseX-radius/2, mouseY+radius/4) || 
					line_intersects(
					roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
					mouseX-radius/2, mouseY-radius/4, mouseX+radius/2, mouseY-radius/4) || 
					line_intersects(
					roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
					mouseX+radius/2, mouseY-radius/4, mouseX+radius/2, mouseY+radius/4) || 
					line_intersects(
					roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
					mouseX-radius/2, mouseY+radius/4, mouseX+radius/2, mouseY+radius/4)) {
					trains.push({road:roads[i]});
					trainSelected = false;
					break;
				}
				
			}
		}
		else if (roadStatus == "blank") {
			for (var i = 0; i < sideStations.length; i++) {
				if (Math.sqrt(
					(sideStations[i].x-mouseX)*(sideStations[i].x-mouseX) + 
					(mouseY-sideStations[i].y)*(mouseY-sideStations[i].y)) 
					< radius) {
					activeType = sideStations[i].type;
					mouseClicked = true;
					break;
				}
			}
			for (var i = 0; i < placedStations.length; i++) {
				if (Math.sqrt(
					(placedStations[i].x-mouseX)*(placedStations[i].x-mouseX) + 
					(mouseY-placedStations[i].y)*(mouseY-placedStations[i].y)) 
					< radius) {
					var numList = new Array();
					for (var j = 0; j < roads.length; j++) {
						if (!(roads[j].station1 == placedStations[i] || roads[j].station2 == placedStations[i])) {
							numList.push(roads[j]);
						}
					}
					roads = numList;
					playNote(placedStations[i].type, radius);

					placedStations.splice(i, 1);
					break;
				}
			}
			if (mouseY > road.y && mouseY < (road.y + radius/2)
				&& mouseX > road.x && mouseX < (road.x + radius)) {
				roadStatus = "active";
			}
		}
		else {
			for (var i = 0; i < placedStations.length; i++) {
				if (Math.sqrt(
					(placedStations[i].x-mouseX)*(placedStations[i].x-mouseX) + 
					(mouseY-placedStations[i].y)*(mouseY-placedStations[i].y)) 
					< radius) {
					if (roadStatus == "active") {
						pinnedStation = placedStations[i];
						roadStatus = "pinned";
					}
					else if (roadStatus == "pinned" && pinnedStation != placedStations[i]) {
						roadStatus = "blank";
						roads.push({station1: pinnedStation, station2: placedStations[i]});
					}
					break;
				}
			}
			if (mouseY > road.y && mouseY < (road.y + radius/2)
				&& mouseX > road.x && mouseX < (road.x + radius)) {
				roadStatus = "blank";
			}
		}
	}
	redraw();
}

function mouseReleased() {
  osc.fade(0,0.5);
}

function getColourFromType(type) {
	var colour = "#000000";
	if (type == 1) {
		colour = "#FF0000";
	}
	else if (type == 2) {
		colour = "#800000";
	}
	else if (type == 3) {
		colour = "#FFFF00"
	}
	return colour;
}

function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return true;
    }

    return false; // No collision
}

function playNote(type, radius) {
	var note = 62;

	if (type == 1) {
		note = 64;
	}
	else if (type == 2) {
		note =65;
	}
	else if (type == 3) {
		note = 67;
	}

	duration = radius*8;
	osc.freq(midiToFreq(note));
	// Fade it in
  	osc.fade(0.5,0.2);

  	// If we sest a duration, fade it out
  	if (duration) {
    	setTimeout(function() {
      	osc.fade(0,0.2);
    	}, duration-50);
  	}
}

