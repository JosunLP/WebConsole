# Konzept: Browser-Konsolen-Bibliothek „Web-Console“

## 1. Vision & Zielsetzung

Web-Console ist eine modulare, vollständig im Browser laufende Konsolen-Bibliothek, die Entwicklern erlaubt, in Sekundenschnelle eine Windows-Terminal-ähnliche Console in jede Web-Anwendung zu integrieren – ohne Backend, ohne Build-Schritte, ohne externe Abhängigkeiten.
Die Bibliothek liefert fertige Komponenten für Angular, React, Svelte und Vue sowie native Web Components und bietet dabei maximale Anpassbarkeit, ein virtuelles Dateisystem, State-Management und bash-ähnliche Syntax.

---

## 2. Architektur-Überblick

### 2.1 Kern-Module

| Modul                     | Verantwortung                                            | Singleton | Persistenz |
| ------------------------- | -------------------------------------------------------- | --------- | ---------- |
| Kernel                    | zentrale Event- und Lebenszyklus-Steuerung               | ja        | nein       |
| VFS (Virtual File System) | virtuelles Dateisystem auf Basis von `localStorage`      | ja        | ja         |
| Console                   | Parser, Lexer, Executor für Befehle                      | nein      | nein       |
| Theme & Styling           | Design-System, Token, CSS-Custom-Properties              | ja        | ja         |
| StateManager              | globale und pro-Console-State-Hierarchie                 | nein      | optional   |
| ComponentRegistry         | Registrierung und Lazy-Loading der Framework-Komponenten | ja        | nein       |
| WorkerManager             | Web Worker Multithreading-System                         | ja        | nein       |

### 2.2 Verzeichnis-Struktur (OOP-first)

```bash
Web-Console/
├─ src/
│  ├─ types/          (globale Typdefinitionen)
│  ├─ enums/          (globale Enums)
│  ├─ interfaces/     (globale Interfaces)
│  ├─ core/           (Kernel, VFS, StateManager, Theme, WorkerManager)
│  ├─ Console/          (Parser, Lexer, Executor, Built-ins)
│  ├─ workers/        (BaseWorker, CommandWorker, TaskWorker)
│  ├─ components/     (Framework-spezifische Adapter)
│  ├─ themes/         (vordefinierte Themes)
│  └─ utils/          (Helfer, Logger, Validatoren)
```

---

## 3. Virtuelles Dateisystem (VFS)

### 3.1 Konzept

- POSIX-ähnliche Pfade (`/home/user/.config`)
- Inodes statt echter Dateien
- Symlinks, Hardlinks, Permissions (rwx)
- Mount-Points für externe Provider (z. B. IndexedDB, Cloud)

### 3.2 Persistenz-Strategie

- `localStorage` als Block-Device
- Copy-on-Write für effiziente Updates
- Garbage-Collection bei Löschungen
- Optionale Kompression via LZ-String

### 3.3 API (vereinfacht)

- `VFS.mount(path, provider)`
- `VFS.readFile(path): Promise<Uint8Array>`
- `VFS.writeFile(path, data, opts)`
- `VFS.watch(path, callback)`

---

## 4. Worker Multithreading System

### 4.1 Konzept

Das Worker-System ermöglicht echtes Multithreading im Browser und ist **einfacher zu verwenden als async/await**. Es nutzt Web Workers für CPU-intensive Tasks und bietet automatisches Pool-Management.

### 4.2 Architektur

| Komponente    | Verantwortung                                     | Features                                |
| ------------- | ------------------------------------------------- | --------------------------------------- |
| WorkerManager | Zentraler Hub für Worker-Pool-Management          | Singleton, Task-Queuing, Load-Balancing |
| BaseWorker    | Abstrakte Basis für alle Worker-Implementierungen | VFS-Proxy, Error-Handling, Lifecycle    |
| CommandWorker | Spezialisiert für Command-Ausführung              | Shell-Integration, Pipe-Support         |
| TaskWorker    | Allgemeine Task-Verarbeitung                      | Function-Execution, Batch-Processing    |

### 4.3 CLI-Integration

| Command  | Beschreibung           | Beispiel                        |
| -------- | ---------------------- | ------------------------------- |
| `jobs`   | Aktive Tasks anzeigen  | `jobs`                          |
| `kill`   | Task beenden           | `kill task_001`                 |
| `worker` | Worker-Pool Management | `worker create pool 4`          |
| `run`    | Parallel-Ausführung    | `run --parallel cmd1 cmd2 cmd3` |

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
