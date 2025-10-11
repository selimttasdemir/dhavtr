<?php
// Admin API endpoints

function setupAdmin($database) {
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, ['username', 'password']);
    
    // Check if admin already exists
    try {
        $adminUser = new AdminUser($database);
        $stmt = $database->getConnection()->prepare("SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1");
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            Utils::errorResponse('Admin user already exists', 400);
        }
        
        // Validate password strength
        if (strlen($data['password']) < 8) {
            Utils::errorResponse('Password must be at least 8 characters long');
        }
        
        // Create admin user
        $username = Utils::sanitizeString($data['username']);
        $password = $data['password'];
        
        $result = $adminUser->create($username, $password);
        
        if ($result) {
            Utils::successResponse(null, 'Admin user created successfully');
        } else {
            Utils::errorResponse('Failed to create admin user', 500);
        }
        
    } catch (Exception $e) {
        Utils::errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

function loginAdmin($database) {
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, ['username', 'password']);
    
    $username = Utils::sanitizeString($data['username']);
    $password = $data['password'];
    
    try {
        $adminUser = new AdminUser($database);
        $user = $adminUser->authenticate($username, $password);
        
        if ($user) {
            // Set session
            Utils::setSession('admin_user_id', $user['id']);
            Utils::setSession('admin_username', $user['username']);
            
            Utils::successResponse([
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ], 'Login successful');
        } else {
            Utils::errorResponse('Invalid credentials', 401);
        }
        
    } catch (Exception $e) {
        Utils::errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

function logoutAdmin() {
    Utils::destroySession();
    Utils::successResponse(null, 'Logout successful');
}

function checkAdminSession($database) {
    $user_id = Utils::getSession('admin_user_id');
    
    if (!$user_id) {
        Utils::errorResponse('Not authenticated', 401);
    }
    
    try {
        $adminUser = new AdminUser($database);
        $user = $adminUser->getById($user_id);
        
        if ($user && $user['is_active']) {
            Utils::successResponse([
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
        } else {
            Utils::destroySession();
            Utils::errorResponse('Invalid session', 401);
        }
        
    } catch (Exception $e) {
        Utils::errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

function changePassword($database) {
    Utils::requireAuth();
    
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, ['current_password', 'new_password']);
    
    $user_id = Utils::getSession('admin_user_id');
    $current_password = $data['current_password'];
    $new_password = $data['new_password'];
    
    // Validate new password strength
    if (strlen($new_password) < 8) {
        Utils::errorResponse('New password must be at least 8 characters long');
    }
    
    try {
        $adminUser = new AdminUser($database);
        $user = $adminUser->getById($user_id);
        
        if (!$user) {
            Utils::errorResponse('User not found', 404);
        }
        
        // Verify current password
        if (!password_verify($current_password, $user['password_hash'])) {
            Utils::errorResponse('Current password is incorrect', 400);
        }
        
        // Update password
        $result = $adminUser->updatePassword($user_id, $new_password);
        
        if ($result) {
            Utils::successResponse(null, 'Password updated successfully');
        } else {
            Utils::errorResponse('Failed to update password', 500);
        }
        
    } catch (Exception $e) {
        Utils::errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

function resetPassword($database) {
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, ['email']);
    
    // This is a placeholder for password reset functionality
    // In a real implementation, you would:
    // 1. Check if the email exists in admin_users
    // 2. Generate a reset token
    // 3. Send an email with reset link
    // 4. Store the token in password_resets table
    
    Utils::successResponse(null, 'Password reset email sent (if email exists)');
}
?>