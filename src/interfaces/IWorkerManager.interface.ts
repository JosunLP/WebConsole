/**
 * Worker Manager Interface
 */

import { TaskResult } from "../types/worker.type.js";
import { IEventEmitter } from "./IEventEmitter.interface.js";
import {
  IWorkerPermissions,
  IWorkerPool,
  IWorkerTask,
  IWorkerTaskResult,
  WorkerTaskStatus,
} from "./IWorkerTask.interface.js";

export interface IWorkerManager extends IEventEmitter {
  readonly isInitialized: boolean;
  readonly defaultPoolId: string;

  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Pool Management
  createPool(
    id: string,
    maxWorkers?: number,
    permissions?: IWorkerPermissions,
  ): Promise<IWorkerPool>;
  destroyPool(id: string): Promise<void>;
  getPool(id: string): IWorkerPool | undefined;
  listPools(): string[];

  // Task Execution - Simplified API (Updated for Security)
  runTask<T>(
    taskFunction: string | (() => T),
    options?: Partial<IWorkerTask> & { args?: unknown[] },
  ): Promise<TaskResult>;
  runParallel<T>(
    taskFunction: string | (() => T),
    options?: Partial<IWorkerTask> & { args?: unknown[] },
  ): Promise<TaskResult>;
  runParallelBatch<T>(
    taskFunctions: (string | (() => T))[],
    options?: Partial<IWorkerTask> & { args?: unknown[] },
  ): Promise<TaskResult[]>;

  // Advanced Task Execution
  executeTask<T = unknown>(task: IWorkerTask<T>): Promise<TaskResult>;
  executeBatch<T = unknown>(
    tasks: IWorkerTask<T>[],
  ): Promise<IWorkerTaskResult<TaskResult>[]>;

  // Task Management
  cancelTask(taskId: string): Promise<boolean>;
  getTaskStatus(taskId: string): WorkerTaskStatus | undefined;
  listActiveTasks(): string[];
  clearCompletedTasks(): void;

  // Worker Management
  getWorkerStatus(): IWorkerPool[];
  getActiveWorkerCount(): number;
  terminateAllWorkers(): Promise<void>;

  // Configuration
  setDefaultPermissions(permissions: IWorkerPermissions): void;
  getDefaultPermissions(): IWorkerPermissions;
}
