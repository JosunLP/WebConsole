/**
 * Standard Task Worker for general computations
 */

import {
  IWorkerTask,
  WorkerTaskType,
} from "../interfaces/IWorkerTask.interface.js";
import {
  BatchProcessResult,
  ComputationPayload,
  CustomTaskPayload,
  DataAnalysisResult,
  FibonacciResult,
  FileProcessingPayload,
  HeavyComputationResult,
  PrimeFactorsResult,
  SortResult,
  TaskResult,
  TextProcessingResult,
  WorkerAbortError,
  WorkerTaskError,
} from "../types/worker.type.js";
import { BaseWorker } from "./BaseWorker.js";

/**
 * TaskWorker - Executes general JavaScript tasks
 */
export class TaskWorker extends BaseWorker {
  protected async processTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<TaskResult> {
    try {
      this.checkAborted(signal);

      switch (task.type) {
        case WorkerTaskType.COMPUTATION:
          return await this.executeComputation(task, signal);

        case WorkerTaskType.FILE_PROCESSING:
          return await this.processFile(task, signal);

        case WorkerTaskType.CUSTOM:
          return await this.executeCustomTask(task, signal);

        default:
          throw new WorkerTaskError(
            `Unsupported task type: ${task.type}`,
            task.id,
            task.type.toString(),
          );
      }
    } catch (error) {
      if (signal.aborted) {
        throw new WorkerAbortError(task.id);
      }
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async executeComputation(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<TaskResult> {
    try {
      const { payload } = task;

      if (typeof payload === "object" && payload && "function" in payload) {
        // Secure function execution with predefined set
        const computationPayload = payload as ComputationPayload;
        const functionName = computationPayload.function;
        const args = computationPayload.args || [];

        const result = await this.executeSafeFunction(
          functionName,
          args,
          signal,
        );
        return { success: true, data: result };
      }

      // Standard payload processing
      return { success: true, data: payload };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Secure function execution with predefined allowed functions
   */
  private async executeSafeFunction(
    functionName: string,
    args: unknown[],
    signal: AbortSignal,
  ): Promise<
    | FibonacciResult
    | PrimeFactorsResult
    | SortResult<number>
    | TextProcessingResult
    | HeavyComputationResult
    | BatchProcessResult<unknown>
    | DataAnalysisResult
  > {
    // Predefined allowed functions for secure operation
    const allowedFunctions: Record<
      string,
      (
        args: unknown[],
        signal: AbortSignal,
      ) =>
        | FibonacciResult
        | PrimeFactorsResult
        | SortResult<number>
        | TextProcessingResult
        | HeavyComputationResult
        | BatchProcessResult<unknown>
        | DataAnalysisResult
        | Promise<
            | FibonacciResult
            | PrimeFactorsResult
            | SortResult<number>
            | TextProcessingResult
            | HeavyComputationResult
            | BatchProcessResult<unknown>
            | DataAnalysisResult
          >
    > = {
      // Mathematical operations
      fibonacci: (args: unknown[]): FibonacciResult => {
        const n = Number(args[0]);
        if (n <= 1) return { value: n, sequence: [n] };

        const sequence: number[] = [0, 1];
        let a = 0,
          b = 1;

        for (let i = 2; i <= n; i++) {
          [a, b] = [b, a + b];
          sequence.push(b);
        }

        return { value: b, sequence };
      },

      // Complex calculations
      primeFactors: (args: unknown[]): PrimeFactorsResult => {
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
        return { factors, originalNumber: num };
      },

      // Array operations
      sortNumbers: (args: unknown[]): SortResult<number> => {
        const arr = args[0] as number[];
        const sorted = [...arr].sort((a, b) => a - b);
        return {
          sorted,
          originalLength: arr.length,
          algorithm: "quicksort",
        };
      },

      // String processing
      processText: (args: unknown[]): TextProcessingResult => {
        const text = String(args[0]);
        const operation = String(args[1] || "uppercase");
        const operations: string[] = [operation];
        let processedText: string;

        switch (operation) {
          case "uppercase":
            processedText = text.toUpperCase();
            break;
          case "lowercase":
            processedText = text.toLowerCase();
            break;
          case "reverse":
            processedText = text.split("").reverse().join("");
            break;
          default:
            processedText = text;
        }

        return {
          processedText,
          wordCount: text.split(/\s+/).length,
          characterCount: text.length,
          operations,
        };
      },

      // Simulation of heavy computations
      heavyComputation: (
        args: unknown[],
        signal: AbortSignal,
      ): HeavyComputationResult => {
        const iterations = Number(args[0]) || 1000000;
        const startTime = Date.now();
        let sum = 0;

        for (let i = 0; i < iterations; i++) {
          if (i % 10000 === 0) {
            signal.throwIfAborted(); // Check for cancellation
          }
          sum += Math.sin(i) * Math.cos(i);
        }

        const endTime = Date.now();
        return {
          result: sum,
          iterations,
          duration: endTime - startTime,
        };
      },

      // Batch processing
      batchProcess: (args: unknown[]): BatchProcessResult<unknown> => {
        const items = args[0] as unknown[];
        const operation = String(args[1] || "identity");
        const processed: unknown[] = [];
        const errors: Error[] = [];
        let successful = 0;
        let failed = 0;

        for (const item of items) {
          try {
            const result = operation === "square" ? Number(item) ** 2 : item;
            processed.push(result);
            successful++;
          } catch (error) {
            errors.push(
              error instanceof Error ? error : new Error(String(error)),
            );
            failed++;
          }
        }

        return {
          processed,
          successful,
          failed,
          errors,
        };
      },

      // Data analysis
      analyzeData: (args: unknown[]): DataAnalysisResult => {
        const data = args[0] as number[];
        if (!data || data.length === 0) {
          throw new Error("Data array is empty or invalid");
        }

        const startTime = Date.now();
        const sorted = [...data].sort((a, b) => a - b);
        const sum = data.reduce((acc, val) => acc + val, 0);
        const mean = sum / data.length;
        const variance =
          data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;

        // Calculate median
        const middle = Math.floor(sorted.length / 2);
        const median =
          sorted.length % 2 === 0
            ? (sorted[middle - 1]! + sorted[middle]!) / 2
            : sorted[middle]!;

        // Calculate mode (most frequent value)
        const frequency = new Map<number, number>();
        data.forEach((val) =>
          frequency.set(val, (frequency.get(val) || 0) + 1),
        );
        const mode = [...frequency.entries()].reduce((a, b) =>
          a[1] > b[1] ? a : b,
        )[0];

        // Calculate quartiles
        const q1Index = Math.floor(sorted.length * 0.25);
        const q3Index = Math.floor(sorted.length * 0.75);
        const q1 = sorted[q1Index] ?? sorted[0]!;
        const q3 = sorted[q3Index] ?? sorted[sorted.length - 1]!;
        const iqr = q3 - q1;

        // Find outliers
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        const outliers = data.filter(
          (val) => val < lowerBound || val > upperBound,
        );

        return {
          summary: {
            count: data.length,
            mean,
            median,
            mode,
            standardDeviation: Math.sqrt(variance),
            min: Math.min(...data),
            max: Math.max(...data),
          },
          distribution: {
            quartiles: [sorted[0]!, q1, median, q3] as [
              number,
              number,
              number,
              number,
            ],
            outliers,
          },
          metadata: {
            dataType: "numeric",
            processingTime: Date.now() - startTime,
          },
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
  ): Promise<TaskResult> {
    try {
      this.checkAborted(signal);

      const { payload } = task;

      if (this.isFileProcessingPayload(payload)) {
        const filePayload = payload;

        switch (filePayload.operation) {
          case "parse": {
            const parseResult = await this.parseFileContent(
              filePayload.data as string,
              signal,
            );
            return { success: true, data: parseResult };
          }

          case "read": {
            const readResult = await this.parseFileContent(
              filePayload.path,
              signal,
            );
            return { success: true, data: readResult };
          }

          default:
            throw new WorkerTaskError(
              `Unsupported file operation: ${filePayload.operation}`,
              task.id,
              "file_processing",
            );
        }
      }

      return { success: true, data: payload };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private isFileProcessingPayload(
    payload: unknown,
  ): payload is FileProcessingPayload {
    return (
      typeof payload === "object" &&
      payload !== null &&
      "operation" in payload &&
      (payload as FileProcessingPayload).operation !== undefined
    );
  }

  private async executeCustomTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<TaskResult> {
    try {
      this.checkAborted(signal);

      const customPayload = task.payload as CustomTaskPayload;

      // Custom Task Execution - can be extended by plugin system
      return { success: true, data: customPayload };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async parseFileContent(
    content: string,
    signal: AbortSignal,
  ): Promise<{
    type: string;
    data: unknown;
    metadata: Record<string, unknown>;
  }> {
    this.checkAborted(signal);

    const startTime = Date.now();

    // Try to determine content type and parse accordingly
    try {
      // Try JSON first
      const jsonData = JSON.parse(content);
      return {
        type: "json",
        data: jsonData,
        metadata: {
          processingTime: Date.now() - startTime,
          size: content.length,
          format: "json",
        },
      };
    } catch {
      // Try CSV format
      if (content.includes(",") && content.includes("\n")) {
        const lines = content.split("\n").filter((line) => line.trim());
        const headers = lines[0]?.split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) =>
          line.split(",").reduce(
            (obj, val, idx) => {
              if (headers && headers[idx]) {
                obj[headers[idx]] = val.trim();
              }
              return obj;
            },
            {} as Record<string, string>,
          ),
        );

        return {
          type: "csv",
          data: { headers, rows },
          metadata: {
            processingTime: Date.now() - startTime,
            size: content.length,
            format: "csv",
            recordCount: rows.length,
          },
        };
      }

      // Fallback: line-by-line parsing
      const lines = content.split("\n").map((line, index) => ({
        line: index + 1,
        content: line.trim(),
      }));

      return {
        type: "text",
        data: lines,
        metadata: {
          processingTime: Date.now() - startTime,
          size: content.length,
          format: "text",
          lineCount: lines.length,
        },
      };
    }
  }

  private async validateFileContent(
    content: string,
    signal: AbortSignal,
  ): Promise<{ valid: boolean; errors: string[] }> {
    this.checkAborted(signal);

    const errors: string[] = [];

    // Basic validations
    if (content.length === 0) {
      errors.push("File is empty");
    }

    if (content.length > 1024 * 1024) {
      errors.push("File is too large (>1MB)");
    }

    // JSON validation if applicable
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

    // Basic transformations
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }
}

// Worker script for browser
if (
  typeof self !== "undefined" &&
  self.constructor.name === "DedicatedWorkerGlobalScope"
) {
  new TaskWorker();
}
