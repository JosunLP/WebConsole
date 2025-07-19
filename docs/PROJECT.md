# Concept: Browser Console Library "Web-Console"

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

### 4.4 Programming API

```typescript
// Simple task execution
const result = await workerManager.runTask(() => heavyComputation());

// Batch processing
const tasks = [() => process(1), () => process(2), () => process(3)];
const results = await workerManager.runParallelBatch(tasks);

// Command integration
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

### 5.1 Hierarchy

- Global state (Kernel, Theme, VFS metadata)
- Per-console state (History, CWD, env variables)
- Process state (running commands, pipes)

### 5.2 Persistence Flags

- `volatile` – RAM only
- `session` – `sessionStorage`
- `persistent` – `localStorage`

---

## 6. Console & Command Processing

### 6.1 Parser

- LL(1)-like parser for POSIX console syntax
- Supports:
  - Pipes `|`
  - Redirections `>`, `>>`, `<`
  - Sub-consoles `$(...)`
  - Environment variables `$VAR`, `${VAR:-default}`
  - Globbing `*.js`

### 6.2 Built-ins

| Command  | Description                     |
| -------- | ------------------------------- |
| `ls`     | List with color codes           |
| `cat`    | Output with syntax highlighting |
| `cd`     | Change working directory        |
| `export` | Set environment variables       |
| `theme`  | Switch theme at runtime         |
| `alias`  | Command shortcuts               |

### 6.3 Extensibility

- Plugin system via `registerCommand(name, handler)`
- Async execution via `Promise<ExitCode>`
- Streaming output (ReadableStream)

### 6.4 Worker Commands

| Command  | Description            |
| -------- | ---------------------- |
| `jobs`   | Show worker status     |
| `kill`   | Terminate tasks        |
| `worker` | Worker pool management |
| `run`    | Parallel execution     |

---

## 7. Design System & Customizability

### 7.1 Token System

- CSS custom properties for colors, spacing, fonts
- Design tokens definable in JSON
- Hot reload via `theme reload`

### 7.2 Themes

- Standard: `windows-terminal`, `monokai`, `solarized`
- Custom themes via JSON or TypeScript API
- Support for background images, GIFs, shaders (WebGL)

### 7.3 Layout System

- Tabs, panes, splits (like tmux)
- Resize handles via pointer events
- Fullscreen mode

---

## 8. Framework Integration

### 8.1 Angular

- **Angular Module** with `WebConsoleComponent`
- DI token for Kernel and VFS
- Lazy loading via `import('WebConsole/ng')`

### 8.2 React

- `WebConsole` as Function Component with Hooks
- `useConsole()`, `useVFS()`, `useTheme()`

### 8.3 Vue

- `WebConsole` as Composition API Component
- `provide/inject` for Kernel

### 8.4 Svelte

- `WebConsole` as Svelte Component
- Stores for Kernel, VFS, Theme

### 8.5 Native Web Components

- `<web-console>` Custom Element
- Attributes for Theme, Prompt, Height
- Events: `command`, `exit`, `ready`

---

## 9. Resource Optimization

### 9.1 Tree Shaking

- Each framework integration is a separate NPM package
- Core bundle < 50 kB (gzipped)

### 9.2 Lazy Loading

- Commands are loaded only on first call
- Themes are loaded asynchronously

### 9.3 Memory Management

- WeakRefs for event listeners
- Offscreen canvas for rendering
- RequestIdleCallback for background tasks

---

## 10. Security

### 10.1 Sandbox

- No `eval`, no `new Function`
- Commands run in isolated Web Workers
- CSP compatible

### 10.2 Permissions

- ACLs in VFS
- Read-only mounts possible

---

## 11. Current Status & ToDos (As of July 2025)

### Implemented

- **Core Architecture:** Kernel, VFS, StateManager, EventEmitter, CommandRegistry
- **Worker System:** WorkerManager, BaseWorker, CommandWorker, TaskWorker with CLI integration
- **WebComponent:** `<web-console>` as native component
- **Test Infrastructure:** Storybook with interactive demos and core tests
- **Built-in Commands:** echo, help, clear, test, jobs, kill, worker, run (more planned)
- **Parser/Lexer:** Basic functionality, but without pipes/redirections yet

### Partially Implemented

- **React Component:** Available, but build/JSX problems
- **Command Parser:** Supports simple commands, no complex shell features

### Planned/Next Steps

1. Complete command parser (pipes, variables, chaining)
2. Extend built-in commands (ls, cd, pwd, cat, mkdir, rm, cp, mv)
3. Theme system (CSS custom properties, theme manager)
4. VFS extensions (mounts, permissions, symlinks)
5. Plugin system (dynamic command loading)
6. Build optimization (Rollup, tree shaking)
7. Unit tests (Vitest)

### Testing & Development

- **Start Storybook:**

  ```bash
  npm run storybook
  ```

- **Run tests:**

  ```bash
  npm run test
  ```

- **Legacy HTML tests:**

  ```bash
  npm run serve
  npm run test:legacy
  ```

See also [STATUS_CURRENT.md] for more details and current status.

---

## 12. Security Features

### 12.1 Regular Expression Safety

Web-Console implements comprehensive protection against Regular Expression Denial of Service (ReDoS) attacks and unsafe regex patterns:

#### Key Security Features

- **Pattern Validation**: All regex patterns are validated before execution
- **Length Limits**: Maximum pattern length enforced (1000 characters default)
- **Dangerous Pattern Detection**: Automatic detection of potentially harmful regex constructs
- **Safe Fallbacks**: Automatic fallback to literal string matching for unsafe patterns
- **Input Sanitization**: Proper escaping of special regex characters

#### Implementation

- `RegexUtils` class provides secure regex creation methods
- Command workers (grep, find) use validated regex patterns
- Three operation modes: literal, glob, and validated regex
- Comprehensive error handling with fallback mechanisms

#### Usage Examples

```typescript
// Safe search regex with automatic validation
const searchRegex = RegexUtils.createSearchRegex(
  userInput,
  caseSensitive,
  literal,
);

// Safe filename matching with glob patterns
const filenameRegex = RegexUtils.createFilenameRegex("*.txt");

// Manual pattern validation
const validation = RegexUtils.validatePattern(userPattern);
if (!validation.isValid) {
  console.warn(`Unsafe pattern: ${validation.error}`);
}
```

### 12.2 Input Validation

- All user inputs are validated before processing
- Command arguments are sanitized
- File paths are normalized and validated
- Prevents injection attacks through command parameters

---

## 13. License & Community

- MIT License
- GitHub monorepo with issues, discussions
- Example app on GitHub Pages

---

## 14. Next Steps

1. Create repository
2. Sketch core modules (interfaces, enums, types)
3. VFS prototype with `localStorage`
4. Console parser with simple built-ins
5. React adapter as proof of concept

Have fun building – and always stay in the terminal!
