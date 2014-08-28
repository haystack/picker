<?php

/**
 *Get extra data such as comments and enrollment for
 *each individual class
 */

ini_set('display_errors', 'On');
ini_set('allow_url_fopen', 'true');

mysql_connect('sql.mit.edu', 'picker', 'haystackpicker')
	or die('MySQL connect failed');
mysql_select_db('picker+userdata');

$items = array();

if(isset($_POST['getEnrollment'])) {
	$userid = $_POST['userid'];
	$semester = mysql_real_escape_string($_POST['semester']);
	$classid = mysql_real_escape_string($_POST['classID']);
	if (!isset($_POST['getAll'])) {
		// pull enrollment
		$result = mysql_query("SELECT r_userid
			      FROM attendance WHERE semester='" . $semester . "' AND r_classid='" . $classid . "';"); /*LIMIT 10 --- add this after getting enough traffic */

		while($row = mysql_fetch_row($result)) {
			$query = mysql_query("SELECT u_athena FROM users WHERE u_userid = " . $row[0]);
			if ($rowuser = mysql_fetch_row($query)) {
			    $items[] = '"' . $rowuser[0] . '"';
			}
		}
	} else {
		$result = mysql_query("SELECT r_userid
			      FROM attendance WHERE semester='" . $semester . "' AND r_classid='" . $classid . "';");

		while($row = mysql_fetch_row($result)) {
			$query = mysql_query("SELECT u_athena FROM users WHERE u_userid = " . $row[0]);
			if ($rowuser = mysql_fetch_row($query)) {
			    $items[] = '"' . $rowuser[0] . '"';
			}
		}
	}
}

if (isset($_POST['getComments'])) {
    $classid = mysql_real_escape_string($_POST['classID']);
    $userid = $_POST['userid'];
    $athena = mysql_real_escape_string($_POST['athena']);
    if (!isset($_POST['getAll'])) {
        // assuming comments were scrubbed before insertion
        $result = mysql_query("SELECT u_athena, o_timestamp, o_comment, o_votes, o_anonymous, commentid, negative
                FROM comments INNER JOIN users ON u_userid = o_userid
                WHERE o_flagged = 0 AND o_classid = '" . $classid . "' ORDER BY o_votes DESC, o_timestamp DESC;");  /*LIMIT 5 ---- add this after getting enough traffic */
    } else {
        $result = mysql_query("SELECT u_athena, o_timestamp, o_comment, o_votes, o_anonymous, commentid
               FROM comments INNER JOIN users ON u_userid = o_userid
               WHERE o_flagged = 0 AND o_classid = '" . $classid . "' ORDER BY o_votes DESC, o_timestamp DESC;");
    }
    while ($row = mysql_fetch_row($result)) {
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

            $query1 = mysql_query("SELECT * FROM votes
		WHERE vote = 1 AND userid = $userid AND commentid = '$row[5]'");
            if ($vup = mysql_fetch_row($query1)) {
                $string .= ', "votedUp": "true"';
            } else {
                $string .= ', "votedUp": "false"';
            }

            $query2 = mysql_query("SELECT commentid FROM votes
                    WHERE vote = 2 AND userid = $userid AND commentid = '$row[5]'");
            if ($vdown = mysql_fetch_row($query2)) {
                $string .= ', "votedDown": "true"';
            } else {
                $string .= ', "votedDown": "false"';
            }

            $query3 = mysql_query("SELECT commentid FROM votes
                    WHERE flag = 1 AND userid = $userid AND commentid = '$row[5]'");
            if ($vflag = mysql_fetch_row($query3)) {
                $string .= ', "flagClicked": "true"';
            } else {
                $string .= ', "flagClicked": "false"';
            }

            $string .= '}';
            $items[] = $string;
    }
}

mysql_close();

echo '{"items": [' . implode(",", $items) . '] }';

?>
