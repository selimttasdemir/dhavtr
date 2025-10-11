#!/bin/bash

# PHP Backend Start Script

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep '=' | xargs)
fi

# Set default values if not set in .env
HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8000}

echo "Starting PHP Backend Server..."
echo "Host: $HOST"
echo "Port: $PORT"
echo ""
echo "Server will be available at: http://$HOST:$PORT"
echo "API endpoints will be available at: http://$HOST:$PORT/api/*"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the PHP built-in server
php -S $HOST:$PORT index.php