# AWS EC2'de Docker ile Deployment Rehberi

## 📋 Gereksinimler
- AWS hesabı
- SSH key pair
- Domain (opsiyonel)

## 🚀 Adım Adım Kurulum

### 1. EC2 Instance Oluşturma

#### AWS Console'dan:
1. AWS Console → EC2 → Launch Instance
2. **İsim**: `hancer-backend-server`
3. **AMI Seçimi**: 
   - Ubuntu Server 22.04 LTS (önerilen)
   - veya Amazon Linux 2023
4. **Instance Type**: 
   - Başlangıç için: `t2.micro` (free tier)
   - Production için: `t3.small` veya `t3.medium`
5. **Key Pair**: 
   - Yeni bir key pair oluşturun veya mevcut olanı seçin
   - İndir ve güvenli bir yerde sakla (örn: `hancer-key.pem`)
6. **Network Settings**:
   - ✅ Allow SSH traffic from (My IP veya Anywhere)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet
7. **Configure Storage**: 20-30 GB (minimum)
8. **Launch Instance**

### 2. EC2'ye Bağlanma

```bash
# Key dosyasına izin ver
chmod 400 hancer-key.pem

# EC2'ye SSH ile bağlan (Ubuntu için)
ssh -i hancer-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Amazon Linux için:
# ssh -i hancer-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### 3. EC2'de Gerekli Yazılımları Kurma

```bash
# Sistem güncellemeleri
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# User'ı docker grubuna ekle (sudo yazmadan docker kullanmak için)
sudo usermod -aG docker ubuntu
# Yeniden login yapın veya şunu çalıştırın:
newgrp docker

# Git kurulumu (kod çekmek için)
sudo apt install -y git

# Nginx kurulumu (reverse proxy için - opsiyonel ama önerilen)
sudo apt install -y nginx
```

### 4. Projeyi EC2'ye Aktarma

#### Seçenek A: Git ile (Önerilen)
```bash
# Projeyi clone et
cd /home/ubuntu
git clone https://github.com/selimttasdemir/dhavtr.git
cd dhavtr/backend
```

#### Seçenek B: SCP ile dosya transfer
```bash
# Lokal bilgisayarınızdan çalıştırın:
scp -i hancer-key.pem -r /home/s/Belgeler/hancer.av.tr/dhavtr/backend ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/
```

### 5. Environment Variables Ayarlama

```bash
# EC2'de backend klasöründe:
cd /home/ubuntu/dhavtr/backend

# .env dosyası oluştur (production ayarlarıyla)
nano .env
```

`.env` içeriği:
```env
ENVIRONMENT=production
PORT=8000
DATABASE_URL=sqlite:///./hancer_law.db
# Gerekirse diğer değişkenler...
```

### 6. Docker Image Build ve Çalıştırma

```bash
# Docker image'ı build et
docker build -t hancer-backend .

# Container'ı çalıştır
docker run -d \
  --name hancer-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/hancer_law.db:/app/hancer_law.db \
  --env-file .env \
  hancer-backend

# Container durumunu kontrol et
docker ps

# Logları kontrol et
docker logs hancer-backend

# Real-time log takibi
docker logs -f hancer-backend
```

### 7. Nginx Reverse Proxy Kurulumu (Önerilen)

```bash
# Nginx config dosyası oluştur
sudo nano /etc/nginx/sites-available/hancer-backend
```

Config içeriği:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads için static file serving
    location /uploads/ {
        proxy_pass http://localhost:8000/uploads/;
        proxy_set_header Host $host;
    }
}
```

```bash
# Config'i aktif et
sudo ln -s /etc/nginx/sites-available/hancer-backend /etc/nginx/sites-enabled/

# Default site'ı kaldır (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx test et
sudo nginx -t

# Nginx'i restart et
sudo systemctl restart nginx
```

### 8. SSL Sertifikası (HTTPS) - Let's Encrypt

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (domain varsa)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme test et
sudo certbot renew --dry-run
```

### 9. Security Group Ayarları (AWS Console'dan)

EC2 Instance → Security → Security Groups → Edit Inbound Rules:

| Type  | Protocol | Port Range | Source      | Description          |
|-------|----------|------------|-------------|----------------------|
| SSH   | TCP      | 22         | My IP       | SSH access           |
| HTTP  | TCP      | 80         | 0.0.0.0/0   | HTTP traffic         |
| HTTPS | TCP      | 443        | 0.0.0.0/0   | HTTPS traffic        |

### 10. Domain Ayarları (Opsiyonel)

Domain sağlayıcınızda (Namecheap, GoDaddy, vs.):
- **A Record**: `@` → `YOUR_EC2_PUBLIC_IP`
- **A Record**: `www` → `YOUR_EC2_PUBLIC_IP`

## 🔄 Güncelleme İşlemleri

```bash
# EC2'ye bağlan
ssh -i hancer-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Backend klasörüne git
cd /home/ubuntu/dhavtr/backend

# Git ile son değişiklikleri çek
git pull

# Container'ı durdur ve sil
docker stop hancer-backend
docker rm hancer-backend

# Yeni image build et
docker build -t hancer-backend .

# Yeniden çalıştır
docker run -d \
  --name hancer-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/hancer_law.db:/app/hancer_law.db \
  --env-file .env \
  hancer-backend

# Logları kontrol et
docker logs -f hancer-backend
```

## 📊 Monitoring ve Bakım

### Container Yönetimi
```bash
# Container durumu
docker ps -a

# Logları görüntüle
docker logs hancer-backend
docker logs -f hancer-backend  # real-time

# Container içine gir
docker exec -it hancer-backend /bin/bash

# Container'ı restart et
docker restart hancer-backend

# Disk kullanımını temizle
docker system prune -a
```

### Sistem Kaynakları
```bash
# CPU ve Memory kullanımı
docker stats hancer-backend

# Disk kullanımı
df -h

# Sistem resource'ları
htop  # veya top
```

## 🔧 Sorun Giderme

### Container çalışmıyorsa:
```bash
docker logs hancer-backend
docker inspect hancer-backend
```

### Port zaten kullanılıyorsa:
```bash
sudo lsof -i :8000
sudo kill -9 PID_NUMBER
```

### Database sorunları:
```bash
# Database dosyasının izinlerini kontrol et
ls -la hancer_law.db
chmod 664 hancer_law.db
```

### Nginx sorunları:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## 💡 Docker Compose ile Alternatif Kurulum

`docker-compose.yml` oluşturun:
```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: hancer-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./uploads:/app/uploads
      - ./hancer_law.db:/app/hancer_law.db
    environment:
      - ENVIRONMENT=production
      - PORT=8000
    env_file:
      - .env
```

Çalıştırma:
```bash
# Başlat
docker-compose up -d

# Durdur
docker-compose down

# Yeniden build et ve başlat
docker-compose up -d --build

# Loglar
docker-compose logs -f
```

## 🎯 Production Checklist

- [ ] EC2 instance oluşturuldu
- [ ] Security groups yapılandırıldı
- [ ] Docker ve gerekli araçlar kuruldu
- [ ] Proje EC2'ye aktarıldı
- [ ] Environment variables ayarlandı
- [ ] Docker container çalışıyor
- [ ] Nginx reverse proxy kuruldu
- [ ] SSL sertifikası yüklendi (domain varsa)
- [ ] Domain DNS ayarları yapıldı (domain varsa)
- [ ] Health check çalışıyor
- [ ] Loglar kontrol edildi
- [ ] Backup stratejisi oluşturuldu

## 📞 Yardım

Sorun yaşarsanız:
1. Container loglarını kontrol edin: `docker logs hancer-backend`
2. Nginx loglarını kontrol edin: `sudo tail -f /var/log/nginx/error.log`
3. Security group ayarlarını kontrol edin
4. EC2 instance'ın çalıştığından emin olun

## 🔒 Güvenlik Notları

- ✅ SSH key dosyasını güvenli tutun
- ✅ Security Group'ta sadece gerekli portları açın
- ✅ SSH için sadece kendi IP'nizi kullanın
- ✅ `.env` dosyasını Git'e commit etmeyin
- ✅ Düzenli backup alın
- ✅ SSL kullanın (HTTPS)
- ✅ Güçlü şifreler kullanın
