<?php

/**
 *Get extra data such as comments and enrollment for
 *each individual class
 */

ini_set('display_errors', 'On');
ini_set('allow_url_fopen', 'true');

// Include the MySQL connect details
require('../db_credentials.php');

$link = mysqli_connect($DB_HOST, $DB_USERNAME, $DB_PASSWORD, $DB_NAME)
	or die('MySQL connect failed');

$items = array();

if(isset($_POST['getEnrollment'])) {
	$userid = $_POST['userid'];
	$semester = mysqli_real_escape_string($link, $_POST['semester']);
	$classid = mysqli_real_escape_string($link, $_POST['classID']);
	if (!isset($_POST['getAll'])) {
		// pull enrollment
		$result = mysqli_query($link, "SELECT r_userid
			      FROM attendance WHERE semester='" . $semester . "' AND r_classid='" . $classid . "';"); /*LIMIT 10 --- add this after getting enough traffic */

		while($row = mysqli_fetch_row($result)) {
			$query = mysqli_query($link, "SELECT u_athena FROM users WHERE u_userid = " . $row[0]);
			if ($rowuser = mysqli_fetch_row($query)) {
			    $items[] = '"' . $rowuser[0] . '"';
			}
		}
	} else {
		$result = mysqli_query($link, "SELECT r_userid
			      FROM attendance WHERE semester='" . $semester . "' AND r_classid='" . $classid . "';");

		while($row = mysqli_fetch_row($result)) {
			$query = mysqli_query($link, "SELECT u_athena FROM users WHERE u_userid = " . $row[0]);
			if ($rowuser = mysqli_fetch_row($link, $query)) {
			    $items[] = '"' . $rowuser[0] . '"';
			}
		}
	}
}

if (isset($_POST['getComments'])) {
    $classid = mysqli_real_escape_string($link, $_POST['classID']);
    $userid = $_POST['userid'];
    $athena = mysqli_real_escape_string($link, $_POST['athena']);
    if (!isset($_POST['getAll'])) {
        // assuming comments were scrubbed before insertion
        $result = mysqli_query($link, "SELECT u_athena, o_timestamp, o_comment, o_votes, o_anonymous, commentid, negative
                FROM comments INNER JOIN users ON u_userid = o_userid
                WHERE o_flagged = 0 AND o_classid = '" . $classid . "' ORDER BY o_votes DESC, o_timestamp DESC;");  /*LIMIT 5 ---- add this after getting enough traffic */
    } else {
        $result = mysqli_query($link, "SELECT u_athena, o_timestamp, o_comment, o_votes, o_anonymous, commentid
               FROM comments INNER JOIN users ON u_userid = o_userid
               WHERE o_flagged = 0 AND o_classid = '" . $classid . "' ORDER BY o_votes DESC, o_timestamp DESC;");
    }
    while ($row = mysqli_fetch_row($result)) {
            $comment = trim(preg_replace('/\n+/', ' ', $row[2]));
            $string = '{"id": "' . $row[5] . '","timestamp":"' . date('M j, Y g:i A', strtotime($row[1])) . '",
                "comment":"' . $comment . '", "votes":"' . $row[3] . '"';
            if ($row[4]) {
                $string .= ',"author": "anonymous"' ;
            } else {
                $string .= ',"author":"' . $row[0] . '"';
            }

            if ($row[6]) {
                $string .= ', "negative" : "true"';
            }

            if ($row[0] == $athena) {
                $string .= ',"is-current-user":"true"';
            }

            $query1 = mysqli_query($link, "SELECT * FROM votes
		WHERE vote = 1 AND userid = $userid AND commentid = '$row[5]'");
            if ($vup = mysqli_fetch_row($query1)) {
                $string .= ', "votedUp": "true"';
            } else {
                $string .= ', "votedUp": "false"';
            }

            $query2 = mysqli_query($link, "SELECT commentid FROM votes
                    WHERE vote = 2 AND userid = $userid AND commentid = '$row[5]'");
            if ($vdown = mysqli_fetch_row($query2)) {
                $string .= ', "votedDown": "true"';
            } else {
                $string .= ', "votedDown": "false"';
            }

            $query3 = mysqli_query($link, "SELECT commentid FROM votes
                    WHERE flag = 1 AND userid = $userid AND commentid = '$row[5]'");
            if ($vflag = mysqli_fetch_row($query3)) {
                $string .= ', "flagClicked": "true"';
            } else {
                $string .= ', "flagClicked": "false"';
            }

            $string .= '}';
            $items[] = $string;
    }
}

mysqli_close($link);

echo '{"items": [' . implode(",", $items) . '] }';

?>
