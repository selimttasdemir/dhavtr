<?php
// Utility functions for the API
class Utils {
    
    // CORS handling
    public static function handleCors() {
        $allowed_origins = Config::getCorsOrigins();
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    // JSON response helper
    public static function jsonResponse($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }
    
    // Error response helper
    public static function errorResponse($message, $status_code = 400) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode(['error' => $message]);
        exit();
    }
    
    // Success response helper
    public static function successResponse($data = null, $message = 'Success') {
        $response = ['message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    }
    
    // Get JSON input
    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse('Invalid JSON input');
        }
        
        return $data;
    }
    
    // Validate required fields
    public static function validateRequired($data, $required_fields) {
        $missing = [];
        
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            self::errorResponse('Missing required fields: ' . implode(', ', $missing));
        }
    }
    
    // Sanitize input
    public static function sanitizeString($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    // Validate email
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    // Generate slug from text
    public static function generateSlug($text) {
        // Convert to lowercase
        $slug = strtolower($text);
        
        // Replace Turkish characters
        $slug = str_replace(
            ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'],
            ['c', 'g', 'i', 'o', 's', 'u'],
            $slug
        );
        
        // Remove special characters and replace spaces with hyphens
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');
        
        return $slug;
    }
    
    // File upload handler
    public static function handleFileUpload($file, $upload_dir = null) {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('No file uploaded');
        }
        
        $max_size = Config::get('MAX_UPLOAD_SIZE', 10485760); // 10MB default
        if ($file['size'] > $max_size) {
            throw new Exception('File too large');
        }
        
        $allowed_types = Config::get('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif,pdf,doc,docx');
        $allowed_types = array_map('trim', explode(',', $allowed_types));
        
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($file_extension, $allowed_types)) {
            throw new Exception('File type not allowed');
        }
        
        // Use config-based upload path
        $upload_path = $upload_dir ? $upload_dir : Config::getUploadPath();
        if (!is_dir($upload_path)) {
            mkdir($upload_path, 0755, true);
        }
        
        $filename = uniqid() . '.' . $file_extension;
        $filepath = $upload_path . DIRECTORY_SEPARATOR . $filename;
        
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to upload file');
        }
        
        // Return relative path for URL generation
        $relative_path = 'uploads' . DIRECTORY_SEPARATOR . $filename;
        return str_replace(DIRECTORY_SEPARATOR, '/', $relative_path); // Always use forward slashes for URLs
    }
    
    // Session management
    public static function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.lifetime', Config::get('SESSION_LIFETIME', 3600));
            session_start();
        }
    }
    
    public static function destroySession() {
        self::startSession();
        session_destroy();
    }
    
    public static function setSession($key, $value) {
        self::startSession();
        $_SESSION[$key] = $value;
    }
    
    public static function getSession($key, $default = null) {
        self::startSession();
        return $_SESSION[$key] ?? $default;
    }
    
    public static function removeSession($key) {
        self::startSession();
        unset($_SESSION[$key]);
    }
    
    // Authentication helper
    public static function isAuthenticated() {
        return self::getSession('admin_user_id') !== null;
    }
    
    public static function requireAuth() {
        if (!self::isAuthenticated()) {
            self::errorResponse('Authentication required', 401);
        }
    }
    
    // Legal area validation
    public static function validateLegalArea($legal_area) {
        $valid_areas = [
            'project_financing',
            'banking_finance',
            'corporate_law',
            'maritime_law',
            'mergers_acquisitions',
            'energy_law',
            'competition_law',
            'capital_markets',
            'dispute_resolution',
            'labor_law',
            'compliance',
            'real_estate',
            'restructuring',
            'criminal_law',
            'family_law',
            'administrative_law',
            'immigration_law',
            'other'
        ];
        
        return in_array($legal_area, $valid_areas);
    }
    
    // Urgency level validation
    public static function validateUrgency($urgency) {
        $valid_urgencies = ['low', 'medium', 'high', 'urgent'];
        return in_array($urgency, $valid_urgencies);
    }
    
    // Language code validation
    public static function validateLanguageCode($language) {
        $valid_languages = ['tr', 'en', 'de', 'ru'];
        return in_array($language, $valid_languages);
    }
}
?>