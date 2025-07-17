@echo off
echo 🚀 Web Console Test Server
echo =========================

REM Prüfe ob dist Ordner existiert
if not exist "dist" (
    echo ❌ Dist-Ordner nicht gefunden. Build wird erstellt...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build fehlgeschlagen!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dist-Ordner gefunden
)

echo 🌐 Starte HTTP-Server...

REM Versuche Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python gefunden
    echo 🌐 Server läuft auf: http://localhost:8000
    echo 📄 Test-Seite: http://localhost:8000/test.html
    echo.
    echo Press Ctrl+C to stop server
    python -m http.server 8000
) else (
    echo ⚠️ Python nicht gefunden. Versuche Node.js...
    npx http-server . -p 8000
    if errorlevel 1 (
        echo ❌ Weder Python noch http-server verfügbar!
        echo 💡 Lösungen:
        echo    1. Python installieren: https://python.org
        echo    2. Oder: npm install -g http-server
        echo    3. Oder: VS Code Live Server Extension verwenden
        pause
        exit /b 1
    )
)
