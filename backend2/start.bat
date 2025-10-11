@echo off
setlocal enabledelayedexpansion

REM PHP Backend Start Script for Windows

echo Starting PHP Backend Server...
echo.

REM Check if PHP is installed
php -v > nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP and add it to your PATH environment variable
    echo Download from: https://www.php.net/downloads.php
    echo.
    pause
    exit /b 1
)

REM Check required PHP extensions
echo Checking PHP extensions...
php -m | findstr /i "pdo_sqlite" > nul || (
    echo ERROR: php-sqlite3 extension is missing
    echo Please enable php_pdo_sqlite.dll in php.ini
    pause
    exit /b 1
)

php -m | findstr /i "mbstring" > nul || (
    echo ERROR: mbstring extension is missing
    echo Please enable php_mbstring.dll in php.ini
    pause
    exit /b 1
)

php -m | findstr /i "curl" > nul || (
    echo WARNING: curl extension is missing
    echo Some features may not work properly
)

echo PHP extensions check passed!
echo.

REM Load environment variables from .env file
if exist .env (
    echo Loading environment variables from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            if not "%%a"=="" (
                set "%%a=%%b"
            )
        )
    )
) else (
    echo .env file not found, using default values
)

REM Set default values if not set in .env
if "%HOST%"=="" set HOST=127.0.0.1
if "%PORT%"=="" set PORT=8000

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    echo Creating uploads directory...
    mkdir uploads
)

REM Test database connection
echo Testing database connection...
php -r "try { require_once 'config/config.php'; require_once 'config/database.php'; $db = new Database(); echo 'Database OK!' . PHP_EOL; } catch (Exception $e) { echo 'Database Error: ' . $e->getMessage() . PHP_EOL; exit(1); }"
if errorlevel 1 (
    echo Database connection failed!
    pause
    exit /b 1
)

echo.
echo === PHP Backend Server Starting ===
echo Host: %HOST%
echo Port: %PORT%
echo.
echo Server will be available at: http://%HOST%:%PORT%
echo API endpoints: http://%HOST%:%PORT%/api/*
echo Health check: http://%HOST%:%PORT%/health
echo.
echo Press Ctrl+C to stop the server
echo ====================================
echo.

REM Start the PHP built-in server
php -S %HOST%:%PORT% index.php

echo.
echo Server stopped.
pause