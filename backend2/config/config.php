<?php
// Environment configuration
class Config {
    private static $config = null;
    
    public static function load() {
        if (self::$config === null) {
            self::$config = [];
            
            // Load from .env file if it exists
            $env_file = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
            if (file_exists($env_file)) {
                $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    if (strpos($line, '#') === 0) continue; // Skip comments
                    
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $key = trim($parts[0]);
                        $value = trim($parts[1]);
                        self::$config[$key] = $value;
                    }
                }
            }
            
            // Set defaults with cross-platform support
            self::$config['PORT'] = self::$config['PORT'] ?? '8000';
            self::$config['HOST'] = self::$config['HOST'] ?? '127.0.0.1';
            self::$config['CORS_ORIGINS'] = self::$config['CORS_ORIGINS'] ?? 'http://localhost:3000,https://hancer.av.tr,https://www.hancer.av.tr';
            self::$config['DB_PATH'] = self::$config['DB_PATH'] ?? './hancer_law.db';
            self::$config['SESSION_LIFETIME'] = self::$config['SESSION_LIFETIME'] ?? '3600';
            self::$config['MAX_UPLOAD_SIZE'] = self::$config['MAX_UPLOAD_SIZE'] ?? '10485760';
            self::$config['ALLOWED_FILE_TYPES'] = self::$config['ALLOWED_FILE_TYPES'] ?? 'jpg,jpeg,png,gif,pdf,doc,docx';
            self::$config['DEBUG'] = self::$config['DEBUG'] ?? 'false';
            self::$config['LOG_ERRORS'] = self::$config['LOG_ERRORS'] ?? 'true';
            self::$config['ADMIN_SESSION_TIMEOUT'] = self::$config['ADMIN_SESSION_TIMEOUT'] ?? '1800';
            
            // Platform-specific path handling
            $upload_path = self::$config['UPLOAD_PATH'] ?? 'uploads/';
            $log_path = self::$config['LOG_PATH'] ?? 'logs/';
            
            // Normalize paths for current OS
            self::$config['UPLOAD_PATH'] = self::normalizePath($upload_path);
            self::$config['LOG_PATH'] = self::normalizePath($log_path);
        }
        
        return self::$config;
    }
    
    public static function get($key, $default = null) {
        $config = self::load();
        return $config[$key] ?? $default;
    }
    
    public static function getCorsOrigins() {
        $origins = self::get('CORS_ORIGINS', '');
        return array_map('trim', explode(',', $origins));
    }
    
    public static function isDebugMode() {
        return strtolower(self::get('DEBUG', 'false')) === 'true';
    }
    
    public static function getDbPath() {
        $db_path = self::get('DB_PATH', './hancer_law.db');
        // If relative path, make it relative to project root
        if (!self::isAbsolutePath($db_path)) {
            $db_path = dirname(__DIR__) . DIRECTORY_SEPARATOR . ltrim($db_path, './\\');
        }
        return self::normalizePath($db_path);
    }
    
    public static function getUploadPath() {
        $upload_path = self::get('UPLOAD_PATH', 'uploads/');
        // If relative path, make it relative to project root
        if (!self::isAbsolutePath($upload_path)) {
            $upload_path = dirname(__DIR__) . DIRECTORY_SEPARATOR . ltrim($upload_path, './\\');
        }
        return self::normalizePath($upload_path);
    }
    
    public static function getLogPath() {
        $log_path = self::get('LOG_PATH', 'logs/');
        // If relative path, make it relative to project root
        if (!self::isAbsolutePath($log_path)) {
            $log_path = dirname(__DIR__) . DIRECTORY_SEPARATOR . ltrim($log_path, './\\');
        }
        return self::normalizePath($log_path);
    }
    
    private static function normalizePath($path) {
        // Replace both types of separators with the OS-appropriate one
        $path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
        // Remove double separators
        $path = preg_replace('#' . preg_quote(DIRECTORY_SEPARATOR) . '+#', DIRECTORY_SEPARATOR, $path);
        return $path;
    }
    
    private static function isAbsolutePath($path) {
        // Windows: C:\path or \\server\path
        if (DIRECTORY_SEPARATOR === '\\') {
            return preg_match('/^[A-Za-z]:[\\\\\\/]/', $path) || substr($path, 0, 2) === '\\\\';
        }
        // Unix/Linux: /path
        return substr($path, 0, 1) === '/';
    }
    
    public static function getEnvInfo() {
        return [
            'os' => PHP_OS,
            'php_version' => PHP_VERSION,
            'directory_separator' => DIRECTORY_SEPARATOR,
            'upload_path' => self::getUploadPath(),
            'log_path' => self::getLogPath(),
            'db_path' => self::getDbPath(),
            'debug_mode' => self::isDebugMode()
        ];
    }
}

// Load configuration
Config::load();
?>