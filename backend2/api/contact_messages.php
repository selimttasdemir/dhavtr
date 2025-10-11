<?php
// Contact Messages API endpoints

function createContactMessage($database) {
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, [
        'name', 'email', 'phone', 'subject', 'legal_area', 'urgency', 'message'
    ]);
    
    // Validate email format
    if (!Utils::validateEmail($data['email'])) {
        Utils::errorResponse('Invalid email format');
    }
    
    // Validate legal area and urgency
    if (!Utils::validateLegalArea($data['legal_area'])) {
        Utils::errorResponse('Invalid legal area');
    }
    
    if (!Utils::validateUrgency($data['urgency'])) {
        Utils::errorResponse('Invalid urgency level');
    }
    
    // Sanitize input
    $sanitized_data = [
        'name' => Utils::sanitizeString($data['name']),
        'email' => Utils::sanitizeString($data['email']),
        'phone' => Utils::sanitizeString($data['phone']),
        'subject' => Utils::sanitizeString($data['subject']),
        'legal_area' => Utils::sanitizeString($data['legal_area']),
        'urgency' => Utils::sanitizeString($data['urgency']),
        'message' => Utils::sanitizeString($data['message'])
    ];
    
    // Create contact message
    $contactMessage = new ContactMessage($database);
    $result = $contactMessage->create($sanitized_data);
    
    if ($result) {
        Utils::successResponse(null, 'Contact message created successfully');
    } else {
        Utils::errorResponse('Failed to create contact message', 500);
    }
}

function getContactMessages($database) {
    Utils::requireAuth();
    
    $contactMessage = new ContactMessage($database);
    $messages = $contactMessage->getAll();
    
    Utils::successResponse($messages);
}

function deleteContactMessage($database, $message_id) {
    Utils::requireAuth();
    
    if (empty($message_id)) {
        Utils::errorResponse('Message ID is required');
    }
    
    $contactMessage = new ContactMessage($database);
    $result = $contactMessage->delete($message_id);
    
    if ($result) {
        Utils::successResponse(null, 'Message deleted successfully');
    } else {
        Utils::errorResponse('Message not found', 404);
    }
}

function markMessageAsRead($database, $message_id) {
    Utils::requireAuth();
    
    if (empty($message_id)) {
        Utils::errorResponse('Message ID is required');
    }
    
    $contactMessage = new ContactMessage($database);
    $result = $contactMessage->markAsRead($message_id);
    
    if ($result) {
        Utils::successResponse(null, 'Message marked as read');
    } else {
        Utils::errorResponse('Message not found', 404);
    }
}
?>