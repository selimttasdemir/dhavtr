<?php
// Site Settings API endpoints

function getSiteSettings($database) {
    $siteSettings = new SiteSettings($database);
    $settings = $siteSettings->get();
    
    Utils::successResponse($settings);
}

function updateSiteSettings($database) {
    Utils::requireAuth();
    
    $data = Utils::getJsonInput();
    
    // All fields are optional for site settings
    $sanitized_data = [];
    
    // Logo URL
    if (isset($data['logo_url'])) {
        $sanitized_data['logo_url'] = Utils::sanitizeString($data['logo_url']);
    }
    
    // Hero section
    $hero_fields = [
        'hero_title_tr', 'hero_title_en', 'hero_title_de', 'hero_title_ru',
        'hero_subtitle_tr', 'hero_subtitle_en', 'hero_subtitle_de', 'hero_subtitle_ru'
    ];
    
    foreach ($hero_fields as $field) {
        if (isset($data[$field])) {
            $sanitized_data[$field] = Utils::sanitizeString($data[$field]);
        }
    }
    
    // Hero descriptions (allow HTML)
    $hero_desc_fields = [
        'hero_description_tr', 'hero_description_en', 'hero_description_de', 'hero_description_ru'
    ];
    
    foreach ($hero_desc_fields as $field) {
        if (isset($data[$field])) {
            $sanitized_data[$field] = $data[$field]; // Keep HTML
        }
    }
    
    // About sections (allow HTML)
    $about_fields = [
        'about_company_tr', 'about_company_en', 'about_company_de', 'about_company_ru',
        'about_founder_tr', 'about_founder_en', 'about_founder_de', 'about_founder_ru'
    ];
    
    foreach ($about_fields as $field) {
        if (isset($data[$field])) {
            $sanitized_data[$field] = $data[$field]; // Keep HTML
        }
    }
    
    // Update site settings
    $siteSettings = new SiteSettings($database);
    $result = $siteSettings->update($sanitized_data);
    
    if ($result) {
        Utils::successResponse(null, 'Site settings updated successfully');
    } else {
        Utils::errorResponse('Failed to update site settings', 500);
    }
}
?>