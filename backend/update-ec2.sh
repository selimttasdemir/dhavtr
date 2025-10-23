#!/bin/bash

# Backend Güncelleme Script'i
# Değişiklikleri çekip container'ı yeniden başlatır

set -e

echo "🔄 Backend Güncelleme Script'i"
echo "=============================="

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Proje dizinine git
PROJECT_DIR="/home/$USER/dhavtr/backend"
cd "$PROJECT_DIR" || exit 1

print_info "Proje dizini: $PROJECT_DIR"

# Git güncellemelerini çek
print_info "Git'ten son değişiklikler çekiliyor..."
git pull
print_success "Değişiklikler çekildi"

# Container'ı durdur
print_info "Container durduruluyor..."
docker stop hancer-backend || true
docker rm hancer-backend || true
print_success "Container durduruldu"

# Eski image'ları temizle (opsiyonel)
print_info "Eski Docker image'ları temizleniyor..."
docker image prune -f
print_success "Temizlik yapıldı"

# Yeni image build et
print_info "Yeni Docker image build ediliyor..."
docker build -t hancer-backend .
print_success "Image hazır"

# Container'ı yeniden başlat
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

# Durumu kontrol et
sleep 5
if docker ps | grep -q hancer-backend; then
    print_success "Güncelleme başarılı! ✅"
    echo ""
    echo "📊 Container durumu:"
    docker ps | grep hancer-backend
    echo ""
    echo "📝 Logları görmek için: docker logs -f hancer-backend"
else
    print_error "Container başlatılamadı!"
    echo "Logları kontrol edin:"
    docker logs hancer-backend
    exit 1
fi
