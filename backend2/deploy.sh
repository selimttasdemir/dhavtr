#!/bin/bash

# PHP Backend Deployment Script for Linux/Unix

echo "Starting PHP Backend Deployment..."

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "PHP is not installed. Please install PHP 7.4 or higher."
    echo ""
    echo "For Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install php php-cli php-sqlite3 php-mbstring php-curl"
    echo ""
    echo "For CentOS/RHEL:"
    echo "  sudo yum install php php-cli php-pdo php-mbstring php-curl"
    echo ""
    echo "For macOS (Homebrew):"
    echo "  brew install php"
    exit 1
fi

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "PHP Version: $PHP_VERSION"

# Check if required PHP extensions are installed
echo "Checking required PHP extensions..."

REQUIRED_EXTENSIONS=("pdo_sqlite" "mbstring" "curl" "json")
MISSING_EXTENSIONS=()

for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if ! php -m | grep -qi "^$ext$"; then
        MISSING_EXTENSIONS+=("$ext")
    fi
done

if [ ${#MISSING_EXTENSIONS[@]} -ne 0 ]; then
    echo "Missing required PHP extensions: ${MISSING_EXTENSIONS[*]}"
    echo ""
    echo "To install missing extensions:"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt install php8.3-sqlite3 php8.3-mbstring php8.3-curl"
    echo ""
    echo "CentOS/RHEL:"
    echo "  sudo yum install php-pdo php-mbstring php-curl"
    echo ""
    echo "macOS:"
    echo "  Extensions are usually included with PHP installation"
    exit 1
fi

echo "All required PHP extensions are installed."

# Detect OS for better cross-platform support
OS_TYPE="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
    OS_TYPE="windows"
fi

echo "Detected OS: $OS_TYPE"

# Set proper permissions (Linux/macOS only)
if [[ "$OS_TYPE" != "windows" ]]; then
    echo "Setting file permissions..."
    chmod -R 755 .
    chmod -R 777 uploads/
    chmod 644 .env 2>/dev/null || echo ".env file not found, will be created from template"
    chmod 644 hancer_law.db 2>/dev/null || echo "Database file will be created automatically."
fi

# Copy database from Python backend if it exists and current DB doesn't exist
if [ -f "../backend/hancer_law.db" ] && [ ! -f "./hancer_law.db" ]; then
    echo "Copying existing database from Python backend..."
    cp "../backend/hancer_law.db" "./hancer_law.db"
    if [[ "$OS_TYPE" != "windows" ]]; then
        chmod 644 hancer_law.db
    fi
fi

# Create .env file from template if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cat > .env << 'EOF'
# PHP Backend Environment Configuration
# Edit these values according to your environment

# Server settings
PORT=8000
HOST=127.0.0.1

# CORS settings - add your domain here
CORS_ORIGINS=http://localhost:3000,https://hancer.av.tr,https://www.hancer.av.tr

# Database configuration (SQLite)
DB_PATH=./hancer_law.db

# Session configuration (in seconds)
SESSION_LIFETIME=3600

# File upload configuration
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Development settings
DEBUG=false
EOF
    echo ".env file created successfully!"
fi

# Install Composer dependencies if composer.json exists and composer is available
if [ -f "composer.json" ]; then
    if command -v composer &> /dev/null; then
        echo "Installing Composer dependencies..."
        composer install --no-dev --optimize-autoloader
    else
        echo "Composer not found. Skipping dependency installation."
        echo "To install Composer: https://getcomposer.org/download/"
    fi
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "Creating uploads directory..."
    mkdir -p uploads
    if [[ "$OS_TYPE" != "windows" ]]; then
        chmod 777 uploads
    fi
fi

# Test database connection
echo "Testing database connection..."
php -r "
try {
    require_once 'config/config.php';
    require_once 'config/database.php';
    \$db = new Database();
    echo 'Database connection successful!' . PHP_EOL;
} catch (Exception \$e) {
    echo 'Database connection failed: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"

if [ $? -eq 0 ]; then
    echo "Database test passed!"
else
    echo "Database test failed!"
    exit 1
fi

# Create systemd service file (Linux only)
if [[ "$OS_TYPE" == "linux" ]]; then
    echo "Creating systemd service file..."
    cat > hancer-php-backend.service << EOF
[Unit]
Description=Hancer Law PHP Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/php -S 0.0.0.0:8000 index.php
Restart=always
RestartSec=10
Environment=PATH=/usr/bin:/usr/local/bin
Environment=PHP_CLI_SERVER_WORKERS=4

[Install]
WantedBy=multi-user.target
EOF

    echo "Systemd service file created: hancer-php-backend.service"
    echo "To install the service, run:"
    echo "  sudo cp hancer-php-backend.service /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable hancer-php-backend"
    echo "  sudo systemctl start hancer-php-backend"
fi

echo ""
echo "=== Deployment completed successfully! ==="
echo ""
echo "Quick start commands:"
if [[ "$OS_TYPE" == "windows" ]]; then
    echo "  start.bat                    # Start the server (Windows)"
else
    echo "  ./start.sh                   # Start the server (Linux/macOS)"
fi
echo "  php -S localhost:8000 index.php # Manual start"
echo ""
echo "Server will be available at:"
echo "  http://localhost:8000/health     # Health check"
echo "  http://localhost:8000/api/*      # API endpoints"
echo ""
echo "Configuration:"
echo "  - Edit .env file to configure ports, CORS origins, etc."
echo "  - Database will be created automatically on first run"
echo "  - Upload directory: ./uploads/"
echo ""
echo "For production deployment:"
echo "  - Configure Apache/Nginx to serve this directory"
echo "  - Set up SSL certificates"
echo "  - Update CORS_ORIGINS in .env file"
echo "  - Set DEBUG=false in .env file"
echo ""