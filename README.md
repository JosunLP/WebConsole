# 🖥️ WebConsole

> A modular, fully browser-based console library for modern web applications

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&style=for-the-badge)](https://vitejs.dev/)
![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-green?style=for-the-badge)

## 🌟 Highlights

**WebConsole** allows developers to integrate a Windows Terminal-like console into any web application in seconds – **no backend, no build steps, no external dependencies**.

### ✨ Core Features

- 🖥️ **Browser-Native** - Fully client-side, no server dependencies
- 🏗️ **Modular Architecture** - Kernel, VFS, StateManager, Parser, ThemeManager
- 📁 **Virtual File System** - POSIX-like operations with localStorage backend
- 🎨 **Flexible Theme System** - CSS custom properties, design tokens, hot-reload
- ⚡ **Framework-Agnostic** - Native Web Components + React, Angular, Vue, Svelte adapters
- 📦 **Tree-Shaking Ready** - Minimal bundle size due to modular design
- 🔒 **Security** - Sandbox environment, CSP-compatible, no `eval()`
- 📚 **Full TypeScript** - Complete type support with strict settings
- 🧩 **Plugin System** - Extensible command registration
- 💾 **State Persistence** - Hierarchical state management with localStorage/sessionStorage
- 🔧 **Worker Multithreading** - True multithreading with Web Workers, easier than async/await

## 🚀 Quick Start

### Option 1: Storybook Demo (Recommended for Evaluation)

```bash
npm install
npm run storybook  # Starts at http://localhost:6006
```

**Storybook offers:**

- 🎮 **Interactive Demos** - Live tests of all features and components
- 🔧 **Core System Tests** - Kernel, VFS, StateManager, CommandRegistry tests
- 📱 **Framework Examples** - React, Angular, Vue, Svelte live examples
- 📚 **Live Documentation** - API reference with code snippets
- 🔧 **Worker System Demo** - Interactive worker multithreading tests

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

// Start kernel
await kernel.start();

// Create console
const console = await kernel.createConsole({
  id: "main",
  workingDirectory: "/home/user",
  prompt: "$ ",
});

// Execute command
const result = await console.execute("ls -la");
console.log(result.stdout);
```

## 🏗️ Architecture & Implementation Status

### Core Modules (✅ Implemented)

| Module                 | Status   | Responsibility                           | Features                                      |
| ---------------------- | -------- | ---------------------------------------- | --------------------------------------------- |
| **🧠 Kernel**          | ✅ Done  | Central event and lifecycle control      | Singleton, event system, console management   |
| **📁 VFS**             | ✅ Done  | Virtual file system with localStorage    | POSIX-like, inode system, mount points        |
| **🎨 ThemeManager**    | ✅ Done  | Design system with CSS custom properties | Hot-reload, token system, built-in themes     |
| **📊 StateManager**    | ✅ Done  | Hierarchical state management            | Persistence modes, event-driven updates       |
| **🔧 CommandRegistry** | ✅ Done  | Command registration and management      | Plugin system, aliases, built-ins             |
| **⚙️ Parser/Lexer**    | ⚠️ Basic | Shell syntax parsing (bash-like)         | Basic commands ✅, pipes/redirects 🔄         |
| **🔧 WorkerManager**   | ✅ Done  | Web Worker multithreading system         | Worker pools, task queues, parallel execution |

### Built-in Commands (Current Status)

| Command   | Status | Description           | Features                          |
| --------- | ------ | --------------------- | --------------------------------- |
| `help`    | ✅     | Help system           | Interactive command reference     |
| `clear`   | ✅     | Clear terminal        | ANSI escape sequences             |
| `echo`    | ✅     | Output text           | Variable substitution, escapes    |
| `test`    | ✅     | System tests          | Core module validation            |
| `jobs`    | ✅     | Show worker status    | Active tasks, pool management     |
| `kill`    | ✅     | Terminate tasks       | Task cancellation, worker cleanup |
| `worker`  | ✅     | Worker management     | Pool ops, status, configuration   |
| `run`     | ✅     | Parallel execution    | Batch processing, multithreading  |
| `cat`     | ✅     | Show file contents    | Basic, syntax highlighting        |
| `ls`      | ✅     | Directory listing     | Basic, colors/icons               |
| `cd`      | ✅     | Change directory      | Basic, tab completion             |
| `pwd`     | ✅     | Current path          | Basic                             |
| `mkdir`   | ✅     | Create directory      | Basic, recursive flag             |
| `rm`      | ✅     | Delete files/folders  | Basic, safety prompts             |
| `cp`      | ✅     | Copy                  | Files & directories, recursive    |
| `mv`      | ✅     | Move/rename           | Files & directories               |
| `alias`   | ✅     | Command aliases       | Basic functionality               |
| `export`  | ✅     | Environment variables | Set variables                     |
| `env`     | ✅     | Show environment      | List variables, run with env      |
| `date`    | ✅     | Date/time             | Format, UTC, ISO, RFC             |
| `history` | ✅     | Command history       | Show, limit output                |
| `theme`   | ✅     | Change theme          | List, set, preview                |
| `which`   | ✅     | Find command path     | Built-in & PATH search            |
| `unset`   | ✅     | Delete variables      | Remove env variables              |

### Framework Integration

| Framework                 | Status | Package               | Features                      |
| ------------------------- | ------ | --------------------- | ----------------------------- |
| **Native Web Components** | ✅     | `<web-console>`       | Fully implemented             |
| **React**                 | ⚠️     | `web-console/react`   | Basic ✅, JSX build issues 🔄 |
| **Angular**               | 📋     | `web-console/angular` | Planned, stubs available      |
| **Vue**                   | 📋     | `web-console/vue`     | Planned, stubs available      |
| **Svelte**                | 📋     | `web-console/svelte`  | Planned, stubs available      |

### Advanced Features (Roadmap)

- **Shell Features**: Pipes `|`, redirections `>`, `>>`, `<`, variable substitution `$VAR`
- **Theme System**: Hot-reload, custom CSS injection, animation support
- **Security**: WebWorker sandbox, command permissions, CSP headers
- **Performance**: Virtual scrolling, command caching, lazy loading
- **Testing**: Unit tests (Vitest), E2E tests, performance benchmarks

## 🧵 Worker Multithreading System

WebConsole offers an innovative **Web Worker Multithreading System** that enables true parallelism in the browser and is **easier to use than async/await**.

### ✨ Worker Features

- **🔧 True Multithreading** - Web Workers for CPU-intensive tasks
- **⚡ Easier than async/await** - No complex promise chaining
- **🏊‍♂️ Worker Pool Management** - Automatic scaling and load balancing
- **📋 Task Queuing** - Priorities, timeouts, retry mechanism
- **🔄 VFS Integration** - File access from workers via proxy
- **📊 Performance Monitoring** - Live status and execution times
- **🛡️ Sandbox Security** - Isolated worker environment

### 🎯 Worker CLI Commands

```bash
# Show worker status
$ jobs
🔧 Worker Status
Active Workers: 3
Worker Pools: 2

Pool 'default': 2/4 workers, 0 queued, 15 completed, 0 failed
Pool 'compute': 1/2 workers, 3 queued, 8 completed, 1 failed

Active Tasks:
  ├─ task_001: running (2.3s)
  ├─ task_002: running (0.8s)
  └─ task_003: queued

# Terminate task
$ kill task_001
✅ Task 'task_001' was successfully terminated

# Worker pool management
$ worker status
$ worker create compute-pool 4
$ worker destroy old-pool

# Parallel execution
$ run --parallel "ls -la" "pwd" "date"
$ run --batch process-files *.txt
```

### 🚀 Programming API

```typescript
import { kernel } from "web-console";

// Start kernel
await kernel.start();
const workerManager = kernel.getWorkerManager();

// Run heavy computation in worker
const result = await workerManager.runTask(() => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sin(i) * Math.cos(i);
  }
  return sum;
});

// Batch processing
const tasks = [
  () => processFile("file1.txt"),
  () => processFile("file2.txt"),
  () => processFile("file3.txt"),
];
const results = await workerManager.runParallelBatch(tasks);

// Command integration
class MyCommand extends BaseCommand {
  async execute(context: CommandContext): Promise<ExitCode> {
    // Super easy - no async/await chaos!
    const result = await this.runInWorker(() => {
      return heavyComputation(context.args[0]);
    });

    await this.writeToStdout(context, `Result: ${result}`);
    return ExitCode.SUCCESS;
  }
}
```

### 📚 Worker Documentation

For a complete guide to the worker system see: [**docs/WORKER_SYSTEM.md**](docs/WORKER_SYSTEM.md)

## 📦 Installation & Framework Integration

### NPM Installation

```bash
# Core library
npm install web-console

# Framework-specific packages (in development)
npm install web-console @angular/core  # Angular
npm install web-console react          # React
npm install web-console vue            # Vue
npm install web-console svelte         # Svelte
```

### Framework Examples

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

| Theme              | Description                       | Preview                                 |
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

// Register theme
ThemeManager.register(customTheme);

// Activate theme
await ThemeManager.setTheme("cyberpunk-2077");

// Hot-reload during development
ThemeManager.injectCSS();
```

## 🗂️ Virtual File System (VFS)

### POSIX-like API

```typescript
import { VFS } from "web-console";

// Write/read files
await VFS.writeFile(
  "/home/user/projects/app.js",
  'console.log("Hello World!");',
);
const content = await VFS.readFile("/home/user/projects/app.js");

// Create directories
await VFS.createDir("/home/user/documents", { recursive: true });

// List files/folders
const entries = await VFS.readDir("/home/user");
console.log(entries); // [{ name: 'projects', type: 'directory' }, ...]

// Glob pattern support
const jsFiles = await VFS.glob("**/*.js");
const configFiles = await VFS.glob("**/config.{json,yaml,yml}");

// Permissions & metadata
await VFS.chmod("/home/user/script.sh", 0o755); // Executable
const stats = await VFS.stat("/home/user/script.sh");
console.log(stats.permissions); // 0o755
```

### Mount Points & Provider

```typescript
// Mount external provider
await VFS.mount(
  "/mnt/cloud",
  new CloudStorageProvider({
    apiKey: "your-api-key",
    readOnly: false,
  }),
);

// IndexedDB for large files
await VFS.mount(
  "/var/db",
  new IndexedDBProvider({
    dbName: "webconsole-storage",
    maxSize: "100MB",
  }),
);

// In-memory for temporary files
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
cp [-r] <src> <dest>    # Kopieren
mv <src> <dest>         # Verschieben/Umbenennen

# Environment & Konfiguration
echo [text]             # Text ausgeben
export VAR=value        # Umgebungsvariablen setzen
env                     # Environment anzeigen
alias name=command      # Command-Aliase erstellen
unset VAR               # Variablen entfernen

# System-Tools
date                    # Aktuelles Datum/Zeit
history                 # Befehlshistorie
which <command>         # Command-Pfad finden
theme [name]            # Theme wechseln
test                    # System-Selbsttest
```

### Plugin-System: Eigene Commands

```typescript
import { CommandRegistry, BaseCommand } from "web-console";

class GitStatusCommand extends BaseCommand {
  constructor() {
    super("git-status", "Show git repository status", "git-status [options]");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    // Simulated Git integration
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
    // Integration with Git APIs or local repositories
    return await fetch(`/api/git/status?path=${cwd}`).then((r) => r.json());
  }
}

// Register command
CommandRegistry.register(new GitStatusCommand());
```

### Advanced Command Features

```typescript
// Asynchronous commands with progress
class DeployCommand extends BaseCommand {
  async execute(context: CommandContext): Promise<ExitCode> {
    const { flags, positional } = this.parseArgs(context);
    const environment = positional[0] || "staging";

    // Progress stream
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

// Kernel initialization
await kernel.start();
console.log(`WebConsole Kernel v${kernel.version} started`);

// Retrieve services
const vfs = kernel.getVFS();
const themeManager = kernel.getThemeManager();
const commandRegistry = kernel.getCommandRegistry();
const logger = kernel.getLogger();

// Manage console instances
const mainConsole = await kernel.createConsole({
  id: "main",
  workingDirectory: "/home/user",
  prompt: "user@webconsole:~$ ",
  maxHistorySize: 1000,
  enablePersistence: true,
});

// Event listeners
kernel.on("console:created", (console) => {
  console.log(`New console created: ${console.id}`);
});

// Graceful shutdown
await kernel.shutdown();
```

### State Management mit Persistierung

```typescript
import { StateManager, PersistenceMode } from "web-console";

const appState = new StateManager("myWebApp");

// Configuration with persistence
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

// Session-based settings
appState.configure({
  key: "temporarySettings",
  defaultValue: { debugMode: false },
  persistence: PersistenceMode.SESSION, // sessionStorage
});

// Reactive updates
appState.on("userPreferences:changed", (newPrefs) => {
  themeManager.setTheme(newPrefs.theme);
  updateFontSize(newPrefs.fontSize);
});

// Set/get values
appState.set("userPreferences", { ...currentPrefs, theme: "monokai" });
const prefs = appState.get("userPreferences");
```

### Event-System & Hooks

```typescript
import { ConsoleEvent, KernelEvent } from "web-console";

// Console events
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

// Kernel events
kernel.on(KernelEvent.CONSOLE_CREATED, (console) => {
  // Auto-setup for new consoles
  console.executeCommand('echo "Welcome to WebConsole!"');
  console.executeCommand("cd /home/user");
});

// VFS events for file system monitoring
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
