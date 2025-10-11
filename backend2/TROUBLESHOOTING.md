# PHP Backend Troubleshooting Guide

Bu doküman, PHP backend'inde karşılaşabileceğiniz yaygın problemler ve çözümleri içerir.

## Kurulum Sorunları

### PHP Bulunamadı Hatası
```
php: command not found
```

**Çözüm:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php php-cli php-sqlite3 php-mbstring php-json php-curl

# CentOS/RHEL
sudo yum install php php-cli php-pdo php-mbstring php-json

# macOS (Homebrew)
brew install php
```

### Gerekli PHP Eklentileri Eksik

**Hata:** `Class 'PDO' not found` veya `SQLite not found`

**Çözüm:**
```bash
# Ubuntu/Debian
sudo apt install php-sqlite3 php-pdo

# CentOS/RHEL
sudo yum install php-pdo

# Eklentilerin yüklendiğini kontrol et
php -m | grep -E "pdo|sqlite|mbstring|json"
```

## Sunucu Başlatma Sorunları

### Port Zaten Kullanımda
```
Address already in use
```

**Çözüm:**
```bash
# Hangi process portu kullanıyor kontrol et
sudo lsof -i :8000

# Process'i öldür
sudo kill -9 <PID>

# Veya farklı port kullan
php -S localhost:8001 index.php
```

### İzin Hatası
```
Permission denied
```

**Çözüm:**
```bash
# Dosya izinlerini düzelt
chmod +x start.sh deploy.sh
chmod -R 755 .
chmod -R 777 uploads/
chmod 644 .env hancer_law.db
```

## Veritabanı Sorunları

### SQLite Veritabanı Oluşturulamıyor

**Hata:** `unable to open database file`

**Çözüm:**
```bash
# Klasörün yazılabilir olduğundan emin ol
chmod 755 .
chmod 666 hancer_law.db  # Eğer dosya varsa

# Veya veritabanını manuel oluştur
touch hancer_law.db
chmod 666 hancer_law.db
```

### Veritabanı Tabloları Oluşmuyor

**Çözüm:**
```bash
# Veritabanı dosyasını sil ve yeniden oluştur
rm hancer_law.db
php -r "require 'config/database.php'; new Database();"
```

## CORS Sorunları

### Cross-Origin Request Blocked

**Hata:** Frontend'den API'ye istek atılırken CORS hatası

**Çözüm:**
1. `.env` dosyasında CORS_ORIGINS ayarını kontrol et:
```env
CORS_ORIGINS=http://localhost:3000,https://hancer.av.tr
```

2. Web sunucusu konfigürasyonunu kontrol et (Apache/Nginx)

### Preflight Request Başarısız

**Çözüm:**
`.htaccess` dosyasının doğru olduğundan emin ol:
```apache
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ index.php [QSA,L]
```

## Dosya Yükleme Sorunları

### File Upload Başarısız

**Hata:** `Failed to upload file`

**Çözüm:**
```bash
# Uploads klasörünün izinlerini kontrol et
chmod 777 uploads/

# PHP upload ayarlarını kontrol et
php -r "echo 'max_file_uploads: ' . ini_get('max_file_uploads') . PHP_EOL;"
php -r "echo 'upload_max_filesize: ' . ini_get('upload_max_filesize') . PHP_EOL;"
php -r "echo 'post_max_size: ' . ini_get('post_max_size') . PHP_EOL;"
```

### Dosya Boyutu Çok Büyük

**Çözüm:**
`.htaccess` veya `php.ini` dosyasında:
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

## API Endpoint Sorunları

### 404 Not Found Hatası

**Çözüm:**
1. `.htaccess` dosyasının var olduğundan emin ol
2. Apache mod_rewrite modülünün aktif olduğunu kontrol et:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 500 Internal Server Error

**Çözüm:**
1. PHP error log'larını kontrol et:
```bash
tail -f /var/log/apache2/error.log
# veya
tail -f /var/log/php_errors.log
```

2. PHP hatalarını göster (sadece development için):
```php
// index.php başına ekle
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

## Session Sorunları

### Admin Login Çalışmıyor

**Hata:** `Authentication required` hatası sürekli alınıyor

**Çözüm:**
```bash
# Session klasörünün yazılabilir olduğundan emin ol
sudo chmod 733 /var/lib/php/sessions

# Veya session.save_path'i değiştir
mkdir /tmp/php_sessions
chmod 777 /tmp/php_sessions
```

### Session Data Kayboluyur

**Çözüm:**
`php.ini` dosyasında:
```ini
session.gc_maxlifetime = 3600
session.cookie_lifetime = 0
```

## Production Deployment Sorunları

### Apache Virtual Host Çalışmıyor

**Çözüm:**
```bash
# Site'ı aktif et
sudo a2ensite hancer-backend
sudo systemctl reload apache2

# Apache syntax'ını kontrol et
sudo apache2ctl configtest
```

### Nginx 502 Bad Gateway

**Çözüm:**
```bash
# PHP-FPM çalışıyor mu kontrol et
sudo systemctl status php7.4-fpm

# PHP-FPM'i yeniden başlat
sudo systemctl restart php7.4-fpm
```

## Performans Sorunları

### Yavaş Response Time

**Çözüm:**
1. PHP OPcache'i aktif et:
```ini
# php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
```

2. Database indexleri kontrol et
3. Query'leri optimize et

### Memory Limit Hatası

**Çözüm:**
```ini
# php.ini veya .htaccess
memory_limit = 256M
```

## Log Kontrolü

### Error Log'ları Görme

```bash
# Apache error log
tail -f /var/log/apache2/error.log

# Nginx error log
tail -f /var/log/nginx/error.log

# PHP error log
tail -f /var/log/php_errors.log

# Sistem log
journalctl -f -u apache2
```

### Debug Mode Aktif Etme

Development ortamında debug için `index.php` başına:
```php
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

## Yedekleme ve Geri Yükleme

### Veritabanı Yedekleme

```bash
# SQLite backup
cp hancer_law.db hancer_law_backup_$(date +%Y%m%d).db

# Uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### Geri Yükleme

```bash
# Database restore
cp hancer_law_backup_20231201.db hancer_law.db

# Uploads restore
tar -xzf uploads_backup_20231201.tar.gz
```

## Güvenlik Kontrolleri

### Dosya İzinleri Kontrolü

```bash
# Güvenli izinler
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 777 uploads/
chmod +x start.sh deploy.sh
```

### Güvenlik Açıkları Kontrolü

```bash
# .env dosyasının web'den erişilemediğini kontrol et
curl http://yourdomain.com/.env

# Sensitive dosyaların korunduğunu kontrol et
curl http://yourdomain.com/config/database.php
```

## Test Etme

### API Endpoint Test

```bash
# Health check
curl http://localhost:8000/health

# Contact message test
curl -X POST http://localhost:8000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "subject": "Test Subject",
    "legal_area": "other",
    "urgency": "low",
    "message": "Test message"
  }'
```

### Frontend Bağlantı Testi

```bash
# CORS test
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/messages
```

## Acil Durum Çözümleri

### Sistem Tamamen Çalışmıyor

```bash
# 1. Basit PHP test
echo "<?php phpinfo(); ?>" > test.php
php -S localhost:8000 test.php

# 2. Orijinal Python backend'e geri dön
cd ../backend
python server.py

# 3. Minimal PHP setup
echo "<?php echo 'Server is running'; ?>" > minimal.php
php -S localhost:8000 minimal.php
```

### Veritabanı Bozulmuş

```bash
# Python backend'den kopyala
cp ../backend/hancer_law.db ./

# Veya sıfırdan oluştur
rm hancer_law.db
php -r "require 'config/database.php'; new Database();"
```

Bu troubleshooting guide'ı kullanarak çoğu problemi çözebilirsiniz. Eğer problem devam ederse, error log'larını kontrol edin ve spesifik hata mesajlarını inceleyin.