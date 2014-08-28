<?php
    $data = $_POST['data'];

    $file = 'secret/loggingdata/data.csv';
    $current = file_get_contents($file) or die("can't get contents");
    
    $current .= $data . "\n";
    file_put_contents($file, $current) or die("can't write to file");
?>
