<?php
class Database {
    private $pdo;
    private $db_path;
    
    public function __construct() {
        $this->db_path = Config::getDbPath();
        $this->connect();
        $this->createTables();
    }
    
    private function connect() {
        try {
            $this->pdo = new PDO('sqlite:' . $this->db_path);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->pdo;
    }
    
    private function createTables() {
        // Contact Messages Table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS contact_messages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                subject TEXT NOT NULL,
                legal_area TEXT NOT NULL,
                urgency TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT 0
            )
        ");
        
        // Blog Posts Table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS blog_posts (
                id TEXT PRIMARY KEY,
                title_tr TEXT NOT NULL,
                title_en TEXT NOT NULL,
                title_de TEXT NOT NULL,
                title_ru TEXT NOT NULL,
                content_tr TEXT NOT NULL,
                content_en TEXT NOT NULL,
                content_de TEXT NOT NULL,
                content_ru TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                published BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Admin Users Table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS admin_users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ");
        
        // Site Settings Table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS site_settings (
                id TEXT PRIMARY KEY,
                logo_url TEXT DEFAULT '',
                hero_title_tr TEXT DEFAULT '',
                hero_title_en TEXT DEFAULT '',
                hero_title_de TEXT DEFAULT '',
                hero_title_ru TEXT DEFAULT '',
                hero_subtitle_tr TEXT DEFAULT '',
                hero_subtitle_en TEXT DEFAULT '',
                hero_subtitle_de TEXT DEFAULT '',
                hero_subtitle_ru TEXT DEFAULT '',
                hero_description_tr TEXT DEFAULT '',
                hero_description_en TEXT DEFAULT '',
                hero_description_de TEXT DEFAULT '',
                hero_description_ru TEXT DEFAULT '',
                about_company_tr TEXT DEFAULT '',
                about_company_en TEXT DEFAULT '',
                about_company_de TEXT DEFAULT '',
                about_company_ru TEXT DEFAULT '',
                about_founder_tr TEXT DEFAULT '',
                about_founder_en TEXT DEFAULT '',
                about_founder_de TEXT DEFAULT '',
                about_founder_ru TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        // Password Resets Table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id TEXT NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT 0
            )
        ");
    }
    
    public function generateUuid() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    public function getCurrentTimestamp() {
        return date('Y-m-d H:i:s', time());
    }
}

// Database models/classes for data handling
class ContactMessage {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function create($data) {
        $id = $this->db->generateUuid();
        $stmt = $this->db->getConnection()->prepare("
            INSERT INTO contact_messages 
            (id, name, email, phone, subject, legal_area, urgency, message, created_at, is_read) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $id,
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['subject'],
            $data['legal_area'],
            $data['urgency'],
            $data['message'],
            $this->db->getCurrentTimestamp(),
            0
        ]);
    }
    
    public function getAll() {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function getById($id) {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function markAsRead($id) {
        $stmt = $this->db->getConnection()->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
        return $stmt->execute([$id]);
    }
    
    public function delete($id) {
        $stmt = $this->db->getConnection()->prepare("DELETE FROM contact_messages WHERE id = ?");
        return $stmt->execute([$id]);
    }
}

class BlogPost {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function create($data) {
        $id = $this->db->generateUuid();
        $timestamp = $this->db->getCurrentTimestamp();
        
        $stmt = $this->db->getConnection()->prepare("
            INSERT INTO blog_posts 
            (id, title_tr, title_en, title_de, title_ru, content_tr, content_en, content_de, content_ru, slug, published, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $id,
            $data['title_tr'],
            $data['title_en'],
            $data['title_de'],
            $data['title_ru'],
            $data['content_tr'],
            $data['content_en'],
            $data['content_de'],
            $data['content_ru'],
            $data['slug'],
            $data['published'] ?? 1,
            $timestamp,
            $timestamp
        ]);
    }
    
    public function getAll($published_only = false) {
        $sql = "SELECT * FROM blog_posts";
        if ($published_only) {
            $sql .= " WHERE published = 1";
        }
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function getById($id) {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM blog_posts WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function getBySlug($slug) {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM blog_posts WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch();
    }
    
    public function update($id, $data) {
        $timestamp = $this->db->getCurrentTimestamp();
        
        $stmt = $this->db->getConnection()->prepare("
            UPDATE blog_posts SET 
            title_tr = ?, title_en = ?, title_de = ?, title_ru = ?,
            content_tr = ?, content_en = ?, content_de = ?, content_ru = ?,
            slug = ?, published = ?, updated_at = ?
            WHERE id = ?
        ");
        
        return $stmt->execute([
            $data['title_tr'],
            $data['title_en'],
            $data['title_de'],
            $data['title_ru'],
            $data['content_tr'],
            $data['content_en'],
            $data['content_de'],
            $data['content_ru'],
            $data['slug'],
            $data['published'] ?? 1,
            $timestamp,
            $id
        ]);
    }
    
    public function delete($id) {
        $stmt = $this->db->getConnection()->prepare("DELETE FROM blog_posts WHERE id = ?");
        return $stmt->execute([$id]);
    }
}

class AdminUser {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function create($username, $password) {
        $id = $this->db->generateUuid();
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $this->db->getConnection()->prepare("
            INSERT INTO admin_users (id, username, password_hash, created_at, is_active) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([
            $id,
            $username,
            $password_hash,
            $this->db->getCurrentTimestamp(),
            1
        ]);
    }
    
    public function authenticate($username, $password) {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM admin_users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }
        
        return false;
    }
    
    public function getById($id) {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM admin_users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function updatePassword($id, $new_password) {
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $this->db->getConnection()->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
        return $stmt->execute([$password_hash, $id]);
    }
}

class SiteSettings {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function get() {
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM site_settings LIMIT 1");
        $stmt->execute();
        $settings = $stmt->fetch();
        
        if (!$settings) {
            // Create default settings if none exist
            $this->createDefault();
            $stmt->execute();
            $settings = $stmt->fetch();
        }
        
        return $settings;
    }
    
    public function update($data) {
        $settings = $this->get();
        $timestamp = $this->db->getCurrentTimestamp();
        
        if ($settings) {
            $stmt = $this->db->getConnection()->prepare("
                UPDATE site_settings SET 
                logo_url = ?, hero_title_tr = ?, hero_title_en = ?, hero_title_de = ?, hero_title_ru = ?,
                hero_subtitle_tr = ?, hero_subtitle_en = ?, hero_subtitle_de = ?, hero_subtitle_ru = ?,
                hero_description_tr = ?, hero_description_en = ?, hero_description_de = ?, hero_description_ru = ?,
                about_company_tr = ?, about_company_en = ?, about_company_de = ?, about_company_ru = ?,
                about_founder_tr = ?, about_founder_en = ?, about_founder_de = ?, about_founder_ru = ?,
                updated_at = ?
                WHERE id = ?
            ");
            
            return $stmt->execute([
                $data['logo_url'] ?? '',
                $data['hero_title_tr'] ?? '',
                $data['hero_title_en'] ?? '',
                $data['hero_title_de'] ?? '',
                $data['hero_title_ru'] ?? '',
                $data['hero_subtitle_tr'] ?? '',
                $data['hero_subtitle_en'] ?? '',
                $data['hero_subtitle_de'] ?? '',
                $data['hero_subtitle_ru'] ?? '',
                $data['hero_description_tr'] ?? '',
                $data['hero_description_en'] ?? '',
                $data['hero_description_de'] ?? '',
                $data['hero_description_ru'] ?? '',
                $data['about_company_tr'] ?? '',
                $data['about_company_en'] ?? '',
                $data['about_company_de'] ?? '',
                $data['about_company_ru'] ?? '',
                $data['about_founder_tr'] ?? '',
                $data['about_founder_en'] ?? '',
                $data['about_founder_de'] ?? '',
                $data['about_founder_ru'] ?? '',
                $timestamp,
                $settings['id']
            ]);
        }
        
        return false;
    }
    
    private function createDefault() {
        $id = $this->db->generateUuid();
        $timestamp = $this->db->getCurrentTimestamp();
        
        $stmt = $this->db->getConnection()->prepare("
            INSERT INTO site_settings (id, created_at, updated_at) VALUES (?, ?, ?)
        ");
        
        return $stmt->execute([$id, $timestamp, $timestamp]);
    }
}

class PasswordReset {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function create($admin_id, $expires_at) {
        $token = bin2hex(random_bytes(32));
        
        $stmt = $this->db->getConnection()->prepare("
            INSERT INTO password_resets (admin_id, token, expires_at, used) 
            VALUES (?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([$admin_id, $token, $expires_at, 0]);
        
        if ($result) {
            return $token;
        }
        
        return false;
    }
    
    public function getByToken($token) {
        $stmt = $this->db->getConnection()->prepare("
            SELECT * FROM password_resets 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')
        ");
        $stmt->execute([$token]);
        return $stmt->fetch();
    }
    
    public function markAsUsed($token) {
        $stmt = $this->db->getConnection()->prepare("UPDATE password_resets SET used = 1 WHERE token = ?");
        return $stmt->execute([$token]);
    }
}
?>