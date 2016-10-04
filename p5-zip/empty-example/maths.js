
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
