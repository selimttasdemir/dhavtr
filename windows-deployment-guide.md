# Windows Server Deployment Guide

## Gereksinimler
- Windows Server 2019/2022
- Python 3.8+ (Python 3.11 önerilen)
- Node.js 18+
- IIS (Internet Information Services)
- Git

## Backend Deployment

### 1. Python ve Dependencies
```powershell
# Python 3.11 kurulumu
# https://www.python.org/downloads/windows/

# Virtual environment oluştur
python -m venv venv
venv\Scripts\activate

# Dependencies yükle
pip install -r backend/requirements.txt
```

### 2. Windows Service Olarak Çalıştırma
```powershell
# NSSM (Non-Sucking Service Manager) kullan
# https://nssm.cc/download

nssm install DHLawBackend
nssm set DHLawBackend Application "C:\path\to\venv\Scripts\python.exe"
nssm set DHLawBackend AppParameters "-m uvicorn server:app --host 0.0.0.0 --port 8000"
nssm set DHLawBackend AppDirectory "C:\path\to\dhavtr\backend"
nssm start DHLawBackend
```

### 3. Database Path Düzeltmesi
```python
# backend/database.py içinde Windows path için
import os
from pathlib import Path

# Mevcut
DATABASE_URL = "sqlite:///./hancer_law.db"

# Windows için önerilen
BASE_DIR = Path(__file__).parent
DATABASE_PATH = BASE_DIR / "hancer_law.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
```

## Frontend Deployment

### 1. Build Process
```powershell
cd frontend
npm install
npm run build
```

### 2. IIS Konfigürasyonu
```xml
<!-- web.config for React Router -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 3. SSL Sertifikası
- Let's Encrypt için win-acme kullanın
- https://www.win-acme.com/

## Firewall Konfigürasyonu
```powershell
# Port 80 ve 443'ü aç
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -Protocol TCP -LocalPort 8000
```

## Potansiyel Sorunlar ve Çözümler

1. **Path Separator Sorunları**
   - Tüm path'leri `pathlib.Path` ile handle edin
   
2. **File Permissions**
   - IIS_IUSRS kullanıcısına gerekli izinleri verin
   
3. **SQLite Locking**
   - Database dosyası için write permissions
   - Multiple process access sorunları
   
4. **Memory Management**
   - Windows'ta Python memory leaks
   - Düzenli service restart gerekebilir

## Monitoring
```powershell
# Windows Event Logs
Get-EventLog -LogName Application -Source "Python"

# Service status
Get-Service DHLawBackend
```