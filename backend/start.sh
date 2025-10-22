#!/bin/bash

# Backend startup script
echo "Starting Hançer Law Office Backend..."

# Change to backend directory
cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Note: On Elastic Beanstalk, dependencies are installed by the platform from
# requirements.txt and the process is started using the Procfile (gunicorn).
# This script is mainly useful for local development.

# Start the FastAPI server with uvicorn for local development
uvicorn server:app --host ${HOST:-0.0.0.0} --port ${PORT:-8080} --reload --log-level info