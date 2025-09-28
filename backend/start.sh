#!/bin/bash

# Backend startup script
echo "Starting Hançer Law Office Backend..."

# Change to backend directory
cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Install requirements if needed
pip install -r requirements.txt

# Start the FastAPI server with uvicorn
uvicorn server:app --host ${HOST:-127.0.0.1} --port ${PORT:-8000} --reload --log-level info