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

		strokeWeight(6);
		stroke(153);
		rect(train.x, train.y, diameter, diameter/2);
		noStroke();

		var r = trainOverLine(mouseX, mouseY);
		if (!r) {
			rect(mouseX-diameter/2-3, mouseY-diameter/4-3, diameter+6, diameter/2+6);
		}
		else {
			var theta = toDegrees(Math.atan((r.station1.y-r.station2.y)/(r.station1.x-r.station2.x)));
			var centre = getClosestPointOnLine(r.station1, r.station2, [mouseX, mouseY]);
			drawTrain(centre[0], centre[1], theta);
		}

	}
	else {
		rect(train.x-3, train.y-3, diameter+6, diameter/2+6);
	}

	for (var i = 0; i < trains.length; i++) {
		var theta = toDegrees(Math.atan((trains[i].road.station1.y-trains[i].road.station2.y)/(trains[i].road.station1.x-trains[i].road.station2.x)));
		drawTrain(trains[i].x, trains[i].y, theta);
		moveTrain(trains[i]);
	}
}

function drawStations() {
	var colour;
	stroke(0);

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
	
	if (tempStation.type != "") {
		fill(getColourFromType(tempStation.type));
		ellipse(mouseX, mouseY, diameter, diameter);
		tempStation.x = mouseX;
		tempStation.y = mouseY;
	}
}

function drawRoads() {
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