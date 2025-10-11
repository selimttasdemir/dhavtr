<?php
// File Upload API endpoints

function handleFileUpload() {
    Utils::requireAuth();
    
    try {
        if (!isset($_FILES['file'])) {
            Utils::errorResponse('No file uploaded');
        }
        
        $file = $_FILES['file'];
        
        // Handle the file upload
        $file_path = Utils::handleFileUpload($file);
        
        Utils::successResponse([
            'file_path' => $file_path,
            'url' => '/' . $file_path
        ], 'File uploaded successfully');
        
    } catch (Exception $e) {
        Utils::errorResponse($e->getMessage(), 400);
    }
}

function handleLogoUpload() {
    Utils::requireAuth();
    
    try {
        if (!isset($_FILES['logo'])) {
            Utils::errorResponse('No logo file uploaded');
        }
        
        $file = $_FILES['logo'];
        
        // Validate that it's an image
        $allowed_types = ['jpg', 'jpeg', 'png', 'gif'];
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($file_extension, $allowed_types)) {
            Utils::errorResponse('Logo must be an image file (jpg, png, gif)');
        }
        
        // Handle the file upload
        $file_path = Utils::handleFileUpload($file);
        
        Utils::successResponse([
            'logo_path' => $file_path,
            'url' => '/' . $file_path
        ], 'Logo uploaded successfully');
        
    } catch (Exception $e) {
        Utils::errorResponse($e->getMessage(), 400);
    }
}

function deleteFile() {
    Utils::requireAuth();
    
    $data = Utils::getJsonInput();
    
    if (!isset($data['file_path'])) {
        Utils::errorResponse('File path is required');
    }
    
    $file_path = $data['file_path'];
    $full_path = dirname(__DIR__) . '/' . ltrim($file_path, '/');
    
    // Security check - ensure file is in uploads directory
    if (!strpos($full_path, dirname(__DIR__) . '/uploads/') === 0) {
        Utils::errorResponse('Invalid file path');
    }
    
    if (file_exists($full_path)) {
        if (unlink($full_path)) {
            Utils::successResponse(null, 'File deleted successfully');
        } else {
            Utils::errorResponse('Failed to delete file', 500);
        }
    } else {
        Utils::errorResponse('File not found', 404);
    }
}
?>