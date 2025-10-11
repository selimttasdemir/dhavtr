<?php
// Simple test script
echo "PHP Backend is working!\n";
echo "Current directory: " . getcwd() . "\n";
echo "Files in directory:\n";
print_r(scandir('.'));
?>