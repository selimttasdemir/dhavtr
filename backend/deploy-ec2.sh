#!/bin/bash

# AWS EC2'de Docker ile Deployment Script
# Bu script'i EC2 instance'ınızda çalıştırın

set -e  # Hata olursa dur

echo "🚀 Hançer Backend EC2 Deployment Script"
echo "========================================"

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Root kontrolü
if [ "$EUID" -eq 0 ]; then 
    print_error "Bu script'i root olarak çalıştırmayın!"
    exit 1
fi

# 1. Sistem Güncellemeleri
print_info "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y
print_success "Sistem güncellendi"

# 2. Docker Kurulumu (eğer kurulu değilse)
if ! command -v docker &> /dev/null; then
    print_info "Docker kuruluyor..."
    sudo apt install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    print_success "Docker kuruldu"
else
    print_success "Docker zaten kurulu"
fi

# 3. Docker Compose Kurulumu (eğer kurulu değilse)
if ! command -v docker-compose &> /dev/null; then
    print_info "Docker Compose kuruluyor..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose kuruldu"
else
    print_success "Docker Compose zaten kurulu"
fi

# 4. Git Kurulumu (eğer kurulu değilse)
if ! command -v git &> /dev/null; then
    print_info "Git kuruluyor..."
    sudo apt install -y git
    print_success "Git kuruldu"
else
    print_success "Git zaten kurulu"
fi

# 5. Nginx Kurulumu (eğer kurulu değilse)
if ! command -v nginx &> /dev/null; then
    print_info "Nginx kuruluyor..."
    sudo apt install -y nginx
    print_success "Nginx kuruldu"
else
    print_success "Nginx zaten kurulu"
fi

# 6. Proje dizinine git veya oluştur
PROJECT_DIR="/home/$USER/dhavtr/backend"
if [ ! -d "$PROJECT_DIR" ]; then
    print_info "Proje dizini oluşturuluyor..."
    mkdir -p "$(dirname "$PROJECT_DIR")"
    print_success "Proje dizini oluşturuldu: $PROJECT_DIR"
else
    print_success "Proje dizini mevcut"
fi

cd "$PROJECT_DIR"

# 7. Environment dosyasını kontrol et
if [ ! -f .env ]; then
    print_info ".env dosyası oluşturuluyor..."
    cat > .env << EOF
ENVIRONMENT=production
PORT=8000
DATABASE_URL=sqlite:///./hancer_law.db
EOF
    print_success ".env dosyası oluşturuldu"
else
    print_success ".env dosyası mevcut"
fi

# 8. Uploads dizinini oluştur
if [ ! -d "uploads" ]; then
    print_info "Uploads dizini oluşturuluyor..."
    mkdir -p uploads
    chmod 755 uploads
    print_success "Uploads dizini oluşturuldu"
else
    print_success "Uploads dizini mevcut"
fi

# 9. Eski container'ı durdur ve sil (varsa)
if docker ps -a | grep -q hancer-backend; then
    print_info "Eski container durduruluyor ve siliniyor..."
    docker stop hancer-backend || true
    docker rm hancer-backend || true
    print_success "Eski container temizlendi"
fi

# 10. Docker image build et
print_info "Docker image build ediliyor... (Bu biraz zaman alabilir)"
docker build -t hancer-backend .
print_success "Docker image hazır"

# 11. Container'ı çalıştır
print_info "Container başlatılıyor..."
docker run -d \
  --name hancer-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -v "$(pwd)/uploads:/app/uploads" \
  -v "$(pwd)/hancer_law.db:/app/hancer_law.db" \
  --env-file .env \
  hancer-backend

print_success "Container başlatıldı"

# 12. Container durumunu kontrol et
sleep 5
if docker ps | grep -q hancer-backend; then
    print_success "Container çalışıyor!"
    
    # Container bilgilerini göster
    echo ""
    echo "📊 Container Bilgileri:"
    echo "======================"
    docker ps | grep hancer-backend
    
    # IP adresini al
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "IP alınamadı")
    
    echo ""
    print_success "Deployment başarılı!"
    echo ""
    echo "🌐 Backend URL: http://$PUBLIC_IP:8000"
    echo "📖 API Docs: http://$PUBLIC_IP:8000/docs"
    echo ""
    echo "📝 Logları görmek için: docker logs -f hancer-backend"
    echo "🔄 Container'ı yeniden başlatmak için: docker restart hancer-backend"
    echo "🛑 Container'ı durdurmak için: docker stop hancer-backend"
    
else
    print_error "Container başlatılamadı!"
    echo ""
    echo "Logları kontrol edin:"
    docker logs hancer-backend
    exit 1
fi

# 13. Nginx config (opsiyonel)
echo ""
read -p "Nginx reverse proxy kurmak ister misiniz? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Nginx config oluşturuluyor..."
    
    sudo tee /etc/nginx/sites-available/hancer-backend > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

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

    location /uploads/ {
        proxy_pass http://localhost:8000/uploads/;
        proxy_set_header Host $host;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/hancer-backend /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    if sudo nginx -t; then
        sudo systemctl restart nginx
        print_success "Nginx yapılandırıldı ve başlatıldı"
        echo ""
        echo "🌐 Backend artık 80 portunda da erişilebilir: http://$PUBLIC_IP"
    else
        print_error "Nginx config hatası! Manuel kontrol gerekli."
    fi
fi

echo ""
print_success "Kurulum tamamlandı! 🎉"
