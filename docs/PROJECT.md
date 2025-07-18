# Concept: Browser Console Library "Web-Console" Concept: Browser Console Library "Web-Console" Konzept: Browser-Konsolen-Bibliothek „Web-Console“

## 1. Vision & Goals

Web-Console is a modular, fully browser-based console library that allows developers to integrate a Windows Terminal-like console into any web application in seconds – without backend, without build steps, without external dependencies.
The library provides ready-made components for Angular, React, Svelte and Vue as well as native Web Components and offers maximum customizability, a virtual file system, state management and bash-like syntax.

---

## 2. Architecture Overview

### 2.1 Core Modules

| Module                    | Responsibility                                        | Singleton | Persistence |
| ------------------------- | ----------------------------------------------------- | --------- | ----------- |
| Kernel                    | central event and lifecycle control                   | yes       | no          |
| VFS (Virtual File System) | virtual file system based on `localStorage`           | yes       | yes         |
| Console                   | Parser, Lexer, Executor for commands                  | no        | no          |
| Theme & Styling           | Design system, tokens, CSS custom properties          | yes       | yes         |
| StateManager              | global and per-console state hierarchy                | no        | optional    |
| ComponentRegistry         | registration and lazy loading of framework components | yes       | no          |
| WorkerManager             | Web Worker multithreading system                      | yes       | no          |

### 2.2 Directory Structure (OOP-first)

```bash
Web-Console/
├─ src/
│  ├─ types/          (global type definitions)
│  ├─ enums/          (global enums)
│  ├─ interfaces/     (global interfaces)
│  ├─ core/           (Kernel, VFS, StateManager, Theme, WorkerManager)
│  ├─ Console/          (Parser, Lexer, Executor, Built-ins)
│  ├─ workers/        (BaseWorker, CommandWorker, TaskWorker)
│  ├─ components/     (Framework-specific adapters)
│  ├─ themes/         (predefined themes)
│  └─ utils/          (helpers, logger, validators)
```

---

## 3. Virtual File System (VFS)

### 3.1 Concept

- POSIX-like paths (`/home/user/.config`)
- Inodes instead of real files
- Symlinks, hardlinks, permissions (rwx)
- Mount points for external providers (e.g. IndexedDB, Cloud)

### 3.2 Persistence Strategy

- `localStorage` as block device
- Copy-on-write for efficient updates
- Garbage collection on deletions
- Optional compression via LZ-String

### 3.3 API (simplified)

- `VFS.mount(path, provider)`
- `VFS.readFile(path): Promise<Uint8Array>`
- `VFS.writeFile(path, data, opts)`
- `VFS.watch(path, callback)`

---

## 4. Worker Multithreading System

### 4.1 Concept

The worker system enables true multithreading in the browser and is **easier to use than async/await**. It uses Web Workers for CPU-intensive tasks and provides automatic pool management.

### 4.2 Architecture

| Component     | Responsibility                               | Features                                |
| ------------- | -------------------------------------------- | --------------------------------------- |
| WorkerManager | Central hub for worker pool management       | Singleton, task queuing, load balancing |
| BaseWorker    | Abstract base for all worker implementations | VFS proxy, error handling, lifecycle    |
| CommandWorker | Specialized for command execution            | Shell integration, pipe support         |
| TaskWorker    | General task processing                      | Function execution, batch processing    |

### 4.3 CLI Integration

| Command  | Description            | Example                         |
| -------- | ---------------------- | ------------------------------- |
| `jobs`   | Show active tasks      | `jobs`                          |
| `kill`   | Terminate task         | `kill task_001`                 |
| `worker` | Worker pool management | `worker create pool 4`          |
| `run`    | Parallel execution     | `run --parallel cmd1 cmd2 cmd3` |

### 4.4 Programmier-API

```typescript
// Einfache Task-Ausführung
const result = await workerManager.runTask(() => heavyComputation());

// Batch-Verarbeitung
const tasks = [() => process(1), () => process(2), () => process(3)];
const results = await workerManager.runParallelBatch(tasks);

// Command-Integration
class MyCommand extends BaseCommand {
  async execute(context: CommandContext): Promise<ExitCode> {
    const result = await this.runInWorker(() => processData(context.args));
    await this.writeToStdout(context, `Result: ${result}`);
    return ExitCode.SUCCESS;
  }
}
```

---

## 5. State Management

### 5.1 Hierarchie

- Globaler State (Kernel, Theme, VFS-Metadaten)
- Pro-Console-State (History, CWD, Env-Variablen)
- Prozess-State (laufende Befehle, Pipes)

### 5.2 Persistenz-Flags

- `volatile` – nur im RAM
- `session` – `sessionStorage`
- `persistent` – `localStorage`

---

## 6. Console & Befehlsverarbeitung

### 6.1 Parser

- LL(1)-ähnlicher Parser für POSIX-Console-Syntax
- Unterstützt:
  - Pipes `|`
  - Redirections `>`, `>>`, `<`
  - SubConsoles `$(...)`
  - Environment-Variablen `$VAR`, `${VAR:-default}`
  - Globbing `*.js`

### 6.2 Built-ins

| Befehl   | Beschreibung                    |
| -------- | ------------------------------- |
| `ls`     | Auflisten mit Farbcodes         |
| `cat`    | Ausgabe mit Syntax-Highlighting |
| `cd`     | Wechsel Arbeitsverzeichnis      |
| `export` | Setzen von Umgebungsvariablen   |
| `theme`  | Theme zur Laufzeit wechseln     |
| `alias`  | Kommandoverknüpfungen           |

### 6.3 Erweiterbarkeit

- Plugin-System über `registerCommand(name, handler)`
- Async-Ausführung via `Promise<ExitCode>`
- Streaming-Output (ReadableStream)

### 6.4 Worker-Commands

| Command  | Beschreibung           |
| -------- | ---------------------- |
| `jobs`   | Worker-Status anzeigen |
| `kill`   | Tasks beenden          |
| `worker` | Worker-Pool Management |
| `run`    | Parallel-Ausführung    |

---

## 7. Design-System & Anpassbarkeit

### 7.1 Token-System

- CSS-Custom-Properties für Farben, Abstände, Fonts
- Design-Tokens in JSON definierbar
- Hot-Reload via `theme reload`

### 7.2 Themes

- Standard: `windows-terminal`, `monokai`, `solarized`
- Custom-Themes via JSON oder TypeScript-API
- Unterstützung für Hintergrundbilder, GIFs, Shader (WebGL)

### 7.3 Layout-System

- Tabs, Panes, Splits (wie tmux)
- Resize-Handles via Pointer-Events
- Fullscreen-Modus

---

## 8. Framework-Integration

### 8.1 Angular

- `Web-ConsoleModule` mit `Web-ConsoleComponent`
- DI-Token für Kernel und VFS
- Lazy-Loading über `import('Web-Console/ng')`

### 8.2 React

- `Web-Console` als Function-Component mit Hooks
- `useConsole()`, `useVFS()`, `useTheme()`

### 8.3 Vue

- `Web-Console` als Composition-API-Component
- `provide/inject` für Kernel

### 8.4 Svelte

- `Web-Console` als Svelte-Component
- Stores für Kernel, VFS, Theme

### 8.5 Native Web Components

- `<web-console>` Custom-Element
- Attribute für Theme, Prompt, Height
- Events: `command`, `exit`, `ready`

---

## 9. Ressourcen-Optimierung

### 9.1 Tree-Shaking

- Jede Framework-Integration ist eigenes NPM-Paket
- Core-Bundle < 50 kB (gzipped)

### 9.2 Lazy Loading

- Befehle werden erst bei erstmaligem Aufruf geladen
- Themes werden asynchron nachgeladen

### 9.3 Memory-Management

- WeakRefs für Event-Listener
- Offscreen-Canvas für Rendering
- RequestIdleCallback für Hintergrundaufgaben

---

## 10. Sicherheit

### 10.1 Sandbox

- Kein `eval`, kein `new Function`
- Befehle laufen in isolierten Web-Workern
- CSP-kompatibel

### 10.2 Permissions

- ACLs im VFS
- Read-Only Mounts möglich

---

## 11. Aktueller Stand & ToDos (Stand: Juli 2025)

### Implementiert

- **Core-Architektur:** Kernel, VFS, StateManager, EventEmitter, CommandRegistry
- **Worker-System:** WorkerManager, BaseWorker, CommandWorker, TaskWorker mit CLI-Integration
- **WebComponent:** `<web-console>` als native Komponente
- **Test-Infrastruktur:** Storybook mit interaktiven Demos und Core-Tests
- **Built-in Commands:** echo, help, clear, test, jobs, kill, worker, run (weitere in Planung)
- **Parser/Lexer:** Grundfunktionalität, aber noch ohne Pipes/Redirections

### Teilweise implementiert

- **React-Component:** Vorhanden, aber Build/JSX-Probleme
- **Command-Parser:** Unterstützt einfache Befehle, keine komplexen Shell-Features

### Geplant/Nächste Schritte

1. Command-Parser vervollständigen (Pipes, Variablen, Chaining)
2. Built-in Commands erweitern (ls, cd, pwd, cat, mkdir, rm, cp, mv)
3. Theme-System (CSS-Custom-Properties, Theme-Manager)
4. VFS-Extensions (Mounts, Permissions, Symlinks)
5. Plugin-System (Dynamic Command-Loading)
6. Build-Optimierung (Rollup, Tree-Shaking)
7. Unit-Tests (Vitest)

### Testen & Entwicklung

- **Storybook starten:**

  ```bash
  npm run storybook
  ```

- **Tests ausführen:**

  ```bash
  npm run test
  ```

- **Legacy HTML-Tests:**

  ```bash
  npm run serve
  npm run test:legacy
  ```

Weitere Details und aktuellen Status siehe auch [STATUS_CURRENT.md].

---

## 12. Lizenz & Community

- MIT-Lizenz
- GitHub-Monorepo mit Issues, Discussions
- Beispiel-App auf GitHub Pages

---

## 13. Nächste Schritte

1. Repository anlegen
2. Core-Module skizzieren (Interfaces, Enums, Typen)
3. VFS-Prototyp mit `localStorage`
4. Console-Parser mit einfachen Built-ins
5. React-Adapter als Proof-of-Concept

Viel Spaß beim Bauen – und immer schön im Terminal bleiben!
