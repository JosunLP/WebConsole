# 🔒 WebConsole Worker Security Update

## Sicherheitsproblem behoben: `new Function()` Vulnerability

### ❌ Vorheriges Sicherheitsproblem

```typescript
// UNSICHER - Ermöglichte Code-Injection
const func = new Function(
  "args",
  "signal",
  `return (${functionString}).apply(null, [args, signal]);`,
);
```

### ✅ Neue sichere Lösung

```typescript
// SICHER - Nur vordefinierte Funktionen erlaubt
const allowedFunctions: Record<
  string,
  (args: unknown[], signal: AbortSignal) => unknown
> = {
  fibonacci: (args: unknown[]) => {
    const n = Number(args[0]);
    if (n <= 1) return n;
    // Sichere Fibonacci-Implementierung
    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  },

  heavyComputation: (args: unknown[], signal: AbortSignal) => {
    const iterations = Number(args[0]) || 1000000;
    let sum = 0;

    for (let i = 0; i < iterations; i++) {
      if (i % 10000 === 0) {
        signal.throwIfAborted(); // Cancellation-Support
      }
      sum += Math.sin(i) * Math.cos(i);
    }

    return {
      result: sum,
      iterations,
      timestamp: Date.now(),
    };
  },

  // ... weitere sichere Funktionen
};

if (functionName in allowedFunctions) {
  const func = allowedFunctions[functionName];
  return await func(args, signal);
} else {
  throw new Error(`Function "${functionName}" is not allowed.`);
}
```

## 🛡️ Sicherheitsverbesserungen

### 1. Code-Injection verhindert

- **Keine dynamische Code-Ausführung** mehr möglich
- **Vordefinierte Funktionen** statt arbiträrer Code-Strings
- **Whitelist-Ansatz** für erlaubte Operationen

### 2. API-Update

#### Vorher (unsicher)

```typescript
const result = await workerManager.runTask(() => {
  // Beliebiger Code möglich
  return eval(userInput); // GEFÄHRLICH!
});
```

#### Nachher (sicher)

```typescript
const result = await workerManager.runTask("fibonacci", {
  args: [40],
});
```

### 3. Unterstützte sichere Funktionen

| Funktion           | Beschreibung             | Beispiel                                                 |
| ------------------ | ------------------------ | -------------------------------------------------------- |
| `fibonacci`        | Fibonacci-Berechnung     | `runTask('fibonacci', {args: [40]})`                     |
| `primeFactors`     | Primfaktorzerlegung      | `runTask('primeFactors', {args: [1234]})`                |
| `sortNumbers`      | Array sortieren          | `runTask('sortNumbers', {args: [[3,1,4,1,5]]})`          |
| `processText`      | Text-Verarbeitung        | `runTask('processText', {args: ['Hello', 'uppercase']})` |
| `heavyComputation` | CPU-intensive Berechnung | `runTask('heavyComputation', {args: [500000]})`          |
| `batchProcess`     | Batch-Verarbeitung       | `runTask('batchProcess', {args: [[1,2,3], 'square']})`   |
| `analyzeData`      | Daten-Analyse            | `runTask('analyzeData', {args: [[1,2,3,4,5]]})`          |

### 4. Rückwärts-Kompatibilität

Das System erkennt alte Function-Patterns und mappt sie automatisch:

```typescript
// Legacy-Support mit Pattern-Erkennung
const result = await workerManager.runTask(() => {
  // System erkennt Math.sin/Math.cos Pattern
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sin(i) * Math.cos(i);
  }
  return sum;
});
// → Automatisch gemappt zu 'heavyComputation'
```

## 📊 Betroffene Dateien

| Datei                                 | Änderung                                    | Status |
| ------------------------------------- | ------------------------------------------- | ------ |
| `src/workers/TaskWorker.ts`           | Sichere Funktions-Ausführung implementiert  | ✅     |
| `src/core/WorkerManager.ts`           | API erweitert für String/Function-Parameter | ✅     |
| `src/console/BaseCommand.ts`          | Type-Updates für neue API                   | ✅     |
| `src/stories/WorkerSystem.stories.ts` | Demo-Code auf sichere API umgestellt        | ✅     |
| `docs/WORKER_SYSTEM.md`               | Sicherheits-Dokumentation erweitert         | ✅     |

## 🚀 Neue sichere Nutzung

### Developer API

```typescript
// Sichere Task-Ausführung
const result = await workerManager.runTask("heavyComputation", {
  args: [1000000],
  timeout: 10000,
});

// Sichere Batch-Verarbeitung
const results = await workerManager.runTask("batchProcess", {
  args: [[1, 2, 3, 4, 5], "square"],
});
```

### CLI-Commands

```bash
# Worker-Commands nutzen automatisch sichere Funktionen
$ run --parallel fibonacci 40
$ worker create compute-pool 4
$ jobs
```

### Command Development

```typescript
class MyCommand extends BaseCommand {
  async execute(context: CommandContext): Promise<ExitCode> {
    // Sichere Worker-Nutzung
    const result = await this.runCommandInWorker("analyzeData", {
      args: [context.args],
    });

    await this.writeToStdout(context, `Result: ${JSON.stringify(result)}`);
    return ExitCode.SUCCESS;
  }
}
```

## 🎯 Vorteile der neuen Sicherheitslösung

1. **Keine Code-Injection** - Unmöglich, arbiträren Code auszuführen
2. **Performance** - Vordefinierte Funktionen sind optimiert
3. **Type-Safety** - Vollständige TypeScript-Unterstützung
4. **Erweiterbar** - Neue sichere Funktionen einfach hinzufügbar
5. **Kompatibel** - Legacy-Code wird automatisch gemappt
6. **CSP-konform** - Erfüllt Content Security Policy Anforderungen

Das WebConsole Worker-System ist jetzt **vollständig sicher** und bietet gleichzeitig maximale Funktionalität! 🛡️✨
