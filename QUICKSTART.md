# Web Console - Start Guide

## 🧪 Storybook Test Suite (Empfohlen)

**Der beste Weg zum Testen:**

```powershell
npm run build       # Build erstellen
npm run storybook   # Storybook starten
```

**URL:** http://localhost:6006

### 🎯 Was bietet Storybook?

- **Interactive Demos** - Vollständige Console mit Test-Buttons
- **Component Tests** - Web Components in verschiedenen Konfigurationen
- **Core-System Tests** - Kernel, VFS, StateManager einzeln testbar
- **Live-Dokumentation** - Integrierte Docs mit Code-Beispielen

## 🔧 Lokales HTML-Testing (Alternative)

1. **Build erstellen:**

   ```powershell
   npm run build
   ```

2. **HTTP-Server starten:**

   ```powershell
   # Option 1: Python (falls installiert)
   python -m http.server 8000

   # Option 2: Node.js http-server
   npx http-server .

   # Option 3: VS Code Live Server Extension
   # Rechtsklick auf test.html -> "Open with Live Server"
   ```

3. **Test-Seite öffnen:**
   ```
   http://localhost:8000/test.html
   ```

## Verfügbare Test-Befehle

- `echo [text]` - Text ausgeben
- `help` - Hilfe anzeigen
- `clear` - Console leeren
- `test` - System-Test

## Status

✅ Core-System (Kernel, VFS, StateManager)
✅ Native Web Component
✅ TypeScript Build
✅ **Storybook Test Suite**
⚠️ Command Parser (vereinfacht)
❌ Built-in Commands
❌ Theme System
