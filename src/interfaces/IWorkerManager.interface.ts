/**
 * Worker Manager Interface
 */

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
  runTask<T, R>(
    taskFunction: string | (() => T),
    options?: Partial<IWorkerTask> & { args?: unknown[] },
  ): Promise<R>;
  runParallel<T>(
    taskFunction: string | (() => T),
    options?: Partial<IWorkerTask> & { args?: unknown[] },
  ): Promise<T>;
  runParallelBatch<T>(
    taskFunctions: (string | (() => T))[],
    options?: Partial<IWorkerTask> & { args?: unknown[] },
  ): Promise<T[]>;

  // Advanced Task Execution
  executeTask<T, R>(task: IWorkerTask<T, R>): Promise<R>;
  executeBatch<T, R>(
    tasks: IWorkerTask<T, R>[],
  ): Promise<IWorkerTaskResult<R>[]>;

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
