# 🚀 WebConsole

Eine modulare, vollständig im Browser laufende Konsolen-Bibliothek für moderne Web-Anwendungen.

## ✨ Features

- 🖥️ **Browser-basierte Konsole** - Keine Server-Abhängigkeiten
- 🔧 **Modulare Architektur** - Kernel, VFS, StateManager, Parser
- 📁 **Virtuelles Dateisystem** - POSIX-ähnliche Operationen mit localStorage-Backend
- 🎨 **Flexibles Theme-System** - CSS Custom Properties mit Hot-Reload
- ⚡ **Framework-Agnostisch** - Native Web Components, React, Angular, Vue, Svelte
- 📦 **Tree-Shaking freundlich** - Minimale Bundle-Größe
- � **Sicherheit** - Sandbox-Umgebung, CSP-kompatibel
- 📚 **TypeScript** - Vollständige Type-Unterstützung

## 🚀 Quick Start

### 1. Build erstellen

```bash
npm install
npm run build
```

### 2. Test mit Storybook (Empfohlen)

```bash
npm run storybook  # Startet auf http://localhost:6006
```

**Storybook bietet:**

- 🎮 Interactive Demos mit Test-Buttons
- 🔧 Core-System Tests (Kernel, VFS, StateManager)
- 📱 Component Tests in verschiedenen Konfigurationen
- 📚 Live-Dokumentation mit Code-Beispielen

### 3. Web Component verwenden

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="./dist/components/WebConsoleElement.js"></script>
  </head>
  <body>
    <web-console prompt="$ " height="300px"></web-console>
  </body>
</html>
```

## 🎯 API-Verwendung

### JavaScript API

```javascript
import { Kernel } from './dist/index.js';

// Kernel starten
await Kernel.getInstance().start();

// Console erstellen
const console = await Kernel.getInstance().createConsole('main');

// Befehl ausführen
const result = await console.execute('echo Hello World!');
console.log(result.output);
```

## 🚀 Vision

Web-Console ermöglicht es Entwicklern, in Sekundenschnelle eine Windows-Terminal-ähnliche Console in jede Web-Anwendung zu integrieren – **ohne Backend, ohne Build-Schritte, ohne externe Abhängigkeiten**.

## ✨ Features

- 🔧 **Modulare Architektur** - Kernel, VFS, StateManager, Parser
- 🗂️ **Virtuelles Dateisystem** - POSIX-ähnlich mit localStorage-Backend
- 🎨 **Flexibles Theme-System** - CSS-Custom-Properties, Hot-Reload
- ⚡ **Framework-agnostisch** - Angular, React, Vue, Svelte, Web Components
- 🔒 **Sicherheit** - Sandbox, CSP-kompatibel, keine eval()-Nutzung
- 📦 **Tree-Shaking** - Minimale Bundle-Größe durch modularen Aufbau

## 🏗️ Architektur

### Core-Module

| Modul            | Verantwortung                              | Singleton | Persistenz |
| ---------------- | ------------------------------------------ | --------- | ---------- |
| **Kernel**       | Zentrale Event- und Lebenszyklus-Steuerung | ✅        | ❌         |
| **VFS**          | Virtuelles Dateisystem                     | ✅        | ✅         |
| **Console**      | Parser, Lexer, Executor                    | ❌        | ❌         |
| **ThemeManager** | Design-System, CSS-Tokens                  | ✅        | ✅         |
| **StateManager** | Hierarchische State-Verwaltung             | ❌        | Optional   |

### Verzeichnis-Struktur

```bash
src/
├── types/          # Globale TypeScript-Typen
├── enums/          # Globale Enums
├── interfaces/     # Globale Interfaces
├── core/           # Kern-Module (Kernel, VFS, StateManager)
├── console/        # Parser, Lexer, Built-ins
├── components/     # Framework-Adapter
├── themes/         # Vordefinierte Themes
└── utils/          # Hilfsfunktionen
```

## 🛠️ Installation

```bash
npm install web-console
```

### Framework-spezifische Pakete

```bash
# React
npm install web-console react

# Angular
npm install web-console @angular/core

# Vue
npm install web-console vue

# Svelte
npm install web-console svelte
```

## 📦 Quick Start

### Native Web Components

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import { WebConsole } from 'web-console';

      const console = new WebConsole({
        theme: 'windows-terminal',
        workingDirectory: '/home/user',
      });

      document.body.appendChild(console.element);
    </script>
  </head>
  <body>
    <web-console theme="windows-terminal"></web-console>
  </body>
</html>
```

### React

```tsx
import { WebConsole } from 'web-console/react';

function App() {
  return (
    <WebConsole
      theme="monokai"
      workingDirectory="/home/user"
      onCommand={(cmd) => console.log('Command:', cmd)}
    />
  );
}
```

### Angular

```typescript
// app.module.ts
import { WebConsoleModule } from 'web-console/angular';

@NgModule({
  imports: [WebConsoleModule],
  // ...
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<web-console
  theme="solarized"
  [workingDirectory]="'/home/user'"
  (command)="onCommand($event)"
>
</web-console>
```

## 🎨 Themes

### Vordefinierte Themes

- `windows-terminal` - Windows Terminal Design
- `monokai` - Dunkles Theme mit Syntax-Highlighting
- `solarized` - Beliebtes Designer-Theme

### Custom Themes

```typescript
import { ThemeManager } from 'web-console';

const customTheme = {
  name: 'my-theme',
  mode: 'dark',
  tokens: {
    '--console-bg': '#1a1a1a',
    '--console-fg': '#ffffff',
    '--console-accent': '#00ff00',
  },
};

ThemeManager.register(customTheme);
```

## 🗂️ Virtual File System

```typescript
import { VFS } from 'web-console';

// Datei schreiben
await VFS.writeFile('/home/user/test.txt', 'Hello World!');

// Datei lesen
const content = await VFS.readFile('/home/user/test.txt');

// Verzeichnis erstellen
await VFS.createDir('/home/user/projects');

// Dateien auflisten mit Glob
const jsFiles = await VFS.glob('**/*.js');
```

## ⚡ Built-in Commands

| Befehl   | Beschreibung                          |
| -------- | ------------------------------------- |
| `ls`     | Verzeichnis-Inhalt mit Farbcodes      |
| `cat`    | Datei-Ausgabe mit Syntax-Highlighting |
| `cd`     | Arbeitsverzeichnis wechseln           |
| `export` | Umgebungsvariablen setzen             |
| `theme`  | Theme zur Laufzeit ändern             |
| `alias`  | Kommando-Verknüpfungen                |

### Eigene Commands registrieren

```typescript
import { CommandRegistry } from 'web-console';

CommandRegistry.register({
  name: 'hello',
  description: 'Greet the user',
  async execute(context) {
    const name = context.args[0] || 'World';
    context.stdout.write(`Hello, ${name}!\n`);
    return ExitCode.SUCCESS;
  },
});
```

## 🔧 API Reference

### Kernel

```typescript
import { Kernel } from 'web-console';

// Kernel starten
await Kernel.start();

// Console erstellen
const console = await Kernel.createConsole({
  workingDirectory: '/home/user',
  prompt: '$ ',
});

// Befehl ausführen
const result = await console.execute('ls -la');
```

### State Management

```typescript
import { StateManager } from 'web-console';

const state = new StateManager('myApp');

// Persistente Konfiguration
state.configure({
  key: 'userPrefs',
  defaultValue: { theme: 'dark' },
  persistence: PersistenceMode.PERSISTENT,
});

// Werte setzen/abrufen
state.set('userPrefs', { theme: 'light' });
const prefs = state.get('userPrefs');
```

## 🚀 Entwicklung

### Setup

```bash
# Repository klonen
git clone https://github.com/your-org/web-console.git
cd web-console

# Dependencies installieren
npm install

# Build
npm run build

# Tests
npm test

# Development Server
npm run dev
```

### TypeScript-Konfiguration

Das Projekt nutzt strenge TypeScript-Einstellungen für maximale Typsicherheit:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`

## 📋 Roadmap

- [x] ✅ Core-Architektur (Kernel, VFS, StateManager)
- [x] ✅ Command-Parser mit Lexer
- [ ] 🔄 Built-in Commands implementieren
- [ ] 🔄 Theme-System finalisieren
- [ ] 🔄 Framework-Adapter (React, Angular, Vue, Svelte)
- [ ] 🔄 Plugin-System
- [ ] 🔄 WebWorker-Integration für Security
- [ ] 🔄 Comprehensive Tests

## 🤝 Contributing

Beiträge sind willkommen! Bitte lesen Sie unsere [Contributing Guidelines](CONTRIBUTING.md).

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Committen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🙏 Acknowledgments

- Inspiriert von Windows Terminal, VS Code Terminal und Bash
- TypeScript für excellente Developer Experience
- Web Standards für maximale Kompatibilität

---

**_Made with ❤️ für die Developer Community_**
