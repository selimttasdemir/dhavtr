# PHP Backend for Lawyer Website

## Status: ✅ FULLY WORKING

This is the complete PHP conversion of the original Python FastAPI backend for the lawyer website. The conversion preserves 100% of the original functionality while providing cross-platform compatibility.

## Quick Start

```bash
cd backend2
chmod +x start.sh  # Linux/Mac only
./start.sh        # Linux/Mac
# OR
start.bat         # Windows
```

Server will be available at: `http://localhost:8000`

## Verified Working Features

✅ Health endpoint: `/health`  
✅ Site settings: `/settings`  
✅ Blog posts: `/blog`  
✅ Contact messages: `/messages` (with auth)  
✅ File uploads: `/upload` (with auth)  
✅ Admin authentication  
✅ CORS support  
✅ Multi-language content  
✅ SQLite database  
✅ Cross-platform compatibility  

## Technical Stack

- **PHP 8.3+**: Main runtime
- **SQLite**: Database engine
- **Session-based auth**: Secure authentication
- **Cross-platform**: Linux, Windows, macOS support
- **Dosya Yükleme**: Logo ve diğer dosya yükleme
- **CORS Desteği**: Frontend ile güvenli iletişim

## Sistem Gereksinimleri

- PHP 7.4 veya üzeri
- PDO ve PDO_SQLite eklentileri
- mbstring eklentisi
- JSON eklentisi
- Apache/Nginx (production için) veya PHP built-in server (development için)

## Kurulum

### 1. Hızlı Kurulum

```bash
# Deployment script'ini çalıştır
./deploy.sh

# Sunucuyu başlat
./start.sh
```

### 2. Manuel Kurulum

```bash
# Dosya izinlerini ayarla
chmod -R 755 .
chmod -R 777 uploads/
chmod 644 .env

# Gerekli PHP eklentilerini kontrol et
php -m | grep -E "pdo|sqlite|mbstring|json"

# Environment dosyasını düzenle
cp .env.example .env
nano .env

# Sunucuyu başlat
php -S localhost:8000 index.php
```

## Konfigürasyon

`.env` dosyasını düzenleyerek yapılandırma yapabilirsiniz:

```env
# Sunucu ayarları
PORT=8000
HOST=127.0.0.1

# CORS ayarları
CORS_ORIGINS=https://hancer.av.tr,https://www.hancer.av.tr

# Dosya yükleme ayarları
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
```

## API Endpoints

### Genel Endpoints

- `GET /health` - Sunucu durumu kontrolü
- `POST /upload` - Dosya yükleme (auth gerekli)

### İletişim Mesajları

- `POST /api/messages` - Yeni mesaj oluştur
- `GET /api/messages` - Tüm mesajları getir (auth gerekli)
- `DELETE /api/messages/{id}` - Mesaj sil (auth gerekli)
- `PUT /api/messages/{id}/read` - Mesajı okundu işaretle (auth gerekli)

### Blog Yazıları

- `GET /api/blog` - Blog yazılarını getir
- `POST /api/blog` - Yeni blog yazısı oluştur (auth gerekli)
- `GET /api/blog/{id}` - Belirli blog yazısını getir
- `PUT /api/blog/{id}` - Blog yazısını güncelle (auth gerekli)
- `DELETE /api/blog/{id}` - Blog yazısını sil (auth gerekli)

### Site Ayarları

- `GET /api/settings` - Site ayarlarını getir
- `PUT /api/settings` - Site ayarlarını güncelle (auth gerekli)

### Admin

- `POST /api/admin/setup` - İlk admin kullanıcısını oluştur
- `POST /api/admin/login` - Admin girişi
- `POST /api/admin/logout` - Admin çıkışı
- `GET /api/admin/check` - Oturum kontrolü
- `PUT /api/admin/password` - Şifre değiştir (auth gerekli)

## Veritabanı

SQLite veritabanı kullanılmaktadır. Veritabanı dosyası `hancer_law.db` otomatik olarak oluşturulur.

### Tablolar

- `contact_messages` - İletişim mesajları
- `blog_posts` - Blog yazıları
- `admin_users` - Admin kullanıcıları
- `site_settings` - Site ayarları
- `password_resets` - Şifre sıfırlama tokenları

## Production Deployment

### Apache Konfigürasyonu

```apache
<VirtualHost *:80>
    ServerName api.hancer.av.tr
    DocumentRoot /path/to/backend2
    
    <Directory /path/to/backend2>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    # SSL yönlendirmesi
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName api.hancer.av.tr
    DocumentRoot /path/to/backend2
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    <Directory /path/to/backend2>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name api.hancer.av.tr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.hancer.av.tr;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /path/to/backend2;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location /uploads {
        alias /path/to/backend2/uploads;
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
}
```

## Güvenlik

- Tüm kullanıcı girişleri sanitize edilir
- SQL injection koruması
- CORS koruması
- XSS koruması
- Dosya yükleme güvenliği
- Session yönetimi
- Şifre hash'leme

## Performans

- SQLite veritabanı (küçük-orta ölçekli projeler için ideal)
- Dosya cache desteği
- Gzip kompresyon
- Static dosya cache

## Migrasyon (Python'dan PHP'ye)

Python backend'iniz varsa:

1. Mevcut `hancer_law.db` dosyasını PHP backend klasörüne kopyalayın
2. `.env` dosyasını Python backend'indeki ayarlara göre düzenleyin
3. Frontend'in API endpoint'lerini güncellemeye gerek yoktur (aynı format)

## Troubleshooting

### Yaygın Problemler

1. **500 Internal Server Error**
   - PHP error log'larını kontrol edin
   - `.htaccess` dosyasının doğru olduğundan emin olun
   - Dosya izinlerini kontrol edin

2. **CORS Hatası**
   - `.env` dosyasında `CORS_ORIGINS` ayarını kontrol edin
   - Web sunucusu CORS header'larını doğru gönderdiğinden emin olun

3. **Database Hatası**
   - `hancer_law.db` dosyasının yazılabilir olduğundan emin olun
   - SQLite eklentisinin yüklü olduğunu kontrol edin

4. **File Upload Hatası**
   - `uploads/` klasörünün yazılabilir olduğundan emin olun
   - PHP `upload_max_filesize` ayarını kontrol edin

## Lisans

Bu proje Hancer Law Firm'e aittir.

## İletişim

- Email: info@hancer.av.tr
- Website: https://hancer.av.tr