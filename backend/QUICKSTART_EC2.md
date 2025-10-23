# 🚀 AWS EC2 Hızlı Başlangıç

## 3 Adımda Deployment

### 1️⃣ EC2 Instance Oluştur

AWS Console → EC2 → Launch Instance:
- **AMI**: Ubuntu Server 22.04 LTS
- **Type**: t2.micro (free tier) veya t3.small
- **Storage**: 20-30 GB
- **Security Group**: 
  - SSH (22) - My IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
- **Key Pair**: Oluştur ve indir (`hancer-key.pem`)

### 2️⃣ EC2'ye Bağlan ve Projeyi Kur

```bash
# Lokal bilgisayarınızdan
chmod 400 hancer-key.pem
ssh -i hancer-key.pem ubuntu@YOUR_EC2_IP

# EC2'de
cd /home/ubuntu
git clone https://github.com/selimttasdemir/dhavtr.git
cd dhavtr/backend

# Otomatik kurulum script'ini çalıştır
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

**O kadar! 🎉** Backend artık çalışıyor.

### 3️⃣ Kontrol Et

```bash
# Backend çalışıyor mu?
docker ps

# Logları görüntüle
docker logs -f hancer-backend

# Tarayıcıda test et
http://YOUR_EC2_IP:8000
http://YOUR_EC2_IP:8000/docs
```

---

## 🔄 Güncelleme (Kod Değişikliklerinden Sonra)

```bash
# EC2'ye bağlan
ssh -i hancer-key.pem ubuntu@YOUR_EC2_IP

# Backend klasörüne git
cd /home/ubuntu/dhavtr/backend

# Güncelleme script'ini çalıştır
./update-ec2.sh
```

---

## 📋 Docker Compose ile Alternatif

```bash
# Başlat
docker-compose up -d

# Durdur
docker-compose down

# Güncelle ve yeniden başlat
docker-compose up -d --build

# Loglar
docker-compose logs -f
```

---

## 🌐 Domain Bağlama (Opsiyonel)

### 1. Domain DNS Ayarları
Domain sağlayıcınızda:
- **A Record**: `@` → `YOUR_EC2_IP`
- **A Record**: `www` → `YOUR_EC2_IP`

### 2. SSL Sertifikası (HTTPS)
```bash
# EC2'de
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🛠️ Yararlı Komutlar

```bash
# Container durumu
docker ps

# Real-time loglar
docker logs -f hancer-backend

# Container'ı yeniden başlat
docker restart hancer-backend

# Container içine gir
docker exec -it hancer-backend /bin/bash

# Disk temizliği
docker system prune -a

# Sistem kaynakları
docker stats hancer-backend

# Nginx restart
sudo systemctl restart nginx

# Nginx logları
sudo tail -f /var/log/nginx/error.log
```

---

## 🆘 Sorun Giderme

### Container çalışmıyor:
```bash
docker logs hancer-backend
docker inspect hancer-backend
```

### Port 8000 zaten kullanılıyor:
```bash
sudo lsof -i :8000
sudo kill -9 PID
```

### Yeniden kurulum:
```bash
docker stop hancer-backend
docker rm hancer-backend
docker rmi hancer-backend
./deploy-ec2.sh
```

---

## 📞 Test URL'leri

- **Health Check**: `http://YOUR_EC2_IP:8000/`
- **API Docs**: `http://YOUR_EC2_IP:8000/docs`
- **API Routes**: `http://YOUR_EC2_IP:8000/api/...`

---

## 🔒 Güvenlik Kontrol Listesi

- [x] SSH key güvenli bir yerde
- [x] Security Group sadece gerekli portları açık
- [x] SSH sadece kendi IP'nden erişilebilir
- [x] `.env` dosyası Git'e commit edilmemiş
- [x] SSL sertifikası yüklenmiş (domain varsa)
- [x] Düzenli backup alınıyor

---

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için: `AWS_EC2_DEPLOY.md`
