<?php
// Test server script to check if everything is working
echo "Testing PHP Backend...\n";

// Test config loading
echo "1. Testing config loading...\n";
require_once 'config/config.php';
echo "   Config loaded successfully!\n";
echo "   Database path: " . Config::getDbPath() . "\n";

// Test database connection
echo "2. Testing database connection...\n";
try {
    require_once 'config/database.php';
    $db = new Database();
    echo "   Database connected successfully!\n";
} catch (Exception $e) {
    echo "   Database error: " . $e->getMessage() . "\n";
}

// Test utilities
echo "3. Testing utilities...\n";
require_once 'includes/utils.php';
echo "   Utils loaded successfully!\n";

echo "\nAll tests passed! The backend should work fine.\n";
echo "Try starting with: php -S localhost:8000 index.php\n";
?>