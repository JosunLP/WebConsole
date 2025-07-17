# 🖥️ WebConsole

> Eine modulare, vollständig im Browser laufende Konsolen-Bibliothek für moderne Web-Anwendungen

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&style=for-the-badge)](https://vitejs.dev/)
![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-green?style=for-the-badge)

## 🌟 Highlights

**WebConsole** erlaubt es Entwicklern, in Sekundenschnelle eine Windows-Terminal-ähnliche Console in jede Web-Anwendung zu integrieren – **ohne Backend, ohne Build-Schritte, ohne externe Abhängigkeiten**.

### ✨ Kern-Features

- 🖥️ **Browser-Native** - Vollständig clientseitig, keine Server-Abhängigkeiten
- 🏗️ **Modulare Architektur** - Kernel, VFS, StateManager, Parser, ThemeManager
- 📁 **Virtuelles Dateisystem** - POSIX-ähnliche Operationen mit localStorage-Backend
- 🎨 **Flexibles Theme-System** - CSS Custom Properties, Design-Tokens, Hot-Reload
- ⚡ **Framework-Agnostisch** - Native Web Components + React, Angular, Vue, Svelte Adapter
- 📦 **Tree-Shaking Ready** - Minimale Bundle-Größe durch modularen Aufbau
- 🔒 **Sicherheit** - Sandbox-Umgebung, CSP-kompatibel, kein `eval()`
- 📚 **Full TypeScript** - Vollständige Type-Unterstützung mit strikten Einstellungen
- 🧩 **Plugin-System** - Erweiterbare Kommando-Registrierung
- 💾 **State-Persistierung** - Hierarchisches State-Management mit localStorage/sessionStorage

## 🚀 Quick Start

### Option 1: Storybook Demo (Empfohlen für Evaluation)

```bash
npm install
npm run storybook  # Startet auf http://localhost:6006
```

**Storybook bietet:**

- 🎮 **Interactive Demos** - Live-Tests aller Features und Komponenten
- 🔧 **Core-System Tests** - Kernel, VFS, StateManager, CommandRegistry Tests
- 📱 **Framework Examples** - React, Angular, Vue, Svelte Live-Beispiele
- 📚 **Live-Dokumentation** - API-Referenz mit Code-Snippets

### Option 2: Native Web Component

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="./dist/components/WebConsoleElement.js"></script>
  </head>
  <body>
    <web-console
      prompt="user@webconsole:~$ "
      theme="windows-terminal"
      height="400px"
    >
    </web-console>
  </body>
</html>
```

### Option 3: JavaScript API

```javascript
import { kernel } from "web-console";

// Kernel starten
await kernel.start();

// Console erstellen
const console = await kernel.createConsole({
  id: "main",
  workingDirectory: "/home/user",
  prompt: "$ ",
});

// Befehl ausführen
const result = await console.execute("ls -la");
console.log(result.stdout);
```

## 🏗️ Architektur & Implementierungsstand

### Core-Module (✅ Implementiert)

| Modul                  | Status    | Verantwortung                              | Features                                    |
| ---------------------- | --------- | ------------------------------------------ | ------------------------------------------- |
| **🧠 Kernel**          | ✅ Fertig | Zentrale Event- und Lebenszyklus-Steuerung | Singleton, Event-System, Console-Management |
| **� VFS**              | ✅ Fertig | Virtuelles Dateisystem mit localStorage    | POSIX-like, Inode-System, Mount-Points      |
| **🎨 ThemeManager**    | ✅ Fertig | Design-System mit CSS Custom Properties    | Hot-Reload, Token-System, Built-in Themes   |
| **📊 StateManager**    | ✅ Fertig | Hierarchische State-Verwaltung             | Persistenz-Modi, Event-driven Updates       |
| **🔧 CommandRegistry** | ✅ Fertig | Command-Registrierung und -Verwaltung      | Plugin-System, Aliase, Built-ins            |
| **⚙️ Parser/Lexer**    | ⚠️ Basis  | Shell-Syntax Parsing (bash-ähnlich)        | Grundbefehle ✅, Pipes/Redirects 🔄         |

### Built-in Commands (Aktueller Stand)

| Command   | Status | Beschreibung           | Features                         |
| --------- | ------ | ---------------------- | -------------------------------- |
| `help`    | ✅     | Hilfe-System           | Interaktive Befehlsreferenz      |
| `clear`   | ✅     | Terminal leeren        | ANSI Escape Sequences            |
| `echo`    | ✅     | Text ausgeben          | Variable-Substitution            |
| `test`    | ✅     | System-Tests           | Core-Module Validierung          |
| `cat`     | 🔄     | Datei-Inhalt anzeigen  | Basic ✅, Syntax-Highlighting 🔄 |
| `ls`      | 🔄     | Verzeichnis-Listing    | Basic ✅, Farben/Icons 🔄        |
| `cd`      | 🔄     | Verzeichnis wechseln   | Basic ✅, Tab-Completion 🔄      |
| `pwd`     | 🔄     | Aktueller Pfad         | Basic ✅                         |
| `mkdir`   | 🔄     | Verzeichnis erstellen  | Basic ✅, Recursive-Flag 🔄      |
| `rm`      | 🔄     | Dateien/Ordner löschen | Basic ✅, Sicherheits-Prompts 🔄 |
| `cp`      | 🔄     | Kopieren               | Implementierung läuft            |
| `mv`      | 🔄     | Verschieben/Umbenennen | Implementierung läuft            |
| `alias`   | 🔄     | Command-Aliase         | Basis-Funktionalität             |
| `export`  | 🔄     | Umgebungsvariablen     | Implementierung läuft            |
| `env`     | 🔄     | Environment anzeigen   | Implementierung läuft            |
| `date`    | 🔄     | Datum/Zeit             | Implementierung läuft            |
| `history` | 🔄     | Befehlshistorie        | Implementierung läuft            |
| `theme`   | 🔄     | Theme-Wechsel          | Implementierung läuft            |
| `which`   | 🔄     | Command-Pfad finden    | Implementierung läuft            |
| `unset`   | 🔄     | Variablen löschen      | Implementierung läuft            |

### Framework-Integration

| Framework                 | Status | Package               | Features                      |
| ------------------------- | ------ | --------------------- | ----------------------------- |
| **Native Web Components** | ✅     | `<web-console>`       | Vollständig implementiert     |
| **React**                 | ⚠️     | `web-console/react`   | Basis ✅, JSX-Build Issues 🔄 |
| **Angular**               | 📋     | `web-console/angular` | Geplant, Stubs vorhanden      |
| **Vue**                   | 📋     | `web-console/vue`     | Geplant, Stubs vorhanden      |
| **Svelte**                | 📋     | `web-console/svelte`  | Geplant, Stubs vorhanden      |

### Advanced Features (Roadmap)

- **Shell Features**: Pipes `|`, Redirections `>`, `>>`, `<`, Variable-Substitution `$VAR`
- **Theme-System**: Hot-Reload, Custom CSS-Injection, Animation-Support
- **Security**: WebWorker-Sandbox, Command-Permissions, CSP-Headers
- **Performance**: Virtual-Scrolling, Command-Caching, Lazy-Loading
- **Testing**: Unit-Tests (Vitest), E2E-Tests, Performance-Benchmarks

## 📦 Installation & Framework-Integration

### NPM Installation

```bash
# Core-Bibliothek
npm install web-console

# Framework-spezifische Pakete (in Entwicklung)
npm install web-console @angular/core  # Angular
npm install web-console react          # React
npm install web-console vue            # Vue
npm install web-console svelte         # Svelte
```

### Framework-Beispiele

#### Native Web Components

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import "./dist/components/WebConsoleElement.js";
    </script>
  </head>
  <body>
    <web-console
      theme="windows-terminal"
      prompt="user@localhost:~$ "
      height="400px"
    >
    </web-console>
  </body>
</html>
```

#### React (in Entwicklung)

```tsx
import { WebConsole } from "web-console/react";

function App() {
  const handleCommand = (command: string, result: CommandResult) => {
    console.log("Command executed:", command, result);
  };

  return (
    <WebConsole
      theme="monokai"
      workingDirectory="/home/user"
      onCommand={handleCommand}
      onReady={(console) => {
        console.executeCommand('echo "React WebConsole ready!"');
      }}
    />
  );
}
```

#### Angular (geplant)

```typescript
// app.module.ts
import { WebConsoleModule } from "web-console/angular";

@NgModule({
  imports: [WebConsoleModule],
  // ...
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<web-console
  theme="solarized-dark"
  [workingDirectory]="'/home/user'"
  (command)="onCommand($event)"
  (ready)="onReady($event)"
>
</web-console>
```

## 🎨 Themes & Design-System

### Built-in Themes

| Theme              | Beschreibung                      | Preview                                 |
| ------------------ | --------------------------------- | --------------------------------------- |
| `windows-terminal` | 🪟 Windows Terminal Look & Feel   | Dark, modern, Microsoft-inspired        |
| `monokai`          | 🌃 Klassisches Sublime Text Theme | Dunkles Theme mit Syntax-Highlighting   |
| `solarized-dark`   | 🌅 Beliebtes Designer-Theme       | Wissenschaftlich optimierte Farbpalette |
| `light`            | ☀️ Helles Standard-Theme          | Clean, minimal, tageslicht-tauglich     |
| `default`          | 🎯 System-Standard                | Adaptive Farben, System-Preferences     |

### Custom Theme API

```typescript
import { ThemeManager } from "web-console";

const customTheme = {
  name: "cyberpunk-2077",
  mode: "dark",
  tokens: {
    "--console-bg": "#0a0a0a",
    "--console-fg": "#00ff41",
    "--console-accent": "#ff0080",
    "--console-border": "#333",
    "--font-family": "JetBrains Mono, monospace",
  },
};

// Theme registrieren
ThemeManager.register(customTheme);

// Theme aktivieren
await ThemeManager.setTheme("cyberpunk-2077");

// Hot-Reload während Entwicklung
ThemeManager.injectCSS();
```

## 🗂️ Virtual File System (VFS)

### POSIX-ähnliche API

```typescript
import { VFS } from "web-console";

// Dateien schreiben/lesen
await VFS.writeFile(
  "/home/user/projects/app.js",
  'console.log("Hello World!");',
);
const content = await VFS.readFile("/home/user/projects/app.js");

// Verzeichnisse erstellen
await VFS.createDir("/home/user/documents", { recursive: true });

// Dateien/Ordner auflisten
const entries = await VFS.readDir("/home/user");
console.log(entries); // [{ name: 'projects', type: 'directory' }, ...]

// Glob-Pattern Support
const jsFiles = await VFS.glob("**/*.js");
const configFiles = await VFS.glob("**/config.{json,yaml,yml}");

// Permissions & Metadata
await VFS.chmod("/home/user/script.sh", 0o755); // Executable
const stats = await VFS.stat("/home/user/script.sh");
console.log(stats.permissions); // 0o755
```

### Mount-Points & Provider

```typescript
// External Provider mounten
await VFS.mount(
  "/mnt/cloud",
  new CloudStorageProvider({
    apiKey: "your-api-key",
    readOnly: false,
  }),
);

// IndexedDB für große Dateien
await VFS.mount(
  "/var/db",
  new IndexedDBProvider({
    dbName: "webconsole-storage",
    maxSize: "100MB",
  }),
);

// In-Memory für temporäre Dateien
await VFS.mount(
  "/tmp",
  new MemoryProvider({
    maxSize: "50MB",
    autoCleanup: true,
  }),
);
```

## ⚡ Built-in Commands & Extensibility

### Core Commands (verfügbar)

```bash
# System & Navigation
help                    # Interaktive Befehlsreferenz
clear                   # Terminal-Bildschirm leeren
pwd                     # Aktuelles Arbeitsverzeichnis
cd [directory]          # Verzeichnis wechseln
ls [-la] [path]         # Verzeichnis-Inhalt auflisten

# Dateisystem-Operationen
cat [file]              # Datei-Inhalt anzeigen
mkdir [-p] <directory>  # Verzeichnis erstellen
rm [-rf] <file/dir>     # Dateien/Ordner löschen
cp [-r] <src> <dest>    # Kopieren (in Entwicklung)
mv <src> <dest>         # Verschieben/Umbenennen (in Entwicklung)

# Environment & Konfiguration
echo [text]             # Text ausgeben
export VAR=value        # Umgebungsvariablen setzen
env                     # Environment anzeigen
alias name=command      # Command-Aliase erstellen
unset VAR              # Variablen entfernen

# System-Tools
date                    # Aktuelles Datum/Zeit
history                 # Befehlshistorie
which <command>         # Command-Pfad finden
theme [name]           # Theme wechseln
test                   # System-Selbsttest
```

### Plugin-System: Eigene Commands

```typescript
import { CommandRegistry, BaseCommand } from "web-console";

class GitStatusCommand extends BaseCommand {
  constructor() {
    super("git-status", "Show git repository status", "git-status [options]");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    // Simulierte Git-Integration
    const gitData = await this.fetchGitStatus(context.workingDirectory);

    await this.writeToStdout(
      context,
      `
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/components/WebConsole.ts
  modified:   README.md

Untracked files:
  new-feature.js
`,
    );

    return ExitCode.SUCCESS;
  }

  private async fetchGitStatus(cwd: string): Promise<GitStatus> {
    // Integration mit Git-APIs oder lokalen Repositories
    return await fetch(`/api/git/status?path=${cwd}`).then((r) => r.json());
  }
}

// Command registrieren
CommandRegistry.register(new GitStatusCommand());
```

### Advanced Command Features

```typescript
// Asynchrone Commands mit Progress
class DeployCommand extends BaseCommand {
  async execute(context: CommandContext): Promise<ExitCode> {
    const { flags, positional } = this.parseArgs(context);
    const environment = positional[0] || "staging";

    // Progress-Stream
    await this.writeToStdout(
      context,
      `🚀 Starting deployment to ${environment}...\n`,
    );

    for (let i = 0; i <= 100; i += 10) {
      await this.writeToStdout(context, `\r[${this.progressBar(i)}] ${i}%`);
      await this.sleep(200);
    }

    await this.writeToStdout(
      context,
      `\n✅ Deployment completed successfully!\n`,
    );
    return ExitCode.SUCCESS;
  }

  private progressBar(percent: number): string {
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }
}
```

## 🔧 API Reference & Advanced Usage

### Kernel Lifecycle

```typescript
import { kernel } from "web-console";

// Kernel-Initialisierung
await kernel.start();
console.log(`WebConsole Kernel v${kernel.version} started`);

// Services abrufen
const vfs = kernel.getVFS();
const themeManager = kernel.getThemeManager();
const commandRegistry = kernel.getCommandRegistry();
const logger = kernel.getLogger();

// Console-Instanzen verwalten
const mainConsole = await kernel.createConsole({
  id: "main",
  workingDirectory: "/home/user",
  prompt: "user@webconsole:~$ ",
  maxHistorySize: 1000,
  enablePersistence: true,
});

// Event-Listeners
kernel.on("console:created", (console) => {
  console.log(`New console created: ${console.id}`);
});

// Graceful Shutdown
await kernel.shutdown();
```

### State Management mit Persistierung

```typescript
import { StateManager, PersistenceMode } from "web-console";

const appState = new StateManager("myWebApp");

// Konfiguration mit Persistierung
appState.configure({
  key: "userPreferences",
  defaultValue: {
    theme: "windows-terminal",
    fontSize: "14px",
    shell: "/bin/bash",
  },
  persistence: PersistenceMode.PERSISTENT, // localStorage
  serializer: {
    serialize: (value) => JSON.stringify(value, null, 2),
    deserialize: (json) => JSON.parse(json),
  },
});

// Session-basierte Einstellungen
appState.configure({
  key: "temporarySettings",
  defaultValue: { debugMode: false },
  persistence: PersistenceMode.SESSION, // sessionStorage
});

// Reactive Updates
appState.on("userPreferences:changed", (newPrefs) => {
  themeManager.setTheme(newPrefs.theme);
  updateFontSize(newPrefs.fontSize);
});

// Werte setzen/abrufen
appState.set("userPreferences", { ...currentPrefs, theme: "monokai" });
const prefs = appState.get("userPreferences");
```

### Event-System & Hooks

```typescript
import { ConsoleEvent, KernelEvent } from "web-console";

// Console-Events
console.on(ConsoleEvent.COMMAND_ENTERED, ({ command, args }) => {
  analytics.track("command_executed", { command, timestamp: Date.now() });
});

console.on(
  ConsoleEvent.COMMAND_COMPLETED,
  ({ command, exitCode, executionTime }) => {
    if (exitCode !== 0) {
      logger.warn(`Command '${command}' failed with exit code ${exitCode}`);
    }
    metrics.recordCommandTime(command, executionTime);
  },
);

// Kernel-Events
kernel.on(KernelEvent.CONSOLE_CREATED, (console) => {
  // Auto-Setup für neue Consoles
  console.executeCommand('echo "Welcome to WebConsole!"');
  console.executeCommand("cd /home/user");
});

// VFS-Events für Dateisystem-Monitoring
vfs.on("file:created", ({ path, inode }) => {
  console.log(`New file created: ${path}`);
});

vfs.on("directory:deleted", ({ path }) => {
  console.warn(`Directory removed: ${path}`);
});
```

## 🚀 Development & Contributing

### Entwicklungsumgebung einrichten

```bash
# Repository klonen
git clone https://github.com/JosunLP/WebConsole.git
cd WebConsole

# Dependencies installieren
npm install

# Entwicklung starten (mit Live-Reload)
npm run dev

# Storybook für interaktive Entwicklung
npm run storybook

# Tests ausführen
npm run test

# Build für Produktion
npm run build
```

### Projektstruktur

```bash
WebConsole/
├── 📁 src/
│   ├── 📁 types/           # TypeScript-Typdefinitionen
│   ├── 📁 enums/           # Globale Enums (ExitCode, LogLevel, etc.)
│   ├── 📁 interfaces/      # Interface-Definitionen (IKernel, IVFS, etc.)
│   ├── 📁 core/            # Kern-Module
│   │   ├── Kernel.ts       # 🧠 Zentraler Kernel (Singleton)
│   │   ├── VFS.ts          # 📁 Virtual File System
│   │   ├── ThemeManager.ts # 🎨 Theme-Verwaltung
│   │   ├── StateManager.ts # 📊 State-Management
│   │   └── CommandRegistry.ts # 🔧 Command-Registrierung
│   ├── 📁 console/         # Console-Implementation
│   │   ├── ConsoleInstance.ts # Console-Instanz
│   │   ├── Lexer.ts        # Token-Lexer für Shell-Syntax
│   │   ├── Parser.ts       # Command-Parser
│   │   ├── BaseCommand.ts  # Base-Klasse für Commands
│   │   └── 📁 commands/    # Built-in Commands
│   ├── 📁 components/      # Framework-Komponenten
│   │   ├── WebConsoleElement.ts # Native Web Component
│   │   ├── 📁 react/       # React-Integration
│   │   ├── 📁 angular/     # Angular-Integration
│   │   ├── 📁 vue/         # Vue-Integration
│   │   └── 📁 svelte/      # Svelte-Integration
│   ├── 📁 themes/          # Built-in Themes
│   └── 📁 utils/           # Hilfsfunktionen
├── 📁 docs/                # Dokumentation
├── 📁 stories/             # Storybook-Stories
├── 📁 examples/            # Anwendungsbeispiele
└── 📁 dist/                # Build-Ausgabe
```

### TypeScript-Konfiguration

Das Projekt nutzt **strenge TypeScript-Einstellungen** für maximale Typsicherheit:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

### Testing-Strategy

```bash
# Unit-Tests mit Vitest
npm run test:unit

# Integration-Tests
npm run test:integration

# E2E-Tests mit Playwright (geplant)
npm run test:e2e

# Performance-Benchmarks
npm run test:performance

# Coverage-Report
npm run test:coverage
```

### Contributing Guidelines

1. **🍴 Fork** das Repository
2. **🌿 Feature-Branch** erstellen: `git checkout -b feature/amazing-command`
3. **✨ Implementierung** mit Tests
4. **📝 Commit** mit Conventional Commits: `feat: add amazing command with auto-completion`
5. **🚀 Push** zum Branch: `git push origin feature/amazing-command`
6. **📬 Pull Request** erstellen

#### Commit-Conventions

```bash
feat: neue Features
fix: Bugfixes
docs: Dokumentation
style: Code-Formatierung
refactor: Code-Refactoring
test: Tests hinzufügen/ändern
chore: Build-System, Dependencies
```

### 🌟 Future Vision

- **📱 Mobile-Support** - Touch-optimierte UI, Gesture-Navigation

## 🤝 Community & Support

### 📖 Ressourcen

- **📚 [Dokumentation](./docs/)** - Vollständige API-Referenz und Tutorials
- **🎮 [Live-Demo](https://josunlp.github.io/WebConsole/)** - Interaktive Online-Demo
- **📊 [Storybook](http://localhost:6006)** - Komponenten-Bibliothek (lokal)
- **🐛 [Issues](https://github.com/JosunLP/WebConsole/issues)** - Bug-Reports und Feature-Requests
- **💬 [Discussions](https://github.com/JosunLP/WebConsole/discussions)** - Community-Forum

### 🆘 Support

- **🚀 Quick-Start-Probleme?** → Schau in die [Examples](./examples/) oder [Storybook](http://localhost:6006)
- **🐛 Bug gefunden?** → [Issue erstellen](https://github.com/JosunLP/WebConsole/issues/new)
- **💡 Feature-Idee?** → [Discussion starten](https://github.com/JosunLP/WebConsole/discussions)
- **🤝 Contributing?** → [Contributing Guide](./CONTRIBUTING.md) lesen

### 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/JosunLP/WebConsole?style=for-the-badge&logo=github)
![GitHub forks](https://img.shields.io/github/forks/JosunLP/WebConsole?style=for-the-badge&logo=github)
![GitHub issues](https://img.shields.io/github/issues/JosunLP/WebConsole?style=for-the-badge&logo=github)
![GitHub pull requests](https://img.shields.io/github/issues-pr/JosunLP/WebConsole?style=for-the-badge&logo=github)

## 📄 Lizenz

```text
MIT License

Copyright (c) 2025 WebConsole Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---
