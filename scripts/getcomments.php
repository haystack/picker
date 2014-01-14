<?

// Gets the latest comment from the database of comments

// Sets configuration options
ini_set('display_errors', 'On');

mysql_connect('sql.mit.edu', 'picker', 'haystackpicker')
	or die('MySQL connect failed');
mysql_select_db('picker+classcomment');

/**
 *Gets the class from the comments classes if it exits, else insert class into
 *database
 **/

if(isset($_POST['slug'])) {
    $slug = mysql_real_escape_string($_POST['slug']);
    
    $result = mysql_query("SELECT slug FROM mitclass WHERE slug='$slug';");
    if (mysql_num_rows($result) > 0) {
	$row = mysql_fetch_array($result);
        $classid = $row[0];
    }
    else {
        if(isset($_POST['title']) && isset($_POST['number']) && isset($_POST['description']) && isset($_POST['semester'])) {
            //&& isset($_POST['prereqs']) && isset($_POST['classtype']) && isset($_POST['units']) && isset($_POST['semester'])
            $title = mysql_real_escape_string($_POST['title']);
            $description = mysql_real_escape_string($_POST['description']);
            /**$instructors = mysqli_real_escape_string($con, $_POST['instructors']);
            $prereqs = mysqli_real_escape_string($con, $_POST['prereqs']);
            $classtype = mysqli_real_escape_string($con, $_POST['classtype']);
            $units = mysqli_real_escape_string($con, $_POST['units']);**/
            $semester = mysql_real_escape_string($_POST['semester']);
            $number = mysql_real_escape_string($_POST['number']);
            /**, instructors, prereqs, classtype, units, semester
            , '$instructors', '$prereqs', '$classtype', '$units', '$semester')**/
            
            mysql_query("INSERT INTO mitclass (number_name, title, slug, description, semester)
                          VALUES ('$number', '$title', '$slug', '$description', '$semester')");
            $classid = mysql_insert_id();  
        }
    }
}
 
mysql_close();
 
?>