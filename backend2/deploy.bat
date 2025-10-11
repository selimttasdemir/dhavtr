@echo off
setlocal enabledelayedexpansion

REM PHP Backend Deployment Script for Windows

echo === Hancer Law PHP Backend Deployment ===
echo.

REM Check if PHP is installed
php -v > nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP is not installed or not in PATH
    echo.
    echo Please install PHP and add it to your PATH environment variable
    echo.
    echo Download PHP from: https://www.php.net/downloads.php
    echo For Windows, download "Thread Safe" version
    echo.
    echo Installation steps:
    echo 1. Download PHP ZIP file
    echo 2. Extract to C:\php
    echo 3. Add C:\php to PATH environment variable
    echo 4. Copy php.ini-development to php.ini
    echo 5. Enable required extensions in php.ini
    echo.
    pause
    exit /b 1
)

REM Get PHP version
for /f "tokens=2" %%i in ('php -v ^| findstr /r "^PHP"') do set PHP_VERSION=%%i
echo PHP Version: %PHP_VERSION%

REM Check if required PHP extensions are installed
echo.
echo Checking required PHP extensions...

set MISSING_EXTENSIONS=
php -m | findstr /i "pdo_sqlite" > nul || set MISSING_EXTENSIONS=%MISSING_EXTENSIONS% pdo_sqlite
php -m | findstr /i "mbstring" > nul || set MISSING_EXTENSIONS=%MISSING_EXTENSIONS% mbstring
php -m | findstr /i "curl" > nul || set MISSING_EXTENSIONS=%MISSING_EXTENSIONS% curl
php -m | findstr /i "json" > nul || set MISSING_EXTENSIONS=%MISSING_EXTENSIONS% json

if not "%MISSING_EXTENSIONS%"=="" (
    echo.
    echo ERROR: Missing required PHP extensions:%MISSING_EXTENSIONS%
    echo.
    echo To fix this, edit your php.ini file and uncomment these lines:
    echo   extension=pdo_sqlite
    echo   extension=mbstring
    echo   extension=curl
    echo   extension=json
    echo.
    echo php.ini is typically located at: C:\php\php.ini
    echo After editing, restart your command prompt
    echo.
    pause
    exit /b 1
)

echo All required PHP extensions are installed!

REM Create necessary directories
echo.
echo Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs

REM Copy database from Python backend if it exists and current DB doesn't exist
if exist "..\backend\hancer_law.db" (
    if not exist "hancer_law.db" (
        echo.
        echo Copying existing database from Python backend...
        copy "..\backend\hancer_law.db" "hancer_law.db" > nul
    )
)

REM Create .env file from template if it doesn't exist
if not exist ".env" (
    echo.
    echo Creating .env file from template...
    (
        echo # PHP Backend Environment Configuration
        echo # Edit these values according to your environment
        echo.
        echo # Server settings
        echo PORT=8000
        echo HOST=127.0.0.1
        echo.
        echo # CORS settings - add your domain here
        echo CORS_ORIGINS=http://localhost:3000,https://hancer.av.tr,https://www.hancer.av.tr
        echo.
        echo # Database configuration ^(SQLite^)
        echo DB_PATH=.\hancer_law.db
        echo.
        echo # Session configuration ^(in seconds^)
        echo SESSION_LIFETIME=3600
        echo.
        echo # File upload configuration
        echo MAX_UPLOAD_SIZE=10485760
        echo ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
        echo.
        echo # Development settings
        echo DEBUG=false
        echo LOG_ERRORS=true
        echo.
        echo # Windows-specific paths
        echo UPLOAD_PATH=uploads\
        echo LOG_PATH=logs\
    ) > .env
    echo .env file created successfully!
)

REM Test database connection
echo.
echo Testing database connection...
php -r "try { require_once 'config/config.php'; require_once 'config/database.php'; $db = new Database(); echo 'Database connection successful!' . PHP_EOL; } catch (Exception $e) { echo 'Database connection failed: ' . $e->getMessage() . PHP_EOL; exit(1); }"
if errorlevel 1 (
    echo.
    echo Database test failed!
    pause
    exit /b 1
)

echo Database test passed!

REM Check for Composer (optional)
echo.
echo Checking for Composer...
composer --version > nul 2>&1
if errorlevel 1 (
    echo Composer not found. Skipping dependency installation.
    echo To install Composer: https://getcomposer.org/download/
) else (
    if exist "composer.json" (
        echo Installing Composer dependencies...
        composer install --no-dev --optimize-autoloader
    )
)

echo.
echo === Deployment completed successfully! ===
echo.
echo Quick start commands:
echo   start.bat                           # Start the server
echo   php -S localhost:8000 index.php     # Manual start
echo.
echo Server will be available at:
echo   http://localhost:8000/health        # Health check
echo   http://localhost:8000/api/*         # API endpoints
echo.
echo Configuration:
echo   - Edit .env file to configure ports, CORS origins, etc.
echo   - Database will be created automatically on first run
echo   - Upload directory: .\uploads\
echo.
echo For production deployment:
echo   - Configure IIS or Apache to serve this directory
echo   - Set up SSL certificates
echo   - Update CORS_ORIGINS in .env file
echo   - Set DEBUG=false in .env file
echo.
echo Press any key to start the server now, or Ctrl+C to exit...
pause > nul

echo.
echo Starting server...
call start.bat