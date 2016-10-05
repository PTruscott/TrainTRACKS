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

var trainSpeed = 3;
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
	createCanvas(screen.width, screen.height);
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
	background('#ADD8E6');

	//sidepanel
	noStroke();
	fill('#3399ff');
	rect(0, 0, sideStations[0].x*2, screen.height);

	strokeWeight(6);
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
	noStroke();
	rect(train.x-3, train.y-3, radius+6, radius/2+6);

	if (trainSelected) {
		var r = trainOverLine(mouseX, mouseY);
		if (!r) {
			rect(mouseX-radius/2-3, mouseY-radius/4-3, radius+6, radius/2+6);
		}
		else {
			var theta = toDegrees(Math.atan((r.station1.y-r.station2.y)/(r.station1.x-r.station2.x)));
			var centre = getClosestPointOnLine(r.station1, r.station2, [mouseX, mouseY]);
			drawTrain(centre[0], centre[1], theta);
		}
	}

	//drawing trains
	for (var i = 0; i < trains.length; i++) {
		var theta = toDegrees(Math.atan((trains[i].road.station1.y-trains[i].road.station2.y)/(trains[i].road.station1.x-trains[i].road.station2.x)));
		drawTrain(trains[i].x, trains[i].y, theta);
		moveTrain(trains[i]);
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
			var r = trainOverLine(mouseX, mouseY);
			console.log(r);
			if (r) {
				var pos = getClosestPointOnLine(r.station1, r.station2, [mouseX, mouseY]);
				var s = r.station2;
				if (r.station1.y > r.station2.y) {
					s = r.station1;
				}
				trains.push({road:r, x:pos[0], y:pos[1], docked: false, target: s});
				trainSelected = false;
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
					var roadList = new Array();
					var dList = new Array();
					for (var j = 0; j < roads.length; j++) {
						if (!(roads[j].station1 == placedStations[i] || roads[j].station2 == placedStations[i])) {
							roadList.push(roads[j]);
						}
						else {
							dList.push(roads[j]);
						}
					}
					var tList = new Array();
					top:for (var j = 0; j < trains.length; j++) {
						for (var k = 0; k < dList.length; k++) {
							if (trains[j].road == dList[k]) {
								break top;
							}
						}
						tList.push(trains[j]);
					}
					trains = tList;
					roads = roadList;
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
  //osc.fade(0,0.5);
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

function moveTrain(train) {
	var theta = toDegrees(Math.atan((train.road.station1.y-train.road.station2.y)/(train.road.station1.x-train.road.station2.x)));
	if (train.target == train.road.station1) {
		var otherStaion = train.road.station2;
	}
	else {
		var otherStaion = train.road.station1;
	}
	if (train.target.x > otherStaion.x) {
		train.x += trainSpeed*Math.cos(toRadians(theta));
		train.y += trainSpeed*Math.sin(toRadians(theta));
		//console.log("+");
	}
	else {
		train.x -= trainSpeed*Math.cos(toRadians(theta));
		train.y -= trainSpeed*Math.sin(toRadians(theta));
		//console.log("-");

	}
	if (trainDocked(train, train.road.station1) || trainDocked(train, train.road.station2)) {

		if (!train.docked) {

			if (trainDocked(train, train.road.station1)) {
				var station = train.road.station1;
				train.x = train.road.station1.x;
				train.y = train.road.station1.y;
			}
			else {
				var station = train.road.station2;
			}
			train.x = station.x;
			train.y = station.y;

			var connectRoads = new Array();
			for (var i = 0; i < roads.length; i++) {
				if ((roads[i].station1 == station || roads[i].station2 == station) && roads[i] != train.road) {
					connectRoads.push(roads[i]);
				}
			}

			if (connectRoads.length == 0) {
				if (train.road.station1 == train.target) {
					train.target = train.road.station2;
				}
				else {
					train.target = train.road.station1;
				}
			}
			else {
				var r = connectRoads[getRandomInt(0, connectRoads.length-1)];
				if (r.station1 == train.target) {
					train.target =  r.station2;
				}
				else {
					train.target = r.station1;

				}
				train.road = r;
			}

			train.docked = true;
		}
	}
	else {
		train.docked = false;
	}
}

function drawTrain(x, y, theta) {
	p1 = rotatePoint(x, y, x-radius/2, y-radius/4, theta);
	p2 = rotatePoint(x, y, x+radius/2, y-radius/4, theta);
	p3 = rotatePoint(x, y, x+radius/2, y+radius/4, theta);
	p4 = rotatePoint(x, y, x-radius/2, y+radius/4, theta);
	beginShape();
	vertex(p1[0], p1[1]);
	vertex(p2[0], p2[1]);
	vertex(p3[0], p3[1]);
	vertex(p4[0], p4[1]);
	endShape(CLOSE);
}

function trainDocked(train, station) {
	if (Math.abs(train.x - station.x) < trainSpeed && Math.abs(train.y-station.y) < trainSpeed) {
		playNote(station.type, radius);
		return true;
	}
	return false;
}

function trainOverLine(x, y) {
	for (var i = 0; i < roads.length; i++) {			
		if (line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			x-radius/2, y-radius/4, mouseX-radius/2, y+radius/4) || 
			line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			mouseX-radius/2, y-radius/4, mouseX+radius/2, y-radius/4) || 
			line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			mouseX+radius/2, y-radius/4, mouseX+radius/2, y+radius/4) || 
			line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			mouseX-radius/2, y+radius/4, mouseX+radius/2, y+radius/4)) {
			return roads[i];
		}		
	}
	return false;
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