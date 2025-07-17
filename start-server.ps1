# Web Console Test Server
# Dieses Script startet einen lokalen HTTP-Server zum Testen

Write-Host "🚀 Web Console Test Server" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Prüfe ob Build vorhanden ist
if (-not (Test-Path "dist")) {
    Write-Host "❌ Dist-Ordner nicht gefunden. Build wird erstellt..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build fehlgeschlagen!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dist-Ordner gefunden" -ForegroundColor Green
}

# Versuche Python HTTP-Server zu starten
Write-Host "🌐 Starte HTTP-Server..." -ForegroundColor Cyan

$port = 8000

# Prüfe ob Python verfügbar ist
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python") {
        Write-Host "✅ Python gefunden: $pythonVersion" -ForegroundColor Green
        Write-Host "🌐 Server läuft auf: http://localhost:$port" -ForegroundColor Yellow
        Write-Host "📄 Test-Seite: http://localhost:$port/test.html" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray
        python -m http.server $port
    }
} catch {
    Write-Host "⚠️ Python nicht gefunden. Versuche Node.js..." -ForegroundColor Yellow

    try {
        # Versuche npx http-server
        Write-Host "🌐 Server läuft auf: http://localhost:$port" -ForegroundColor Yellow
        Write-Host "📄 Test-Seite: http://localhost:$port/test.html" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray
        npx http-server . -p $port
    } catch {
        Write-Host "❌ Weder Python noch http-server verfügbar!" -ForegroundColor Red
        Write-Host "💡 Lösungen:" -ForegroundColor Yellow
        Write-Host "   1. Python installieren: https://python.org" -ForegroundColor Gray
        Write-Host "   2. Oder: npm install -g http-server" -ForegroundColor Gray
        Write-Host "   3. Oder: VS Code Live Server Extension verwenden" -ForegroundColor Gray
        exit 1
    }
}
