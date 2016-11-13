
//where top left and bottom right is an array where [0] = x and [1] = y
function drawGrid(tl, br, gridS, border) {

	//gets the border to try and centre the grid
	var xBorder = ((br[0]-tl[0]) % gridS)/2;
	var yBorder = ((br[1]-tl[1]) % gridS)/2;

	strokeWeight(1);
	stroke(190);

	for (var i = yBorder+tl[1]; i < br[1]; i += gridS) {
		line(tl[0]+xBorder, i, br[0]-xBorder, i);
	}
	for (var i = xBorder+tl[0]; i < br[0]; i += gridS) {
		line(i, tl[1]+yBorder, i, br[1]-yBorder);
	}

	return [xBorder+border, yBorder+border];
}

function drawTrain(x, y, theta) {
	p1 = rotatePoint(x, y, x-diameter/2, y-diameter/4, theta);
	p2 = rotatePoint(x, y, x+diameter/2, y-diameter/4, theta);
	p3 = rotatePoint(x, y, x+diameter/2, y+diameter/4, theta);
	p4 = rotatePoint(x, y, x-diameter/2, y+diameter/4, theta);
	beginShape();
	vertex(p1[0], p1[1]);
	vertex(p2[0], p2[1]);
	vertex(p3[0], p3[1]);
	vertex(p4[0], p4[1]);
	endShape(CLOSE);
}

function drawAllTrains() {
	fill("#FF0000");
	noStroke();

	if (trainSelected) {

		strokeWeight(strokeWidth);
		stroke(153);
		rect(train.x, train.y, diameter, diameter/2);
		noStroke();

		var r = trainOverLine(mouseX, mouseY);
		if (!r) {
			rect(mouseX-diameter/2-strokeWidth/2, mouseY-diameter/4-strokeWidth/2, diameter+strokeWidth, diameter/2+strokeWidth);
		}
		else {
			var theta = toDegrees(Math.atan((r.station1.y-r.station2.y)/(r.station1.x-r.station2.x)));
			var centre = getClosestPointOnLine(r.station1, r.station2, [mouseX, mouseY]);
			drawTrain(centre[0], centre[1], theta);
		}

	}
	else {
		rect(train.x-strokeWidth/2, train.y-strokeWidth/2, diameter+strokeWidth, diameter/2+strokeWidth);	
	}

	for (var i = 0; i < trains.length; i++) {
		var theta = toDegrees(Math.atan((trains[i].road.station1.y-trains[i].road.station2.y)/(trains[i].road.station1.x-trains[i].road.station2.x)));
		drawTrain(trains[i].x, trains[i].y, theta);
		moveTrain(trains[i]);
	}
}

function drawStations(borders) {
	var colour;
	stroke(0);
	strokeWeight(strokeWidth);

	for (var i = 0; i < sideStations.length; i++) {
		if (sideStations[i].type == tempStation.type && tempStation.type != "") {
			stroke(153);
		}
		else {
			stroke(0);
		}
		colour = getColourFromType(sideStations[i].type)
		fill(colour);
		ellipse(sideStations[i].x, sideStations[i].y, diameter, diameter);
	}

	for (var i = 0; i < placedStations.length; i++) {
		if (placedStations[i] == pinnedStation) {
			stroke(153);
		}
		else {
			stroke(0);
		}
		colour = getColourFromType(placedStations[i].type)
		fill(colour);

		ellipse(placedStations[i].x, placedStations[i].y, diameter, diameter);
	}

	stroke(153);
	
	if (tempStation.type != 15) {
		fill(getColourFromType(tempStation.type));
		var coords = keepInsideBox([sideStations[0].x*2, 0], [window.innerWidth, window.innerHeight], [mouseX, mouseY], diameter/2);
		tempStation.x = coords[0];
		tempStation.y = coords[1];

		if (snapping) {
			var bisect = true;

			while (bisect) {
				coords = snapToGrid([tempStation.x, tempStation.y],[sideStations[0].x*2+borders[0], borders[1]], [windowWidth-borders[0], windowHeight-borders[1]], gridSize)
				tempStation.x = coords[0];
				tempStation.y = coords[1];
				bisect = false;

				for (var i = 0; i < placedStations.length; i++) {
					if (circlesBisect([tempStation.x,tempStation.y], diameter/2+3, [placedStations[i].x, placedStations[i].y], diameter+3)) {
						bisect = true;
						tempStation.x += gridSize;
						break;
					}
				}
			}

			tempStation.x = coords[0];
			tempStation.y = coords[1];
		}

		else {
			for (var i = 0; i < placedStations.length; i++) {
				if (circlesBisect([tempStation.x,tempStation.y], diameter/2+3, [placedStations[i].x, placedStations[i].y], diameter+3)) {
					coords = closestValidCircle([placedStations[i].x, placedStations[i].y], diameter/2+3, [tempStation.x, tempStation.y], diameter+3);
					tempStation.x = coords[0];
					tempStation.y = coords[1];
				}
			}
		}
		//console.log(borders[0], mouseX);
		if (tempStation.x < borders[0] || tempStation.x > windowWidth-borders[0] || tempStation.y > windowHeight-borders[1] || tempStation.y < borders[1]) {
			tempStation.x = NaN;
			tempStation.y = NaN;
			//console.log(tempStation);
		}
		else { 
			ellipse(tempStation.x, tempStation.y, diameter, diameter);
		}

	}
}

function drawRoads() {
	strokeWeight(strokeWidth);
	stroke(0);
	for (var i = 0; i < roads.length; i++) {
		line(roads[i].station1.x, roads[i].station1.y,
			roads[i].station2.x, roads[i].station2.y);
	}

	if (roadStatus != "blank") {
		stroke(153);
		if (roadStatus == "pinned") {
			line(pinnedStation.x, pinnedStation.y, mouseX, mouseY);
		}
	}

	fill(0);
	rect(road.x, road.y, diameter, diameter/2);
}

function getColourFromType(type) {
	var colour = "#4d4d4d";
	if (type == 1) {
		colour = "#800000";
	}
	else if (type == 2) {
		colour = "#F5A818";
	}
	else if (type == 3) {
		colour = "#FFFF00"
	}
	return colour;
}