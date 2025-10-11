# Cross-Platform Startup Guide

## Hancer Law Firm PHP Backend

Bu rehber PHP backend'inin hem Windows hem Linux sistemlerde nasıl çalıştırılacağını açıklar.

## Linux/Ubuntu'da Kurulum ve Çalıştırma

### 1. Gerekli Paketleri Yükleyin

```bash
# Sistem paketlerini güncelleyin
sudo apt update

# PHP ve gerekli eklentileri yükleyin
sudo apt install -y php8.3-cli php8.3-sqlite3 php8.3-mbstring php8.3-curl
```

### 2. Backend'i Kurun ve Çalıştırın

```bash
# Backend2 klasörüne gidin
cd /path/to/dhavtr/backend2

# Deployment script'ini çalıştırın
./deploy.sh

# Sunucuyu başlatın
./start.sh

# Veya manuel olarak başlatın
php -S localhost:8000 index.php
```

### 3. Test Edin

```bash
# Health check
curl http://localhost:8000/health

# API test
curl -X POST http://localhost:8000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "phone": "1234567890",
    "subject": "Test",
    "legal_area": "other",
    "urgency": "low",
    "message": "Test message"
  }'
```

## Windows'ta Kurulum ve Çalıştırma

### 1. PHP'yi Yükleyin

1. https://www.php.net/downloads.php adresinden PHP'yi indirin (Thread Safe versiyonu)
2. `C:\php` klasörüne çıkarın
3. `C:\php` klasörünü PATH environment variable'ına ekleyin
4. `php.ini-development` dosyasını `php.ini` olarak kopyalayın
5. `php.ini` dosyasında şu satırları uncomment edin:
   ```ini
   extension=pdo_sqlite
   extension=mbstring
   extension=curl
   extension=json
   ```

### 2. Backend'i Kurun ve Çalıştırın

```cmd
REM Backend2 klasörüne gidin
cd C:\path\to\dhavtr\backend2

REM Deployment script'ini çalıştırın
deploy.bat

REM Sunucuyu başlatın
start.bat

REM Veya manuel olarak başlatın
php -S localhost:8000 index.php
```

### 3. Test Edin

```cmd
REM Health check (PowerShell)
Invoke-WebRequest -Uri http://localhost:8000/health

REM Veya curl ile (Windows 10+)
curl http://localhost:8000/health
```

## Ortak Sorun Giderme

### Port 8000 Kullanımda Hatası

```bash
# Linux
sudo lsof -i :8000
sudo kill -9 <PID>

# Veya farklı port kullanın
php -S localhost:8001 index.php
```

```cmd
REM Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

REM Veya farklı port kullanın
php -S localhost:8001 index.php
```

### PHP Eklentileri Eksik

**Linux:**
```bash
sudo apt install php8.3-sqlite3 php8.3-mbstring php8.3-curl
```

**Windows:**
`php.ini` dosyasında bu satırları uncomment edin:
```ini
extension=pdo_sqlite
extension=mbstring
extension=curl
```

### CORS Hatası

`.env` dosyasında CORS_ORIGINS ayarını güncelleyin:
```env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Dosya İzinleri (Linux)

```bash
chmod -R 755 .
chmod -R 777 uploads/
chmod 644 .env hancer_law.db
```

## Production Deployment

### Linux (Apache/Nginx)

1. Dosyaları web sunucusu dizinine kopyalayın
2. Virtual host yapılandırın
3. SSL sertifikası ekleyin
4. `.env` dosyasında production ayarları yapın

### Windows (IIS)

1. IIS'e PHP desteği ekleyin
2. Site'i IIS'e ekleyin
3. URL Rewrite modülünü yükleyin
4. `.env` dosyasında production ayarları yapın

## Konfigürasyon

`.env` dosyasını düzenleyerek ayarları değiştirin:

```env
# Server settings
PORT=8000
HOST=127.0.0.1

# CORS settings
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Database path
DB_PATH=./hancer_law.db

# File upload settings
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Debug mode (false for production)
DEBUG=false
```

## API Endpoints

Tüm API endpoint'leri hem Windows hem Linux'ta aynı şekilde çalışır:

- `GET /health` - Server durumu
- `POST /api/messages` - İletişim mesajı oluştur
- `GET /api/messages` - Mesajları listele (auth gerekli)
- `GET/POST/PUT/DELETE /api/blog` - Blog işlemleri
- `GET/PUT /api/settings` - Site ayarları
- `POST /api/admin/login` - Admin girişi
- `POST /api/upload` - Dosya yükleme

## İletişim

- Email: info@hancer.av.tr
- Website: https://hancer.av.tr

Bu backend Python FastAPI backend'i ile 100% uyumludur ve frontend kodunuzda değişiklik yapmanıza gerek yoktur.