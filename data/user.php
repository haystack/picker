<?php

// This file stores user data using MySQL
// Generates course ratings and comments
// Checks whether user is enrolled in a class

ini_set('display_errors', 'On');
ini_set('allow_url_fopen', 'true');

mysql_connect('sql.mit.edu', 'picker', 'haystackpicker')
	or die('MySQL connect failed');
mysql_select_db('picker+userdata');


// POST handling
if (isset($_POST['userid'])) {
	$userid = mysql_real_escape_string($_POST['userid']);

	// Returns picked sections as JSON
	if (isset($_POST['getPickedSections'])) {
		$semester = mysql_real_escape_string($_POST['semester']);
		$result = mysql_query("SELECT * FROM picked_classes WHERE user_id=$userid AND deleted=0 AND semester='$semester';");
		    $arr = array();
		    while ($row = mysql_fetch_row($result)) {
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
	$result = mysql_query("SELECT u_userid FROM users WHERE u_athena='$athena';");
	if (mysql_num_rows($result) > 0) {
		$row = mysql_fetch_row($result);
		return $row[0];
	}
	else {
		mysql_query("INSERT INTO users (u_athena, u_email)
			VALUES ('$athena', '$email')");
		return mysql_insert_id();
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

/**
DELETE DELETE DELETE AFTER MOVING FROM LOCAL
**/
$athena = "quanquan";
$userid = "1101";

if (isset($userid)) {
	$arr = '{"type":"UserData","label":"user",
			"athena":"' . $athena . '","userid":"' . $userid . '"}';
	$items = array($arr);

	// pull user's ratings
	$result = mysql_query("SELECT r_classid, r_rating FROM ratings
		WHERE r_userid=$userid AND r_type=1;");
	while ($row = mysql_fetch_row($result)) {
		
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
	
	// pull user's enrollment details
	$result = mysql_query("SELECT r_classid FROM attendance
		WHERE r_userid=$userid;");
	while ($row = mysql_fetch_row($result)) {
		
		$str = '{"type":"UserData","label":"UserEnrollment-' . $row[0] . '",
			"class-uenrolled-in":"' . $row[0] . '"}';
		
		$items[] = $str;
	}

	$result = mysql_query("SELECT commentid FROM votes 
		WHERE vote = 1 AND userid = $userid");
	while ($row = mysql_fetch_row($result)) {
		$items[] = '{"type":"UserData", "label":"Upvote-' . $row[0] . '", 
		"comment-upvote-of":"Comment-' . $row[0] . '"}';
	}

	$result = mysql_query("SELECT commentid FROM votes 
		WHERE vote = 2 AND userid = $userid");
	while ($row = mysql_fetch_row($result)) {
		$items[] = '{"type":"UserData", "label":"Downvote-' . $row[0] . '", 
		"comment-downvote-of":"Comment-' . $row[0] . '"}';
	}

	$result = mysql_query("SELECT commentid FROM votes 
		WHERE flag = 1 AND userid = $userid");
	while ($row = mysql_fetch_row($result)) {
		$items[] = '{"type":"UserData", "label":"Flag-' . $row[0] . '", 
		"comment-flag-of":"Comment-' . $row[0] . '"}';
	}
}

/* ==== THINGS THAT SHOULD BE PULLED REGARDLESS OF AUTHENTICATION ==== */
// pull average ratings
$result = mysql_query("SELECT r_classid, AVG(r_rating),
	COUNT(r_rating) FROM ratings
	WHERE r_type=1 GROUP BY r_classid;");
while ($row = mysql_fetch_row($result)) {
	$items[] = '{"type":"UserData","label":"AvgRating-' . $row[0] . '",
		"class-avg-rating-of":"' . $row[0] . '",
		"rating":"' . round($row[1],1) . '","total":"' . $row[2] . '"}';
}

// assuming comments were scrubbed before insertion
$result = mysql_query("SELECT u_athena, o_classid, o_timestamp, o_comment, o_votes, o_anonymous, commentid
	FROM comments INNER JOIN users ON u_userid = o_userid
	WHERE o_flagged = 0 ORDER BY o_votes, o_timestamp DESC;");
$count = 0;
while ($row = mysql_fetch_row($result)) {
	$count++;
	$string = '{"type":"UserData","label":"Comment-' . $comment . '",
		"class-comment-of":"' . $row[1] . '","timestamp":"' . $row[2] . '","comment":"' . $row[3] . '", "commentid":"' . $row[6] . '"';
	if ($row[5]) {
		 $string .= ',"author": "anonymous"' ;
	} else {
		$string .= ',"author":"' . $row[0] . '"';
	}

	if (isset($athena) && $row[0] == $athena)
		$string .= ',"is-current-user":"true"';	
	$string .= '}';
	
	$items[] = $string;
}

// pull enrollment numbers
$result = mysql_query("SELECT r_classid, COUNT(r_userid)
		      FROM attendance WHERE semester='S2013' GROUP BY r_classid;");

while($row = mysql_fetch_row($result)) {
	$items[] = '{"type":"UserData", "label":"Enrollment-' . $row[0] . '",
	"class-enrollment":"' .$row[0] .'",
	"number":"' . $row[1] . '"}';
}

mysql_close();

echo '{"items": [' . implode(",", $items) . '] }';

} // end of main body block
?>
