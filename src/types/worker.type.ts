/**
 * Worker-specific types for better type safety
 */

// Task execution result types
export type TaskResult<T = unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: Error;
    };

// Computation function types
export type ComputationFunction = (
  args: unknown[],
  signal?: AbortSignal,
) => unknown | Promise<unknown>;

// Mathematical computation results
export interface FibonacciResult {
  value: number;
  sequence?: number[];
}

export interface PrimeFactorsResult {
  factors: number[];
  originalNumber: number;
}

export interface SortResult<T> {
  sorted: T[];
  originalLength: number;
  algorithm?: string;
}

export interface TextProcessingResult {
  processedText: string;
  wordCount: number;
  characterCount: number;
  operations: string[];
}

export interface HeavyComputationResult {
  result: number;
  iterations: number;
  duration: number;
}

export interface BatchProcessResult<T> {
  processed: T[];
  successful: number;
  failed: number;
  errors: Error[];
}

export interface DataAnalysisResult {
  summary: {
    count: number;
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    min: number;
    max: number;
  };
  distribution: {
    quartiles: [number, number, number, number];
    outliers: number[];
  };
  metadata: {
    dataType: string;
    processingTime: number;
  };
}

// File processing result types
export interface FileProcessingResult<T = unknown> {
  filename: string;
  size: number;
  processedData: T;
  metadata: Record<string, unknown>;
}

// Worker task payload types
export interface ComputationPayload {
  function: string;
  args: unknown[];
  options?: {
    timeout?: number;
    memoryLimit?: number;
  };
}

export interface FileProcessingPayload {
  operation: "read" | "write" | "parse" | "transform";
  path: string;
  data?: unknown;
  options?: Record<string, unknown>;
}

export interface CustomTaskPayload {
  handler: string;
  parameters: Record<string, unknown>;
  context?: Record<string, unknown>;
}

// Union type for all task payloads
export type TaskPayload =
  | ComputationPayload
  | FileProcessingPayload
  | CustomTaskPayload
  | unknown;

// Error types for better error handling
export class WorkerTaskError extends Error {
  constructor(
    message: string,
    public readonly taskId: string,
    public readonly taskType: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "WorkerTaskError";
  }
}

export class WorkerTimeoutError extends WorkerTaskError {
  constructor(taskId: string, timeout: number) {
    super(`Task ${taskId} timed out after ${timeout}ms`, taskId, "timeout");
    this.name = "WorkerTimeoutError";
  }
}

export class WorkerAbortError extends WorkerTaskError {
  constructor(taskId: string) {
    super(`Task ${taskId} was aborted`, taskId, "abort");
    this.name = "WorkerAbortError";
  }
}
