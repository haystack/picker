<?php

// This file stores user data using MySQL
// Generates course ratings and comments
// Checks whether user is enrolled in a class

ini_set('display_errors', 'On');
ini_set('allow_url_fopen', 'true');

$link = mysqli_connect('sql.mit.edu', 'picker', 'haystackpicker', 'picker+userdata')
	or die('MySQL connect failed');

// POST handling
if (isset($_POST['userid'])) {
	$userid = mysqli_real_escape_string($link, $_POST['userid']);
	// Returns picked sections as JSON
	if (isset($_POST['getPickedSections'])) {
		$semester = mysqli_real_escape_string($link, $_POST['semester']);
		$result = mysqli_query($link, "SELECT * FROM picked_classes WHERE user_id=$userid AND deleted=0 AND semester='$semester';");
		    $arr = array();
		    while ($row = mysqli_fetch_row($result)) {
			    $arr[] = '"+sectionID:' . $row[2] . ',color:' . $row[3] . ',type:' . $row[4] . ',classID:' . $row[5] . ',classLabel:'
						. $row[6] . ',timeandplace:' . $row[7] . ',sectionData:' . $row[8] . '"';
		    }
		$jsonPickedSections = '[' . implode(",", $arr) . ']';
		echo $jsonPickedSections;
	}
}

else {
	
/*  This is the only file that should be connecting to
	the database and should be interpreted by the application
	as a Javascript file */

function getUser($athena, $email) {
	$result = mysqli_query($link, "SELECT u_userid FROM users WHERE u_athena='$athena';");
	if (mysqli_num_rows($result) > 0) {
		$row = mysqli_fetch_row($result);
		return $row[0];
	}
	else {
		mysqli_query($link, "INSERT INTO users (u_athena, u_email)
			VALUES ('$athena', '$email')");
		return mysqli_insert_id($link);
	}
}

// determine user identity via certificates, store in $userid
// accessible via: database.getObject("currentUser", "athena");
if (isset($_SERVER['SSL_CLIENT_S_DN_CN'])) {
	$athena = explode("@", $_SERVER['SSL_CLIENT_S_DN_Email']);
	$athena = $athena[0];
	$userid = getUser($athena, $_SERVER['SSL_CLIENT_S_DN_Email']);
}

$items = array();

if (isset($userid)) {
	$arr = '{"type":"UserData","label":"user",
			"athena":"' . $athena . '","userid":"' . $userid . '"}';
	$items = array($arr);

	// pull user's ratings
	$result = mysqli_query($link, "SELECT r_classid, r_rating FROM ratings
		WHERE r_userid=$userid AND r_type=1;");
	while ($row = mysqli_fetch_row($result)) {
		
		$rating_elts = array();
		for ($i = 1; $i <= 7; $i++) {
			if ($i <= $row[1])
				$rating_elts[] = '"r' . $i . '":"true"';
		}
		
		$str = '{"type":"UserData","label":"UserRating-' . $row[0] . '",
			"class-urating-of":"' . $row[0] . '", "rating":"' . $row[1] . '"';
		if (count($rating_elts) > 0)
			$str .= ', ' . implode(', ', $rating_elts);
		$str .= '}';
		
		$items[] = $str;
	}
}

/* ==== THINGS THAT SHOULD BE PULLED REGARDLESS OF AUTHENTICATION ==== */
// pull average ratings
$result = mysqli_query($link, "SELECT r_classid, AVG(r_rating),
	COUNT(r_rating) FROM ratings
	WHERE r_type=1 GROUP BY r_classid;");
while ($row = mysqli_fetch_row($result)) {
	$items[] = '{"type":"UserData","label":"AvgRating-' . $row[0] . '",
		"class-avg-rating-of":"' . $row[0] . '",
		"rating":"' . round($row[1],1) . '","total":"' . $row[2] . '"}';
}

mysqli_close($link);

echo '{"items": [' . implode(",", $items) . '] }';

} // end of main body block
?>
