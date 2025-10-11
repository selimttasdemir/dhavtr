#!/bin/bash

echo "=== PHP Backend Test Script ==="
echo ""

# Test 1: Check if PHP is working
echo "1. Testing PHP..."
php -v | head -1

# Test 2: Check if our config loads
echo ""
echo "2. Testing configuration..."
php -r "require 'config/config.php'; echo 'Config loaded successfully!'; echo PHP_EOL; echo 'DB Path: ' . Config::getDbPath(); echo PHP_EOL;"

# Test 3: Check database connection
echo ""
echo "3. Testing database..."
php -r "require 'config/config.php'; require 'config/database.php'; try { \$db = new Database(); echo 'Database connected!'; } catch(Exception \$e) { echo 'Database error: ' . \$e->getMessage(); }"
echo ""

# Test 4: Start server and test endpoints
echo ""
echo "4. Starting server and testing endpoints..."
echo "Starting PHP server on port 8080..."

php -S 127.0.0.1:8080 index.php &
SERVER_PID=$!

sleep 3

echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://127.0.0.1:8080/health)
if [ $? -eq 0 ]; then
    echo "Health endpoint response: $HEALTH_RESPONSE"
else
    echo "Health endpoint failed!"
fi

echo ""
echo "Testing contact message creation..."
CONTACT_RESPONSE=$(curl -s -X POST http://127.0.0.1:8080/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "subject": "Test Subject",
    "legal_area": "other",
    "urgency": "low",
    "message": "Test message"
  }')

if [ $? -eq 0 ]; then
    echo "Contact message response: $CONTACT_RESPONSE"
else
    echo "Contact message creation failed!"
fi

# Stop server
echo ""
echo "Stopping test server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo ""
echo "=== Test completed ==="