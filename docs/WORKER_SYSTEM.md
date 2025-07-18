# 🔧 WebConsole Worker Multithreading System

## Übersicht

Das WebConsole Worker Multithreading System bietet eine einfach zu verwendende, moderne Lösung für parallele Ausführung von Aufgaben im Web. Es ist so konzipiert, dass es **einfacher zu verwenden ist als async/await** und echtes Multithreading im Browser ermöglicht.

## ✨ Hauptmerkmale

- **Echtes Multithreading** mit Web Workers
- **Einfacher als async/await** - keine komplexe Promise-Verkettung
- **Automatisches Worker-Pool Management**
- **VFS-Integration** für Dateizugriff aus Workern
- **CLI-Integration** mit benutzerfreundlichen Befehlen
- **Typsicherheit** mit TypeScript
- **Retry-Mechanismus** und Error-Handling
- **Performance-Monitoring** und Status-Tracking

## 🚀 Schnellstart

### 1. Einfache Worker-Ausführung

```typescript
import { kernel } from "./core/Kernel.js";

// Kernel starten
await kernel.start();
const workerManager = kernel.getWorkerManager();

// Schwere Berechnung in Worker ausführen
const result = await workerManager.runTask(() => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sin(i) * Math.cos(i);
  }
  return sum;
});

console.log("Berechnung abgeschlossen:", result);
```

### 2. Batch-Verarbeitung

```typescript
// Mehrere Tasks parallel ausführen
const tasks = [
  () => processFile("file1.txt"),
  () => processFile("file2.txt"),
  () => processFile("file3.txt"),
];

const results = await workerManager.runParallelBatch(tasks);
console.log("Alle Dateien verarbeitet:", results);
```

### 3. Command Integration

```typescript
import { BaseCommand } from "./console/BaseCommand.js";

class MyCommand extends BaseCommand {
  async execute(params: string[]): Promise<void> {
    // Task in Worker ausführen - super einfach!
    const result = await this.runInWorker(() => {
      return heavyComputation(params[0]);
    });

    this.output.writeLine(`Ergebnis: ${result}`);
  }
}
```

## 🎯 CLI-Befehle

Das System bringt praktische CLI-Befehle mit:

### `jobs` - Aktive Tasks anzeigen

```bash
$ jobs
Pool 'default': 2/4 workers, 0 queued, 15 completed, 0 failed
Pool 'compute': 1/2 workers, 3 queued, 8 completed, 1 failed

Active Tasks:
  ├─ task_001: running (2.3s)
  ├─ task_002: running (0.8s)
  └─ task_003: queued
```

### `kill` - Task beenden

```bash
$ kill task_001
✅ Task 'task_001' wurde erfolgreich beendet
```

### `worker` - Worker-Management

```bash
# Status anzeigen
$ worker status

# Pool erstellen
$ worker create compute-pool 4

# Pool zerstören
$ worker destroy old-pool

# Konfiguration anzeigen
$ worker config
```

### `run` - Parallel-Ausführung

```bash
# Befehle parallel ausführen
$ run --parallel "ls -la" "pwd" "date"

# Batch-Verarbeitung
$ run --batch process-files *.txt
```

## 🏗️ Architektur

### Worker-Manager (Singleton)

- **Zentraler Hub** für alle Worker-Operationen
- **Pool-Management** mit automatischer Skalierung
- **Task-Queue** mit Prioritäten und Timeout
- **Performance-Monitoring** und Statistiken

### Worker-Pools

- **Dynamische Pools** für verschiedene Task-Typen
- **Automatisches Load-Balancing**
- **Worker-Recycling** für Speicher-Effizienz
- **Isolation** zwischen verschiedenen Operationen

### Task-System

- **Typisierte Tasks** mit generischen Parametern
- **Retry-Mechanismus** bei Fehlern
- **Timeout-Handling** für hängende Tasks
- **Status-Tracking** mit Events

## 🛠️ Integration in Kernel

```typescript
// Kernel.ts
class Kernel {
  private _workerManager?: WorkerManager;

  async start(): Promise<void> {
    // ... andere Initialisierungen
    this._workerManager = WorkerManager.getInstance();
    await this._workerManager.initialize();
  }

  getWorkerManager(): WorkerManager {
    if (!this._workerManager) {
      throw new Error("Worker manager not initialized");
    }
    return this._workerManager;
  }
}
```

## 🔧 BaseCommand Integration

```typescript
abstract class BaseCommand {
  // Worker-Methoden für einfache Nutzung
  protected async runInWorker<T>(
    taskFunction: () => T,
    options?: { timeout?: number; type?: WorkerTaskType },
  ): Promise<T> {
    const workerManager = this.kernel.getWorkerManager();
    return workerManager.runTask(taskFunction, options);
  }

  protected async runCommandInWorker(
    command: string,
    timeout: number = 30000,
  ): Promise<any> {
    return this.runInWorker(
      () => {
        // Command-Ausführung im Worker
        return executeCommand(command);
      },
      { timeout, type: WorkerTaskType.COMMAND },
    );
  }

  protected async runParallelCommands(commands: string[]): Promise<any[]> {
    const tasks = commands.map((cmd) => () => executeCommand(cmd));
    const workerManager = this.kernel.getWorkerManager();
    return workerManager.runParallelBatch(tasks);
  }
}
```

## 📊 Beispiele

### CPU-intensive Berechnung

```typescript
const result = await workerManager.runTask(
  () => {
    // Fibonacci-Berechnung
    function fib(n: number): number {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    }
    return fib(40);
  },
  {
    timeout: 10000,
    type: WorkerTaskType.COMPUTATION,
  },
);
```

### File-Processing

```typescript
const result = await workerManager.executeTask({
  id: "file-analysis",
  payload: {
    files: ["log1.txt", "log2.txt"],
    pattern: /ERROR/g,
  },
  type: WorkerTaskType.FILE_PROCESSING,
  priority: 5,
  timeout: 15000,
});
```

### VFS-Integration

```typescript
// Worker kann auf VFS zugreifen
const result = await workerManager.runTask(() => {
  const vfs = getVFSProxy();
  const content = vfs.readFile("/data/config.json");
  return JSON.parse(content);
});
```

## 🎨 Storybook Demo

Das System kommt mit einer interaktiven Storybook-Demo:

```bash
npm run storybook
```

Die Demo zeigt:

- **Live Worker-Status** mit Echtzeit-Updates
- **Verschiedene Task-Typen** (Computation, Batch, File-Processing)
- **Performance-Monitoring** mit Ausführungszeiten
- **Error-Handling** und Retry-Mechanismus

## 🔒 Sicherheit

Das Worker-System wurde mit höchster Sicherheit entwickelt:

- **Keine `new Function()` oder `eval()`** - Kein dynamischer Code-Ausführung
- **Vordefinierte Funktionen** - Nur sichere, getestete Funktionen erlaubt
- **Sandboxed Workers** - Isolierte Ausführungsumgebung
- **Permission-System** für VFS- und Netzwerkzugriff
- **Memory-Limits** pro Worker
- **Timeout-Protection** gegen hängende Tasks

### Erlaubte Funktionen

Das System verwendet nur vordefinierte, sichere Funktionen:

```typescript
const allowedFunctions = {
  fibonacci: (args) => fibonacci(args[0]),
  primeFactors: (args) => calculatePrimeFactors(args[0]),
  sortNumbers: (args) => [...args[0]].sort((a, b) => a - b),
  processText: (args) => processText(args[0], args[1]),
  heavyComputation: (args) => performCalculation(args[0]),
  batchProcess: (args) => batchProcess(args[0], args[1]),
  analyzeData: (args) => analyzeDataset(args[0]),
};
```

### Sichere API-Nutzung

```typescript
// ✅ Sicher - Vordefinierte Funktion
const result = await workerManager.runTask("fibonacci", { args: [40] });

// ✅ Sicher - Erlaubte Batch-Verarbeitung
const results = await workerManager.runTask("batchProcess", {
  args: [[1, 2, 3, 4, 5], "square"],
});

// ❌ Unsicher - Wird nicht mehr unterstützt
// const result = await workerManager.runTask(() => eval(userInput));
```

## 📈 Performance

- **Worker-Pools** reduzieren Startup-Overhead
- **Task-Recycling** minimiert GC-Druck
- **Load-Balancing** optimiert CPU-Nutzung
- **Priority-Queues** für wichtige Tasks

## 🧪 Testing

```typescript
// Worker-Tests
describe("WorkerManager", () => {
  it("should execute task in worker", async () => {
    const result = await workerManager.runTask(() => 42);
    expect(result).toBe(42);
  });

  it("should handle parallel batch", async () => {
    const tasks = [() => 1, () => 2, () => 3];
    const results = await workerManager.runParallelBatch(tasks);
    expect(results).toEqual([1, 2, 3]);
  });
});
```

## 🤝 Vergleich zu async/await

### Traditionell mit async/await:

```typescript
// Komplex, blockiert Main Thread
async function processFiles(files: string[]) {
  const results = [];
  for (const file of files) {
    const result = await heavyProcessing(file); // Blockiert!
    results.push(result);
  }
  return results;
}
```

### Mit WorkerManager:

```typescript
// Einfach, parallel, non-blocking
async function processFiles(files: string[]) {
  const tasks = files.map((file) => () => heavyProcessing(file));
  return workerManager.runParallelBatch(tasks); // Parallel!
}
```

## 🛣️ Roadmap

- [ ] **Dynamic Worker Scaling** basierend auf CPU-Load
- [ ] **Worker-Persistent Storage** für langlebige Daten
- [ ] **Cross-Worker Communication** für komplexe Workflows
- [ ] **WebAssembly Integration** für maximale Performance
- [ ] **Streaming API** für große Datenmengen
- [ ] **GPU-Worker Support** mit WebGL/WebGPU

## 📝 Fazit

Das WebConsole Worker System macht Multithreading im Web so einfach wie nie zuvor. Statt komplexer Promise-Ketten und async/await-Konstrukte bietet es eine intuitive API, die echte Parallelität ermöglicht und dabei den Main Thread entlastet.

**Einfacher. Schneller. Parallel.**
