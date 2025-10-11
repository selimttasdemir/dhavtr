<?php
// Main entry point for the PHP backend

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config/config.php';
require_once 'config/database.php';
require_once 'includes/utils.php';

// Initialize
Utils::handleCors();
$database = new Database();

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and normalize path
$path = parse_url($request_uri, PHP_URL_PATH);
$path = rtrim($path, '/');

// Remove base path if needed (adjust this based on your server setup)
$base_path = '/api';
if (strpos($path, $base_path) === 0) {
    $path = substr($path, strlen($base_path));
}

// Route handling
try {
    switch ($path) {
        // Contact Messages Routes
        case '/messages':
            if ($request_method === 'POST') {
                include 'api/contact_messages.php';
                createContactMessage($database);
            } elseif ($request_method === 'GET') {
                include 'api/contact_messages.php';
                getContactMessages($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case (preg_match('/^\/messages\/([^\/]+)$/', $path, $matches) ? true : false):
            $message_id = $matches[1];
            if ($request_method === 'DELETE') {
                include 'api/contact_messages.php';
                deleteContactMessage($database, $message_id);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case (preg_match('/^\/messages\/([^\/]+)\/read$/', $path, $matches) ? true : false):
            $message_id = $matches[1];
            if ($request_method === 'PUT') {
                include 'api/contact_messages.php';
                markMessageAsRead($database, $message_id);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        // Blog Posts Routes
        case '/blog':
            if ($request_method === 'POST') {
                include 'api/blog_posts.php';
                createBlogPost($database);
            } elseif ($request_method === 'GET') {
                include 'api/blog_posts.php';
                getBlogPosts($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case (preg_match('/^\/blog\/([^\/]+)$/', $path, $matches) ? true : false):
            $post_id = $matches[1];
            if ($request_method === 'GET') {
                include 'api/blog_posts.php';
                // Check if it's a slug or ID
                if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $post_id)) {
                    getBlogPost($database, $post_id);
                } else {
                    getBlogPostBySlug($database, $post_id);
                }
            } elseif ($request_method === 'PUT') {
                include 'api/blog_posts.php';
                updateBlogPost($database, $post_id);
            } elseif ($request_method === 'DELETE') {
                include 'api/blog_posts.php';
                deleteBlogPost($database, $post_id);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        // Site Settings Routes
        case '/settings':
            if ($request_method === 'GET') {
                include 'api/site_settings.php';
                getSiteSettings($database);
            } elseif ($request_method === 'PUT') {
                include 'api/site_settings.php';
                updateSiteSettings($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        // Admin Routes
        case '/admin/setup':
            if ($request_method === 'POST') {
                include 'api/admin.php';
                setupAdmin($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case '/admin/login':
            if ($request_method === 'POST') {
                include 'api/admin.php';
                loginAdmin($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case '/admin/logout':
            if ($request_method === 'POST') {
                include 'api/admin.php';
                logoutAdmin();
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case '/admin/check':
            if ($request_method === 'GET') {
                include 'api/admin.php';
                checkAdminSession($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case '/admin/password':
            if ($request_method === 'PUT') {
                include 'api/admin.php';
                changePassword($database);
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        // File Upload Routes
        case '/upload':
            if ($request_method === 'POST') {
                include 'api/upload.php';
                handleFileUpload();
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        case '/upload/logo':
            if ($request_method === 'POST') {
                include 'api/upload.php';
                handleLogoUpload();
            } else {
                Utils::errorResponse('Method not allowed', 405);
            }
            break;
            
        // Health check - simplified
        case '/health':
            error_log("Health endpoint hit");
            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode(['status' => 'OK', 'timestamp' => date('Y-m-d H:i:s')]);
            exit();
            break;
            
        // Default case - route not found
        default:
            Utils::errorResponse('Route not found', 404);
            break;
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Utils::errorResponse('Internal server error', 500);
}
?>