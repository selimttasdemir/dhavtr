<?php
echo "Simple test - PHP is working!\n";
echo "Current time: " . date('Y-m-d H:i:s') . "\n";
echo "GET: " . print_r($_GET, true);
echo "POST: " . print_r($_POST, true);
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
?>