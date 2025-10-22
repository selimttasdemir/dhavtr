# SORUN GİDERME VE GÜVENLİK REHBERİ
# FastAPI Plesk Windows Deploy - Yaygın Problemler ve Çözümleri

## 🔧 YAYGIN SORUNLAR VE ÇÖZÜMLERİ

### 1. 502 Bad Gateway Hatası
**Belirti:** Site açılmıyor, 502 hatası veriyor
**Sebep:** Backend (uvicorn) çalışmıyor

**Çözüm adımları:**
1. Sunucuda cmd açın
2. Port kontrolü: `netstat -ano | findstr 8000`
3. Eğer boşsa backend çalışmıyor:
   ```cmd
   cd C:\inetpub\vhosts\yourdomain.com\httpdocs
   start.bat
   ```
4. Task Scheduler'da servis çalışıyor mu kontrol edin
5. Event Viewer'da hata loglarına bakın

### 2. SQLite Database Locked Hatası
**Belirti:** API çağrıları "database locked" hatası veriyor
**Sebep:** Dosya izinleri veya çoklu erişim

**Çözüm:**
1. hancer_law.db dosyasına sağ tık > Properties > Security
2. IIS_IUSRS kullanıcısını ekleyin
3. Full Control izni verin
4. Uygulamayı yeniden başlatın
5. Eğer devam ederse database'i kopyalayıp yeniden oluşturun

### 3. CORS (Cross-Origin) Hatası
**Belirti:** Frontend'den API çağrıları çalışmıyor, browser console'da CORS hatası
**Sebep:** .env dosyasında domain ayarları yanlış

**Çözüm:**
1. .env dosyasını açın
2. CORS_ORIGINS değerini güncelleyin:
   ```
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
3. Uygulamayı yeniden başlatın

### 4. Port Çakışması (Port 8000 Already in Use)
**Belirti:** start.bat çalışırken "port already in use" hatası
**Sebep:** Başka bir uygulama 8000 portunu kullanıyor

**Çözüm:**
1. Hangi program kullandığını bul: `netstat -ano | findstr 8000`
2. Process ID'yi not et
3. Task Manager'da process'i sonlandır
4. Veya .env'de farklı port kullan:
   ```
   PORT=8001
   ```

### 5. Python/pip Bulunamıyor Hatası
**Belirti:** "python is not recognized" hatası
**Sebep:** Python PATH'e eklenmemiş

**Çözüm:**
1. Python'un kurulu olduğunu kontrol edin
2. System Environment Variables'a ekleyin:
   - C:\Python3X\
   - C:\Python3X\Scripts\
3. CMD'yi yeniden açın
4. Test: `python --version`

### 6. Virtual Environment Aktif Olmıyor
**Belirti:** .venv\Scripts\activate çalışmıyor
**Sebep:** PowerShell execution policy

**Çözüm:**
1. PowerShell'i Administrator olarak açın
2. `Set-ExecutionPolicy RemoteSigned`
3. Veya cmd kullanın: `.venv\Scripts\activate.bat`

### 7. IIS URL Rewrite Çalışmıyor
**Belirti:** web.config var ama reverse proxy çalışmıyor
**Sebep:** IIS modülleri kurulu değil

**Çözüm:**
1. Web Platform Installer'ı indirin
2. Şu modülleri kurun:
   - URL Rewrite 2.1
   - Application Request Routing 3.0
3. IIS'i yeniden başlatın

### 8. Uploads Klasörü Yazma Hatası
**Belirti:** File upload çalışmıyor, permission denied
**Sebep:** uploads klasörüne yazma izni yok

**Çözüm:**
1. uploads klasörüne sağ tık > Properties > Security
2. IIS_IUSRS'e Full Control verin
3. Modify ve Write izinlerini kontrol edin

## 🔒 GÜVENLİK ÖNERİLERİ

### 1. Port Güvenliği
```bash
# Port 8000'i sadece localhost'a kısıtlayın
# Windows Firewall'da:
netsh advfirewall firewall add rule name="Block Port 8000" dir=in action=block protocol=TCP localport=8000 remoteip=!127.0.0.1
```

### 2. SSL/HTTPS Kurulumu
**Plesk Panel'de:**
1. Domain seçin > SSL/TLS Certificates
2. Let's Encrypt'i aktifleştirin
3. "Redirect from HTTP to HTTPS" seçin
4. "HSTS" aktifleştirin

### 3. Admin Panel Güvenliği
**.env dosyasına ekleyin:**
```bash
# Admin panel güvenliği
ADMIN_SESSION_TIMEOUT=3600
ADMIN_MAX_LOGIN_ATTEMPTS=5
```

### 4. Database Güvenliği
```bash
# SQLite dosyası izinleri (sadece gerekli kullanıcılar)
# hancer_law.db için:
# - IIS_IUSRS: Read/Write
# - Administrators: Full Control
# - Diğer kullanıcılar: İzin yok
```

### 5. Log Güvenliği
```bash
# Log dosyalarını güvenli dizinde saklayın
# logs/ klasörü public erişime kapalı olmalı
```

## 📊 İZLEME VE LOGLAR

### 1. Log Dosyası Lokasyonları
```
Uvicorn Logs: httpdocs/logs/uvicorn.log
IIS Logs: Plesk Panel > Domain > Logs
Windows Event Viewer: Application > Error
```

### 2. Performans İzleme
```cmd
# CPU ve Memory kullanımı
tasklist | findstr python

# Network bağlantıları
netstat -ano | findstr 8000
```

### 3. Health Check Script
```cmd
# check_health.bat oluşturun:
@echo off
curl -s http://127.0.0.1:8000/ > nul
if %ERRORLEVEL% equ 0 (
    echo API is running
) else (
    echo API is down - restarting...
    start.bat
)
```

## 🚨 ACİL DURUM PROSEDÜRÜ

### Site Çöktüğünde:
1. **Hızlı kontrol:**
   ```cmd
   netstat -ano | findstr 8000
   ```

2. **Logları kontrol edin:**
   ```cmd
   type logs\uvicorn.log | find "ERROR"
   ```

3. **Yeniden başlatın:**
   ```cmd
   taskkill /f /im python.exe
   start.bat
   ```

4. **Database backup'tan restore:**
   ```cmd
   copy hancer_law.db.backup hancer_law.db
   ```

### Yedekleme Stratejisi:
```cmd
# Günlük otomatik backup (Task Scheduler ile)
xcopy hancer_law.db backup\hancer_law_%date%.db
xcopy uploads backup\uploads_%date%\ /s /e
```

## 🔍 DEBUG MODU

### Geliştirme için debug aktifleştirme:
1. .env dosyasına ekleyin:
   ```
   DEBUG=true
   LOG_LEVEL=debug
   ```

2. start.bat'ı güncelle:
   ```cmd
   .\.venv\Scripts\python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload --log-level debug
   ```

### Detaylı hata logları:
```python
# server.py'da logging seviyesini artırın
import logging
logging.getLogger("uvicorn").setLevel(logging.DEBUG)
```

Bu rehberle karşılaşabileceğiniz tüm sorunları çözebilir ve güvenli bir şekilde deploy edebilirsiniz!