@echo off
REM Bu dosya FastAPI uygulamanızı Windows'ta başlatır

echo FastAPI Uygulamasi Baslatiliyor...
echo.

REM Mevcut dizini backend klasörü olarak ayarla
cd /d "%~dp0"

REM Logs klasörü yoksa oluştur
if not exist "logs" mkdir logs

REM Virtual environment'ı aktif et
echo Virtual environment aktif ediliyor...
call .venv\Scripts\activate.bat

REM Eğer virtual environment aktif olmadıysa uyarı ver
if %ERRORLEVEL% neq 0 (
    echo HATA: Virtual environment aktif edilemedi!
    echo Lutfen once 'python -m venv .venv' komutunu calistirin
    echo ve 'pip install -r requirements.txt' ile paketleri kurun
    pause
    exit /b 1
)

echo.
echo Uygulama baslatiliyor: http://127.0.0.1:8000
echo Durdurmak icin Ctrl+C basin
echo.

REM Uvicorn ile FastAPI uygulamasını başlat ve logları kaydet
.\.venv\Scripts\python -m uvicorn server:app --host 127.0.0.1 --port 8000 --log-level info 2>&1 | tee logs\uvicorn.log

echo.
echo Uygulama durduruldu.
pause