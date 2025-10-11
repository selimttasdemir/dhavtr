<?php
// Blog Posts API endpoints

function createBlogPost($database) {
    Utils::requireAuth();
    
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, [
        'title_tr', 'title_en', 'title_de', 'title_ru',
        'content_tr', 'content_en', 'content_de', 'content_ru',
        'slug'
    ]);
    
    // Sanitize input
    $sanitized_data = [
        'title_tr' => Utils::sanitizeString($data['title_tr']),
        'title_en' => Utils::sanitizeString($data['title_en']),
        'title_de' => Utils::sanitizeString($data['title_de']),
        'title_ru' => Utils::sanitizeString($data['title_ru']),
        'content_tr' => $data['content_tr'], // Keep HTML content as is
        'content_en' => $data['content_en'],
        'content_de' => $data['content_de'],
        'content_ru' => $data['content_ru'],
        'slug' => Utils::generateSlug($data['slug']),
        'published' => isset($data['published']) ? (bool)$data['published'] : true
    ];
    
    // Create blog post
    $blogPost = new BlogPost($database);
    $result = $blogPost->create($sanitized_data);
    
    if ($result) {
        Utils::successResponse(null, 'Blog post created successfully');
    } else {
        Utils::errorResponse('Failed to create blog post', 500);
    }
}

function getBlogPosts($database) {
    $published_only = isset($_GET['published_only']) ? filter_var($_GET['published_only'], FILTER_VALIDATE_BOOLEAN) : true;
    
    // If not authenticated and published_only is false, require auth
    if (!$published_only && !Utils::isAuthenticated()) {
        Utils::requireAuth();
    }
    
    $blogPost = new BlogPost($database);
    $posts = $blogPost->getAll($published_only);
    
    Utils::successResponse($posts);
}

function getBlogPost($database, $post_id) {
    if (empty($post_id)) {
        Utils::errorResponse('Post ID is required');
    }
    
    $blogPost = new BlogPost($database);
    $post = $blogPost->getById($post_id);
    
    if (!$post) {
        Utils::errorResponse('Blog post not found', 404);
    }
    
    // If post is not published, require authentication
    if (!$post['published'] && !Utils::isAuthenticated()) {
        Utils::requireAuth();
    }
    
    Utils::successResponse($post);
}

function updateBlogPost($database, $post_id) {
    Utils::requireAuth();
    
    if (empty($post_id)) {
        Utils::errorResponse('Post ID is required');
    }
    
    $data = Utils::getJsonInput();
    
    // Validate required fields
    Utils::validateRequired($data, [
        'title_tr', 'title_en', 'title_de', 'title_ru',
        'content_tr', 'content_en', 'content_de', 'content_ru',
        'slug'
    ]);
    
    // Sanitize input
    $sanitized_data = [
        'title_tr' => Utils::sanitizeString($data['title_tr']),
        'title_en' => Utils::sanitizeString($data['title_en']),
        'title_de' => Utils::sanitizeString($data['title_de']),
        'title_ru' => Utils::sanitizeString($data['title_ru']),
        'content_tr' => $data['content_tr'], // Keep HTML content as is
        'content_en' => $data['content_en'],
        'content_de' => $data['content_de'],
        'content_ru' => $data['content_ru'],
        'slug' => Utils::generateSlug($data['slug']),
        'published' => isset($data['published']) ? (bool)$data['published'] : true
    ];
    
    // Update blog post
    $blogPost = new BlogPost($database);
    $result = $blogPost->update($post_id, $sanitized_data);
    
    if ($result) {
        Utils::successResponse(null, 'Blog post updated successfully');
    } else {
        Utils::errorResponse('Blog post not found', 404);
    }
}

function deleteBlogPost($database, $post_id) {
    Utils::requireAuth();
    
    if (empty($post_id)) {
        Utils::errorResponse('Post ID is required');
    }
    
    $blogPost = new BlogPost($database);
    $result = $blogPost->delete($post_id);
    
    if ($result) {
        Utils::successResponse(null, 'Blog post deleted successfully');
    } else {
        Utils::errorResponse('Blog post not found', 404);
    }
}

function getBlogPostBySlug($database, $slug) {
    if (empty($slug)) {
        Utils::errorResponse('Slug is required');
    }
    
    $blogPost = new BlogPost($database);
    $post = $blogPost->getBySlug($slug);
    
    if (!$post) {
        Utils::errorResponse('Blog post not found', 404);
    }
    
    // If post is not published, require authentication
    if (!$post['published'] && !Utils::isAuthenticated()) {
        Utils::requireAuth();
    }
    
    Utils::successResponse($post);
}
?>