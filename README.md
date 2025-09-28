# DH Hukuk Bürosu - Av. Deniz Hançer Özay

Modern, çok dilli hukuk bürosu web sitesi. FastAPI backend ve React frontend ile geliştirilmiştir.

## 🚀 Özellikler

- **Çok Dilli Destek**: Türkçe, İngilizce, Almanca, Rusça
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Admin Panel**: İçerik yönetimi, blog yazıları, mesajlar
- **İletişim Formu**: Hukuki danışmanlık talep sistemi
- **Blog Sistemi**: Çok dilli blog yazıları
- **Logo Yönetimi**: Admin panelinden logo seçimi

## 🛠️ Teknolojiler

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM ve veritabanı yönetimi
- **SQLite**: Veritabanı (production'da PostgreSQL'e geçilebilir)
- **Pydantic**: Veri validasyonu
- **CORS**: Cross-origin resource sharing

### Frontend
- **React**: Modern JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI komponenten kütüphanesi
- **Axios**: HTTP client
- **React Router**: Sayfa yönlendirme

## 📦 Deployment

### Render.com Üzerinde Deployment

Bu proje Render.com üzerinde tek bir repository'den hem backend hem frontend olarak deploy edilebilir.

#### Adımlar:

1. **GitHub'a Push Edin**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Render.com'a Giriş Yapın**:
   - https://render.com adresine gidin
   - GitHub hesabınızla giriş yapın

3. **Blueprint Deploy Edin**:
   - "New" > "Blueprint" seçin
   - GitHub repository'nizi seçin
   - `render.yaml` dosyası otomatik algılanacak
   - Deploy butonuna basın

4. **Environment Variables Kontrol Edin**:
   - Backend service için `PORT`, `CORS_ORIGINS` ayarlarını kontrol edin
   - Frontend için `REACT_APP_BACKEND_URL` ayarını kontrol edin

#### URL'ler:
- **Backend API**: `https://dhavtr-backend.onrender.com`
- **Frontend**: `https://dhavtr-frontend.onrender.com`

### Lokal Development

#### Backend Başlatma:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

#### Frontend Başlatma:
```bash
cd frontend
npm install
npm start
```

## 🔐 Admin Panel

Admin paneline erişim: `/admin`

İlk kurulum için admin hesabı oluşturmanız gerekecek.

## 📱 Özellikler

### Çok Dilli İçerik Yönetimi
- Hero bölümü başlık/açıklama
- Hakkımızda bilgileri
- Blog yazıları
- Tüm içerikler 4 dilde yönetilebilir

### Logo Yönetimi
- Uploads klasöründeki logolardan seçim
- Manuel URL girme
- Yeni logo yükleme
- Tarayıcı favicon otomatik güncelleme

### İletişim Sistemi
- Detaylı iletişim formu
- Hukuki alan seçimi
- Aciliyet seviyesi
- Admin panelinden mesaj yönetimi

### Blog Sistemi
- Çok dilli blog yazıları
- Yayın durumu kontrolü
- Slug bazlı URL'ler
- Admin panelinden tam kontrol

## 🔧 Konfigürasyon

### Environment Variables

#### Backend (.env):
```
PORT=8001
HOST=127.0.0.1
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///./hancer_law.db
```

#### Frontend (.env):
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👥 İletişim

- **Web**: https://hancer.av.tr
- **Email**: deniz@hancer.av.tr
- **Admin Panel**: https://hancer.av.tr/admin