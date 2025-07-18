/**
 * Standard Task Worker für allgemeine Berechnungen
 */

import {
  IWorkerTask,
  WorkerTaskType,
} from "../interfaces/IWorkerTask.interface.js";
import { BaseWorker } from "./BaseWorker.js";

/**
 * TaskWorker - Führt allgemeine JavaScript-Tasks aus
 */
export class TaskWorker extends BaseWorker {
  protected async processTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    switch (task.type) {
      case WorkerTaskType.COMPUTATION:
        return this.executeComputation(task, signal);

      case WorkerTaskType.FILE_PROCESSING:
        return this.processFile(task, signal);

      case WorkerTaskType.CUSTOM:
        return this.executeCustomTask(task, signal);

      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }

  private async executeComputation(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    const { payload } = task;

    if (typeof payload === "object" && payload && "function" in payload) {
      // Sichere Funktion-Ausführung mit vordefiniertem Set
      const functionName = payload.function as string;
      const args = (payload as { args?: unknown[] }).args || [];

      return await this.executeSafeFunction(functionName, args, signal);
    }

    // Standard-Payload-Verarbeitung
    return payload;
  }

  /**
   * Sichere Funktions-Ausführung mit vordefinierten erlaubten Funktionen
   */
  private async executeSafeFunction(
    functionName: string,
    args: unknown[],
    signal: AbortSignal,
  ): Promise<unknown> {
    // Vordefinierte erlaubte Funktionen für sicheren Betrieb
    const allowedFunctions: Record<
      string,
      (args: unknown[], signal: AbortSignal) => unknown | Promise<unknown>
    > = {
      // Mathematische Operationen
      fibonacci: (args: unknown[]) => {
        const n = Number(args[0]);
        if (n <= 1) return n;
        let a = 0,
          b = 1;
        for (let i = 2; i <= n; i++) {
          [a, b] = [b, a + b];
        }
        return b;
      },

      // Komplexe Berechnungen
      primeFactors: (args: unknown[]) => {
        const num = Number(args[0]);
        const factors: number[] = [];
        let divisor = 2;
        let n = num;

        while (divisor * divisor <= n) {
          while (n % divisor === 0) {
            factors.push(divisor);
            n /= divisor;
          }
          divisor++;
        }

        if (n > 1) factors.push(n);
        return factors;
      },

      // Array-Operationen
      sortNumbers: (args: unknown[]) => {
        const arr = args[0] as number[];
        return [...arr].sort((a, b) => a - b);
      },

      // String-Verarbeitung
      processText: (args: unknown[]) => {
        const text = String(args[0]);
        const operation = String(args[1] || "uppercase");

        switch (operation) {
          case "uppercase":
            return text.toUpperCase();
          case "lowercase":
            return text.toLowerCase();
          case "reverse":
            return text.split("").reverse().join("");
          case "wordcount":
            return text.split(/\s+/).length;
          default:
            return text;
        }
      },

      // Simulation schwerer Berechnungen
      heavyComputation: (args: unknown[], signal: AbortSignal) => {
        const iterations = Number(args[0]) || 1000000;
        let sum = 0;

        for (let i = 0; i < iterations; i++) {
          if (i % 10000 === 0) {
            signal.throwIfAborted(); // Check for cancellation
          }
          sum += Math.sin(i) * Math.cos(i);
        }

        return {
          result: sum,
          iterations,
          timestamp: Date.now(),
        };
      },

      // Batch-Verarbeitung
      batchProcess: (args: unknown[]) => {
        const items = args[0] as unknown[];
        const operation = String(args[1] || "identity");

        return items.map((item, index) => ({
          index,
          original: item,
          processed: operation === "square" ? Number(item) ** 2 : item,
          timestamp: Date.now(),
        }));
      },

      // Daten-Analyse
      analyzeData: (args: unknown[]) => {
        const data = args[0] as number[];
        const sum = data.reduce((acc, val) => acc + val, 0);
        const mean = sum / data.length;
        const variance =
          data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;

        return {
          count: data.length,
          sum,
          mean,
          variance,
          stdDev: Math.sqrt(variance),
          min: Math.min(...data),
          max: Math.max(...data),
        };
      },
    };

    if (functionName in allowedFunctions) {
      const func = allowedFunctions[functionName];
      if (!func) {
        throw new Error(`Function "${functionName}" is not properly defined`);
      }

      try {
        const result = await func(args, signal);
        return result;
      } catch (error) {
        throw new Error(
          `Function "${functionName}" execution failed: ${error}`,
        );
      }
    } else {
      throw new Error(
        `Function "${functionName}" is not allowed. Allowed functions: ${Object.keys(allowedFunctions).join(", ")}`,
      );
    }
  }

  private async processFile(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    const { payload } = task;

    if (
      typeof payload === "object" &&
      payload &&
      "fileData" in payload &&
      "operation" in payload
    ) {
      const filePayload = payload as { fileData: string; operation: string };

      switch (filePayload.operation) {
        case "parse":
          return this.parseFileContent(filePayload.fileData, signal);

        case "validate":
          return this.validateFileContent(filePayload.fileData, signal);

        case "transform":
          return this.transformFileContent(filePayload.fileData, signal);

        default:
          throw new Error(`Unknown file operation: ${filePayload.operation}`);
      }
    }

    throw new Error("Invalid file processing payload");
  }

  private async executeCustomTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    // Custom Task Execution
    // Kann von Plugin-System erweitert werden
    return task.payload;
  }

  private async parseFileContent(
    content: string,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    // Beispiel: JSON-Parsing
    try {
      return JSON.parse(content);
    } catch {
      // Fallback: Line-by-line parsing
      return content.split("\n").map((line, index) => ({
        line: index + 1,
        content: line.trim(),
      }));
    }
  }

  private async validateFileContent(
    content: string,
    signal: AbortSignal,
  ): Promise<{ valid: boolean; errors: string[] }> {
    this.checkAborted(signal);

    const errors: string[] = [];

    // Basis-Validierungen
    if (content.length === 0) {
      errors.push("File is empty");
    }

    if (content.length > 1024 * 1024) {
      errors.push("File is too large (>1MB)");
    }

    // JSON-Validierung falls anwendbar
    if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
      try {
        JSON.parse(content);
      } catch (error) {
        errors.push(
          `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async transformFileContent(
    content: string,
    signal: AbortSignal,
  ): Promise<string> {
    this.checkAborted(signal);

    // Basis-Transformationen
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }
}

// Worker-Script für Browser
if (
  typeof self !== "undefined" &&
  self.constructor.name === "DedicatedWorkerGlobalScope"
) {
  new TaskWorker();
}
