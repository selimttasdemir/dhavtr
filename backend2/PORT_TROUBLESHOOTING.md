# PHP Backend Port Sorunları Çözüm Rehberi

## Port kullanımda hatası: "Address already in use"

Bu hatayı aldığınızda şu adımları takip edin:

### 1. Hangi process portu kullanıyor kontrol edin:
```bash
lsof -i :8000
```

### 2. PHP server'ı durdurun:
```bash
# Tüm PHP server'ları durdur
pkill -f "php -S"

# Veya belirli PID'i durdur
kill <PID>

# Zorla durdur (gerekirse)
kill -9 <PID>
```

### 3. Port boş mu kontrol edin:
```bash
lsof -i :8000
# Hiçbir output yoksa port boş
```

### 4. Sunucuyu yeniden başlatın:
```bash
cd backend2
php -S 127.0.0.1:8000 index.php
```

## Hızlı Çözüm Komutları:

### Tüm PHP server'ları durdur ve yeniden başlat:
```bash
pkill -f "php -S" && sleep 2 && php -S 127.0.0.1:8000 index.php
```

### Restart script'ini kullan:
```bash
./restart.sh
```

### Farklı port kullan:
```bash
php -S 127.0.0.1:8001 index.php
# .env dosyasında PORT=8001 yapmayı unutmayın
```

## Background'da çalıştırma:

### Linux/macOS:
```bash
nohup php -S 127.0.0.1:8000 index.php > server.log 2>&1 &
```

### Durdurma:
```bash
pkill -f "php -S"
```

## Windows için:

### PowerShell'de:
```powershell
# Port kontrolü
netstat -ano | findstr :8000

# Process durdurma
taskkill /PID <PID> /F

# Sunucu başlatma
php -S 127.0.0.1:8000 index.php
```

### CMD'de:
```cmd
start.bat
```

## Önemli Notlar:

1. **Sadece bir sunucu çalıştırın**: Aynı anda birden fazla sunucu aynı portta çalışamaz
2. **Background process'leri kontrol edin**: `jobs` komutu ile background process'leri görebilirsiniz
3. **Log'ları kontrol edin**: `server.log` dosyasını kontrol ederek hataları görebilirsiniz
4. **Port değiştirin**: Gerekirse .env dosyasında farklı port kullanın

## Test Komutları:

```bash
# Health check
curl http://127.0.0.1:8000/health

# API test
curl -X POST http://127.0.0.1:8000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"123","subject":"Test","legal_area":"other","urgency":"low","message":"Test"}'
```