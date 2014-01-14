<?php
    $json = $_POST['jsonp'];

    $file = flock('class-list.html','w+');
    fwrite($file, $json);
    fclose($file);
?>
