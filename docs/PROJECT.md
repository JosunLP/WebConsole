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

### 2.2 Verzeichnis-Struktur (OOP-first)

```bash
Web-Console/
├─ src/
│  ├─ types/          (globale Typdefinitionen)
│  ├─ enums/          (globale Enums)
│  ├─ interfaces/     (globale Interfaces)
│  ├─ core/           (Kernel, VFS, StateManager, Theme)
│  ├─ Console/          (Parser, Lexer, Executor, Built-ins)
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

## 4. State Management

### 4.1 Hierarchie

- Globaler State (Kernel, Theme, VFS-Metadaten)
- Pro-Console-State (History, CWD, Env-Variablen)
- Prozess-State (laufende Befehle, Pipes)

### 4.2 Persistenz-Flags

- `volatile` – nur im RAM
- `session` – `sessionStorage`
- `persistent` – `localStorage`

---

## 5. Console & Befehlsverarbeitung

### 5.1 Parser

- LL(1)-ähnlicher Parser für POSIX-Console-Syntax
- Unterstützt:
  - Pipes `|`
  - Redirections `>`, `>>`, `<`
  - SubConsoles `$(...)`
  - Environment-Variablen `$VAR`, `${VAR:-default}`
  - Globbing `*.js`

### 5.2 Built-ins

| Befehl   | Beschreibung                    |
| -------- | ------------------------------- |
| `ls`     | Auflisten mit Farbcodes         |
| `cat`    | Ausgabe mit Syntax-Highlighting |
| `cd`     | Wechsel Arbeitsverzeichnis      |
| `export` | Setzen von Umgebungsvariablen   |
| `theme`  | Theme zur Laufzeit wechseln     |
| `alias`  | Kommandoverknüpfungen           |

### 5.3 Erweiterbarkeit

- Plugin-System über `registerCommand(name, handler)`
- Async-Ausführung via `Promise<ExitCode>`
- Streaming-Output (ReadableStream)

---

## 6. Design-System & Anpassbarkeit

### 6.1 Token-System

- CSS-Custom-Properties für Farben, Abstände, Fonts
- Design-Tokens in JSON definierbar
- Hot-Reload via `theme reload`

### 6.2 Themes

- Standard: `windows-terminal`, `monokai`, `solarized`
- Custom-Themes via JSON oder TypeScript-API
- Unterstützung für Hintergrundbilder, GIFs, Shader (WebGL)

### 6.3 Layout-System

- Tabs, Panes, Splits (wie tmux)
- Resize-Handles via Pointer-Events
- Fullscreen-Modus

---

## 7. Framework-Integration

### 7.1 Angular

- `Web-ConsoleModule` mit `Web-ConsoleComponent`
- DI-Token für Kernel und VFS
- Lazy-Loading über `import('Web-Console/ng')`

### 7.2 React

- `Web-Console` als Function-Component mit Hooks
- `useConsole()`, `useVFS()`, `useTheme()`

### 7.3 Vue

- `Web-Console` als Composition-API-Component
- `provide/inject` für Kernel

### 7.4 Svelte

- `Web-Console` als Svelte-Component
- Stores für Kernel, VFS, Theme

### 7.5 Native Web Components

- `<web-console>` Custom-Element
- Attribute für Theme, Prompt, Height
- Events: `command`, `exit`, `ready`

---

## 8. Ressourcen-Optimierung

### 8.1 Tree-Shaking

- Jede Framework-Integration ist eigenes NPM-Paket
- Core-Bundle < 50 kB (gzipped)

### 8.2 Lazy Loading

- Befehle werden erst bei erstmaligem Aufruf geladen
- Themes werden asynchron nachgeladen

### 8.3 Memory-Management

- WeakRefs für Event-Listener
- Offscreen-Canvas für Rendering
- RequestIdleCallback für Hintergrundaufgaben

---

## 9. Sicherheit

### 9.1 Sandbox

- Kein `eval`, kein `new Function`
- Befehle laufen in isolierten Web-Workern
- CSP-kompatibel

### 9.2 Permissions

- ACLs im VFS
- Read-Only Mounts möglich

---

## 10. Aktueller Stand & ToDos (Stand: Juli 2025)

### Implementiert

- **Core-Architektur:** Kernel, VFS, StateManager, EventEmitter, CommandRegistry
- **WebComponent:** `<web-console>` als native Komponente
- **Test-Infrastruktur:** Storybook mit interaktiven Demos und Core-Tests
- **Built-in Commands:** echo, help, clear, test (weitere in Planung)
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

## 11. Lizenz & Community

- MIT-Lizenz
- GitHub-Monorepo mit Issues, Discussions
- Beispiel-App auf GitHub Pages

---

## 11. Nächste Schritte

1. Repository anlegen
2. Core-Module skizzieren (Interfaces, Enums, Typen)
3. VFS-Prototyp mit `localStorage`
4. Console-Parser mit einfachen Built-ins
5. React-Adapter als Proof-of-Concept

Viel Spaß beim Bauen – und immer schön im Terminal bleiben!
