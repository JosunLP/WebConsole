/**
 * Worker Task Interface
 */

export interface IWorkerTask<T = any, R = any> {
  id: string;
  payload: T;
  priority: number;
  timeout?: number;
  retry?: number;
  command?: string;
  type: WorkerTaskType;
}

export interface IWorkerTaskResult<R = any> {
  id: string;
  success: boolean;
  result?: R;
  error?: Error;
  executionTime: number;
  workerId: string;
}

export interface IWorkerPermissions {
  vfsAccess: boolean;
  networkAccess: boolean;
  maxExecutionTime: number;
  memoryLimit?: number;
}

export interface IWorkerPool {
  id: string;
  maxWorkers: number;
  activeWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
}

export interface IWorkerManager {
  // Pool Management
  createPool(id: string, maxWorkers: number): Promise<IWorkerPool>;
  destroyPool(id: string): Promise<void>;
  getPool(id: string): IWorkerPool | undefined;

  // Task Execution
  executeTask<T, R>(task: IWorkerTask<T, R>): Promise<R>;
  executeBatch<T, R>(
    tasks: IWorkerTask<T, R>[],
  ): Promise<IWorkerTaskResult<R>[]>;

  // Task Management
  cancelTask(taskId: string): Promise<boolean>;
  getTaskStatus(taskId: string): WorkerTaskStatus | undefined;
  listActiveTasks(): string[];

  // Worker Management
  getWorkerStatus(): IWorkerPool[];
  terminateAllWorkers(): Promise<void>;
}

export enum WorkerTaskType {
  COMMAND = "command",
  VFS_OPERATION = "vfs-operation",
  COMPUTATION = "computation",
  FILE_PROCESSING = "file-processing",
  NETWORK = "network",
  CUSTOM = "custom",
}

export enum WorkerTaskStatus {
  QUEUED = "queued",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  TIMEOUT = "timeout",
}

export enum WorkerTaskPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 8,
  CRITICAL = 10,
}
