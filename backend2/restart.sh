#!/bin/bash

# PHP Backend Restart Script
# Bu script mevcut sunucuları durdurup yeni sunucu başlatır

echo "=== PHP Backend Restart Script ==="
echo ""

# Mevcut PHP server'ları durdur
echo "1. Mevcut PHP server'ları durduruluyor..."
pkill -f "php -S"
sleep 2

# Port kontrolü
echo "2. Port 8000 kontrolü..."
if lsof -i :8000 > /dev/null 2>&1; then
    echo "   Port 8000 hala kullanımda, process'i zorla durduruluyor..."
    PID=$(lsof -t -i :8000)
    kill -9 $PID 2>/dev/null
    sleep 1
else
    echo "   Port 8000 boş"
fi

# .env dosyasından HOST ve PORT değerlerini oku
if [ -f ".env" ]; then
    HOST=$(grep "^HOST=" .env | cut -d'=' -f2)
    PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
else
    HOST="127.0.0.1"
    PORT="8000"
fi

echo "3. Sunucu başlatılıyor..."
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   URL: http://$HOST:$PORT"
echo ""

# Backend klasörüne git
cd "$(dirname "$0")"

# Sunucuyu başlat
echo "PHP Backend sunucusu başlatılıyor..."
echo "Durdurmak için Ctrl+C tuşlayın"
echo ""

php -S $HOST:$PORT index.php

echo ""
echo "Sunucu durduruldu."