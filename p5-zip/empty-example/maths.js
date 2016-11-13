//where centres are arrays where [0] = x and [1] = y
//returns a location a valid distance away to be able to be placed
function closestValidCircle(centre1, radius1, centre2, radius2) {
    var theta = Math.atan((centre1[1]-centre2[1])/(centre1[0]-centre2[0]));

    var newPoint = centre1;

    if (centre1[0] > centre2[0]) {
        newPoint[0] -= (radius1+radius2)*Math.cos(theta);
    }
    else {
        newPoint[0] += (radius1+radius2)*Math.cos(theta);
    } 

    dTheta = toDegrees(theta);
    if (dTheta < 0 && centre1[1] > centre2[1]) {
        newPoint[1] += (radius1+radius2)*Math.sin(theta);
    }
    else if (dTheta > 0 && centre1[1] > centre2[1]){
        newPoint[1] -= (radius1+radius2)*Math.sin(theta);
    } 
    else if (dTheta < 0 && centre1[1] < centre2[1]) {
        newPoint[1] -= (radius1+radius2)*Math.sin(theta);
    }

    else {
        newPoint[1] += (radius1+radius2)*Math.sin(theta);
    }

    return newPoint;
}

//centre [x,y] tl [x,y] br [x,y] 
function snapToGrid(centre, tl, br, gridS) {
    var newPoint = centre;
    var x = tl[0]+(Math.floor((newPoint[0]-tl[0])/gridS))*gridS;
    var y = tl[1]+(Math.floor((newPoint[1]-tl[1])/gridS))*gridS;

    if (((newPoint[0]-tl[0])/gridS) % 1 > 0.5) {
        x += gridS;
    }
    if (((newPoint[1]-tl[1])/gridS) % 1 > 0.5) {
        y += gridS;
    } 

    newPoint[0] = x;
    newPoint[1] = y;

    //console.log(newPoint);

    return newPoint;
}

//where centre is an array where [0] = x and [1] = y
//where rect is an array where [0] = x1, [1] = y1, [2] = x2, [3] = y2
function closetVertexInRectToPoint(centre, rect) {
    var newPoint = new Array();
    newPoint[0] = rect[0];
    newPoint[1] = rect[1];
    if (Math.abs(centre[0]-rect[0]) > Math.abs(centre[0]-rect[2])) {
        newPoint[0] = rect[2];
    }  
    if (Math.abs(centre[1]-rect[1]) > Math.abs(centre[1]-rect[3])) {
        newPoint[1] = rect[3];
    }  
    return newPoint;
}

//where centres are arrays where [0] = x and [1] = y
//also used for point in circle by giving radius of 0 for point
function circlesBisect(centre1, radius1, centre2, radius2) {
    if (Math.abs(centre2[0] - centre1[0]) < (radius2+radius1) && Math.abs(centre1[1]-centre2[1]) < (radius1+radius2)) {
      return true;
    }
    return false;
}

//where lines go from p0 to p1 and from p2 to p3
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

//where A and B are points on a line with .x and .y and P is an array where [0] = x and [1] = y
//I know it's terrible shush
function getClosestPointOnLine(A, B, P) {
  	var a_to_p = [P[0] - A.x, P[1] - A.y];	
  	var a_to_b = [B.x - A.x, B.y - A.y];

  	var atb2 = a_to_b[0]*a_to_b[0] + a_to_b[1]*a_to_b[1];

  	var atp_dot_atb = a_to_p[0]*a_to_b[0] + a_to_p[1]*a_to_b[1];

  	var t = atp_dot_atb / atb2;

  	var temp1 = (A.x + a_to_b[0]*t);
  	var temp2 = (A.y + a_to_b[1]*t);

  	return [temp1, temp2];
}
  
//locks the point so it remains inside the box specified
//top left, bottom right, and point are all arrays where [0] = x and [1] = y
function keepInsideBox(tl, br, point, radius) {
    var newPoint = point;
    for (var i = 0; i < tl.length; i++) {
      if (isNaN(tl[i]) || isNaN(br[i]) || isNaN(point[i]) || isNaN(radius)) {
          console.warn("Number is NaN insideBox");
      }
    }

    if (point[0] - radius < tl[0]) {
        newPoint[0] = tl[0] + radius;
    }
    else if (point[0] + radius > br[0]) {
        newPoint[0] = br[0]-radius;
    }

    if (point[1] - radius < tl[1]) {
        newPoint[1] = tl[1] + radius;
    }
    else if (point[1] + radius > br[1]) {
        newPoint[1] = br[1]-radius;

    }
    return newPoint;
}

//where rp is the rotation point, p is the point to be rotated, theta is the angle
function rotatePoint(rpX, rpY, pX, pY, theta) {
	var x = pX - rpX;
	var y = pY - rpY;

	var targetX = x*Math.cos(toRadians(theta)) - y*Math.sin(toRadians(theta)) + rpX;
	var targetY = y*Math.cos(toRadians(theta)) + x*Math.sin(toRadians(theta)) + rpY;

	return [targetX, targetY];
}

function toRadians(theta) {
  	return theta * (Math.PI / 180);
}

function toDegrees(theta) {
  	return theta * (180/Math.PI);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
