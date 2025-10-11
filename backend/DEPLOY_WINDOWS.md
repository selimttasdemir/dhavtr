# PLESK WINDOWS DEPLOY REHBERİ
# FastAPI + SQLite uygulamasını Plesk (Windows/IIS) üzerinde yayınlama

## ÖNEMLİ: Bu rehber adım adım takip edilmelidir!

## 1. SUNUCU GEREKSİNİMLERİ
✓ Windows Server (Plesk kurulu)
✓ Python 3.10+ kurulu ve PATH'e eklenmiş
✓ IIS üzerinde şu modüller yüklü:
  - URL Rewrite Module
  - Application Request Routing (ARR)

## 2. DOSYA HAZIRLAMA (Bilgisayarınızda)

### 2.1 Kendi .env dosyanızı oluşturun:
1. .env.example dosyasını kopyalayın
2. .env olarak yeniden adlandırın  
3. İçindeki "yourdomain.com" kısımlarını kendi domain'inizle değiştirin

### 2.2 Dosyaları sıkıştırın:
- Tüm backend klasörünü (.venv hariç) zip yapın
- Veya FTP ile tek tek yükleyin

## 3. PLESK PANELİNDE AYARLAR

### 3.1 Domain oluşturma/seçme:
1. Plesk panelde domain'inizi seçin
2. File Manager'a gidin
3. httpdocs klasörünü temizleyin (gerekirse)

### 3.2 Dosya yükleme:
1. File Manager ile backend dosyalarınızı yükleyin
2. Veya FTP kullanın: ftp.yourdomain.com

## 4. SUNUCUDA KURULUM (RDP/SSH ile)

### 4.1 Sunucuya bağlanın:
- Remote Desktop (RDP) ile Windows sunucusuna bağlanın
- Veya Plesk SSH varsa kullanın

### 4.2 Python kontrolü:
```cmd
python --version
```
- Python 3.10+ görmeli
- Yoksa Python'u indirip kurun ve PATH'e ekleyin

### 4.3 Proje klasörüne gidin:
```cmd
cd C:\inetpub\vhosts\yourdomain.com\httpdocs
```
(Plesk'te domain klasörü farklı olabilir)

### 4.4 Virtual Environment oluşturun:
```cmd
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 4.5 Test edin:
```cmd
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```
- Ctrl+C ile durdurun
- Başka terminal açın: curl http://127.0.0.1:8000
- JSON response gelirse OK

## 5. IIS AYARLARI

### 5.1 URL Rewrite kontrolü:
1. IIS Manager açın
2. Sites > yourdomain.com seçin
3. URL Rewrite simgesini görmeli
4. Yoksa Web Platform Installer ile kurun

### 5.2 web.config kontrolü:
- web.config dosyası httpdocs'ta olmalı
- IIS otomatik tanıyacak

## 6. SERVİS OLARAK ÇALIŞTIRMA

### Seçenek A: Task Scheduler (Basit)
1. Task Scheduler açın
2. Create Basic Task
3. Name: FastAPI Hancer
4. Trigger: At startup
5. Action: Start program
6. Program: C:\inetpub\vhosts\yourdomain.com\httpdocs\start.bat
7. Save

### Seçenek B: NSSM (Gelişmiş)
1. NSSM indirin: https://nssm.cc/download
2. nssm.exe'yi C:\Windows\System32\ kopyalayın
3. Komut satırında:
```cmd
nssm install HancerAPI
```
4. Ayarlar:
   - Path: C:\inetpub\vhosts\yourdomain.com\httpdocs\.venv\Scripts\python.exe
   - Startup directory: C:\inetpub\vhosts\yourdomain.com\httpdocs
   - Arguments: -m uvicorn server:app --host 127.0.0.1 --port 8000
5. Install tıklayın
6. Services'te başlatın

## 7. İZİNLER (ÖNEMLİ!)

### 7.1 SQLite dosyası izinleri:
1. hancer_law.db dosyasına sağ tık > Properties > Security
2. Add > Advanced > Find Now
3. IIS_IUSRS seçin > OK
4. Full Control verin

### 7.2 uploads klasörü izinleri:
- Aynı şekilde uploads klasörüne de IIS_IUSRS full control verin

## 8. TEST VE DOĞRULAMA

### 8.1 Yerel test:
```cmd
netstat -ano | findstr 8000
```
- Port 8000'in dinlendiğini görmeli

### 8.2 Domain testi:
- Browser'da: https://yourdomain.com
- JSON response gelirse başarılı
- 502 hatası alırsanız uvicorn çalışmıyor

### 8.3 API test:
- https://yourdomain.com/api/settings
- Site ayarları JSON'ı gelmeli

## 9. LOGLAR VE İZLEME

### Log dosyaları:
- uvicorn.log: logs/ klasöründe
- IIS logs: Plesk panelde Logs bölümünde

### Sorun giderme:
1. uvicorn çalışıyor mu? → netstat -ano | findstr 8000
2. IIS reverse proxy çalışıyor mu? → web.config kontrol
3. İzinler tamam mı? → SQLite ve uploads klasörü
4. CORS hatası var mı? → .env CORS_ORIGINS kontrol

## 10. GÜVENLİK

### SSL sertifikası:
- Plesk panelde Let's Encrypt aktifleştirin
- Veya kendi SSL sertifikanızı yükleyin

### Firewall:
- Port 8000'i dışarıya açmayın (sadece localhost)
- HTTPS (443) ve HTTP (80) açık olmalı

## YARDIM İÇİN:
- IIS logları: Plesk > Domain > Logs
- Uvicorn logları: logs/uvicorn.log
- Windows Event Viewer: Services için