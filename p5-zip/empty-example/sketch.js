var fr = 60
var roadStatus = "blank";
var diameter = 40;
var trainSelected = false;

var sideStations = new Array();
var placedStations = new Array();
var pinnedStation;
var tempStation = {x:0, y:0, type:15};

var roads = new Array();
var road = {x: 0, y: 0};
var train = {x: 0, y: 0};
var trains = new Array();

var trainSpeed;
var stokeWidth;
var osc;
var snapToGrid = true;
var gridSize;

function newStation(example, type, x, y) {
	if (example) {
		sideStations.push({type: type, x: x, y: y});
	}
	else {
		placedStations.push({type: type, x: x, y: y});
	}
}

function setup() {
	strokeWidth = 6;
	createCanvas(window.innerWidth, window.innerHeight);
	frameRate(fr);
	for (var i = 0; i < 4; i++) {
		newStation(true, i, diameter, (i+1)*diameter*2.5);
	}
	var h = window.innerHeight;
	h -= strokeWidth;
	gridSize = (h)/25;
	trainSpeed = gridSize/4; 

	road.y = 6*diameter*2;
	road.x = diameter/2;
	train.x = road.x;
	train.y = 7*diameter*2;

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
	rect(0, 0, sideStations[0].x*2, window.innerHeight);

	drawGrid([sideStations[0].x*2, 0], [window.innerWidth, window.innerHeight], gridSize);

	strokeWeight(6);
	stroke(0);

	//draw roads
	drawRoads();

	//draw stations
	drawStations();
	
	//draw trains
	drawAllTrains();
}

function mousePressed() {
	var side = false;

	if (tempStation.type != 15 || roadStatus != "blank" || trainSelected) {
		if (mouseX < sideStations[0].x*2) {
			tempStation.type = 15;
			roadStatus = "blank";
			trainSelected = false;
			side = true;
			pinnedStation = "";	
		}
	}

	if (tempStation.type != 15) {
		newStation(false, tempStation.type, tempStation.x, tempStation.y);
	}
	else {
		//check collisions and select if example or delete
		if (mouseY > train.y && mouseY < (train.y + diameter/2)
				&& mouseX > train.x && mouseX < (train.x + diameter)) {
				trainSelected = !trainSelected;
		}
		else if (trainSelected) {
			var r = trainOverLine(mouseX, mouseY);
			if (r) {
				var pos = getClosestPointOnLine(r.station1, r.station2, [mouseX, mouseY]);
				if (!circlesBisect(pos, diameter/2, [r.station1.x, r.station1.y], 0) && !circlesBisect(pos, diameter/2, [r.station2.x, r.station2.y], 0)) {
					var s = r.station2;
					if (r.station1.y > r.station2.y) {
						s = r.station1;
					}
					trains.push({road:r, x:pos[0], y:pos[1], docked: false, target: s});
				}
			}
		}

		else if (roadStatus == "blank") {
			//checked to see if clicked on side station
			for (var i = 0; i < sideStations.length; i++) {
				if (circlesBisect([mouseX,mouseY], diameter/2+3, [sideStations[i].x, sideStations[i].y], 0)) {
					tempStation.type = sideStations[i].type;
					break;
				}
			}
			for (var i = 0; i < placedStations.length; i++) {
				if (Math.sqrt(
					(placedStations[i].x-mouseX)*(placedStations[i].x-mouseX) + 
					(mouseY-placedStations[i].y)*(mouseY-placedStations[i].y)) 
					< diameter) {
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
					playNote(placedStations[i].type, diameter);

					placedStations.splice(i, 1);
					break;
				}
			}
			if (mouseY > road.y && mouseY < (road.y + diameter/2)
				&& mouseX > road.x && mouseX < (road.x + diameter)) {
				roadStatus = "active";
			}
		}
		else {
			for (var i = 0; i < placedStations.length; i++) {
				if (Math.sqrt(
					(placedStations[i].x-mouseX)*(placedStations[i].x-mouseX) + 
					(mouseY-placedStations[i].y)*(mouseY-placedStations[i].y)) 
					< diameter) {
					if (roadStatus == "active") {
						pinnedStation = placedStations[i];
						roadStatus = "pinned";
					}
					else if (roadStatus == "pinned" && pinnedStation != placedStations[i]) {
						roadStatus = "pinned";
						roads.push({station1: pinnedStation, station2: placedStations[i]});
						pinnedStation = placedStations[i];

					}
					break;
				}
			}
			if (mouseY > road.y && mouseY < (road.y + diameter/2)
				&& mouseX > road.x && mouseX < (road.x + diameter)) {
				roadStatus = "blank";
			}
		}
	}
	redraw();
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
	}
	else {
		train.x -= trainSpeed*Math.cos(toRadians(theta));
		train.y -= trainSpeed*Math.sin(toRadians(theta));

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

function trainDocked(train, station) {
	if (Math.abs(train.x - station.x) < trainSpeed && Math.abs(train.y-station.y) < trainSpeed) {
		playNote(station.type, diameter);
		return true;
	}
	return false;
}

function trainOverLine(x, y) {
	for (var i = 0; i < roads.length; i++) {			
		if (line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			x-diameter/2, y-diameter/4, mouseX-diameter/2, y+diameter/4) || 
			line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			mouseX-diameter/2, y-diameter/4, mouseX+diameter/2, y-diameter/4) || 
			line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			mouseX+diameter/2, y-diameter/4, mouseX+diameter/2, y+diameter/4) || 
			line_intersects(
			roads[i].station1.x, roads[i].station1.y, roads[i].station2.x, roads[i].station2.y,
			mouseX-diameter/2, y+diameter/4, mouseX+diameter/2, y+diameter/4)) {
			return roads[i];
		}		
	}
	return false;
}

function playNote(type, diameter) {
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

	duration = diameter*8;
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