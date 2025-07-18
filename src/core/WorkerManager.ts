/**
 * Worker Manager - Central management of Web Workers
 */

import {
  IWorkerManager,
  IWorkerPermissions,
  IWorkerPool,
  IWorkerTask,
  IWorkerTaskResult,
  WorkerTaskPriority,
  WorkerTaskStatus,
  WorkerTaskType,
} from "../interfaces/index.js";
import { EventEmitter } from "./EventEmitter.js";

/**
 * Worker Pool Implementation
 */
class WorkerPool implements IWorkerPool {
  public readonly id: string;
  public readonly maxWorkers: number;
  public activeWorkers = 0;
  public queuedTasks = 0;
  public completedTasks = 0;
  public failedTasks = 0;

  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private busyWorkers = new Set<Worker>();
  private taskQueue: IWorkerTask[] = [];
  private activeTasks = new Map<
    string,
    {
      task: IWorkerTask;
      worker: Worker;
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      startTime: number;
    }
  >();

  private permissions: IWorkerPermissions;
  private workerScript: string;

  constructor(
    id: string,
    maxWorkers: number,
    permissions: IWorkerPermissions,
    workerScript: string,
  ) {
    this.id = id;
    this.maxWorkers = maxWorkers;
    this.permissions = permissions;
    this.workerScript = workerScript;
  }

  async initialize(): Promise<void> {
    // Create initial workers
    const initialWorkers = Math.min(2, this.maxWorkers);
    for (let i = 0; i < initialWorkers; i++) {
      await this.createWorker();
    }
  }

  private async createWorker(): Promise<Worker> {
    const worker = new Worker(this.workerScript);

    // Worker-Events
    worker.addEventListener("message", (event) => {
      this.handleWorkerMessage(worker, event);
    });

    worker.addEventListener("error", (error) => {
      // Use Logger instead of console
      this.handleWorkerError(worker, error);
    });

    // Wait for worker to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Worker initialization timeout"));
      }, 5000);

      const handler = (event: MessageEvent) => {
        if (event.data.type === "pong") {
          worker.removeEventListener("message", handler);
          clearTimeout(timeout);
          resolve();
        }
      };

      worker.addEventListener("message", handler);
      worker.postMessage({ type: "ping" });
    });

    this.workers.push(worker);
    this.availableWorkers.push(worker);

    return worker;
  }

  async executeTask<T, R>(task: IWorkerTask<T, R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      // Add task to queue
      this.taskQueue.push(task);
      this.queuedTasks++;

      // Task-Tracking
      this.activeTasks.set(task.id, {
        task,
        worker: null as unknown as Worker,
        resolve: resolve as (value: unknown) => void,
        reject,
        startTime: performance.now(),
      });

      // Try to start task immediately
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      this.queuedTasks--;
      this.activeWorkers++;
      this.busyWorkers.add(worker);

      // Update task tracking
      const taskData = this.activeTasks.get(task.id)!;
      taskData.worker = worker;

      // Send task to worker
      worker.postMessage({
        type: "task",
        data: task,
        taskId: task.id,
      });
    }

    // Create new workers if needed
    if (this.taskQueue.length > 0 && this.workers.length < this.maxWorkers) {
      try {
        await this.createWorker();
        this.processQueue(); // Try recursively
      } catch (error) {
        // Failed to create additional worker - continue with available workers
      }
    }
  }

  private handleWorkerMessage(worker: Worker, event: MessageEvent): void {
    const { type, taskId, data, error } = event.data;

    switch (type) {
      case "result":
        this.handleTaskResult(worker, taskId, data);
        break;

      case "error":
        this.handleTaskError(worker, taskId, error);
        break;

      case "progress":
        this.handleTaskProgress(taskId, data);
        break;

      case "vfs-request":
        this.handleVFSRequest(worker, event.data);
        break;
    }
  }

  private handleTaskResult(
    worker: Worker,
    taskId: string,
    result: IWorkerTaskResult,
  ): void {
    const taskData = this.activeTasks.get(taskId);
    if (!taskData) return;

    this.activeTasks.delete(taskId);
    this.busyWorkers.delete(worker);
    this.availableWorkers.push(worker);
    this.activeWorkers--;

    if (result.success) {
      this.completedTasks++;
      taskData.resolve(result.result);
    } else {
      this.failedTasks++;
      taskData.reject(result.error || new Error("Unknown worker error"));
    }

    // Process next tasks
    this.processQueue();
  }

  private handleTaskError(worker: Worker, taskId: string, error: string): void {
    const taskData = this.activeTasks.get(taskId);
    if (!taskData) return;

    this.activeTasks.delete(taskId);
    this.busyWorkers.delete(worker);
    this.availableWorkers.push(worker);
    this.activeWorkers--;
    this.failedTasks++;

    taskData.reject(new Error(error));

    // Process next tasks
    this.processQueue();
  }

  private handleTaskProgress(
    _taskId: string,
    _progressData: { progress: number; message?: string },
  ): void {
    // Progress events can be processed here
    // For future extensions
  }

  private async handleVFSRequest(
    _worker: Worker,
    _request: unknown,
  ): Promise<void> {
    // VFS proxy for worker
    // Implementation would forward VFS calls to the main thread here
  }

  private handleWorkerError(worker: Worker, _error: ErrorEvent): void {
    // Remove faulty worker
    const index = this.workers.indexOf(worker);
    if (index >= 0) {
      this.workers.splice(index, 1);
    }

    const availableIndex = this.availableWorkers.indexOf(worker);
    if (availableIndex >= 0) {
      this.availableWorkers.splice(availableIndex, 1);
    }

    this.busyWorkers.delete(worker);

    // Create replacement worker
    this.createWorker().catch(() => {
      // Failed to create replacement worker
    });
  }

  async terminate(): Promise<void> {
    // Terminate all workers
    for (const worker of this.workers) {
      worker.terminate();
    }

    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();

    // Cancel all active tasks
    for (const [, taskData] of this.activeTasks) {
      taskData.reject(new Error("Worker pool terminated"));
    }
    this.activeTasks.clear();
  }

  cancelTask(taskId: string): boolean {
    const taskData = this.activeTasks.get(taskId);
    if (!taskData) return false;

    // Cancel task
    taskData.worker.postMessage({
      type: "cancel",
      taskId,
    });

    return true;
  }

  getTaskStatus(taskId: string): WorkerTaskStatus | undefined {
    if (this.activeTasks.has(taskId)) {
      return WorkerTaskStatus.RUNNING;
    }

    const isQueued = this.taskQueue.some((task) => task.id === taskId);
    return isQueued ? WorkerTaskStatus.QUEUED : undefined;
  }
}

/**
 * WorkerManager - Main class for worker management
 */
export class WorkerManager extends EventEmitter implements IWorkerManager {
  private static _instance: WorkerManager | null = null;

  public readonly defaultPoolId = "default";
  private _isInitialized = false;

  private pools = new Map<string, WorkerPool>();
  private defaultPermissions: IWorkerPermissions = {
    vfsAccess: false,
    networkAccess: false,
    maxExecutionTime: 30000, // 30 seconds
    memoryLimit: 64 * 1024 * 1024, // 64MB
  };

  private taskIdCounter = 0;

  private constructor() {
    super();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager._instance) {
      WorkerManager._instance = new WorkerManager();
    }
    return WorkerManager._instance;
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    // Create default pool
    await this.createPool(this.defaultPoolId, 4, this.defaultPermissions);

    this._isInitialized = true;
    this.emit("worker-manager-initialized");
  }

  async shutdown(): Promise<void> {
    if (!this._isInitialized) return;

    // Terminate all pools
    const promises = Array.from(this.pools.values()).map((pool) =>
      pool.terminate(),
    );
    await Promise.all(promises);

    this.pools.clear();
    this._isInitialized = false;

    this.emit("worker-manager-shutdown");
  }

  async createPool(
    id: string,
    maxWorkers = 4,
    permissions = this.defaultPermissions,
  ): Promise<IWorkerPool> {
    if (this.pools.has(id)) {
      throw new Error(`Worker pool '${id}' already exists`);
    }

    // Determine worker script based on pool ID
    const workerScript = this.getWorkerScript(id);

    const pool = new WorkerPool(id, maxWorkers, permissions, workerScript);
    await pool.initialize();

    this.pools.set(id, pool);
    this.emit("pool-created", { poolId: id, maxWorkers });

    return pool;
  }

  async destroyPool(id: string): Promise<void> {
    const pool = this.pools.get(id);
    if (!pool) {
      throw new Error(`Worker pool '${id}' not found`);
    }

    if (id === this.defaultPoolId) {
      throw new Error("Cannot destroy default pool");
    }

    await pool.terminate();
    this.pools.delete(id);

    this.emit("pool-destroyed", { poolId: id });
  }

  getPool(id: string): IWorkerPool | undefined {
    return this.pools.get(id);
  }

  listPools(): string[] {
    return Array.from(this.pools.keys());
  }

  // Simplified API with safe predefined functions
  async runTask<T, R>(
    taskFunction: string | (() => T),
    options: Partial<IWorkerTask> & { args?: unknown[] } = {},
  ): Promise<R> {
    let functionName: string;
    let args: unknown[] = [];

    if (typeof taskFunction === "string") {
      // Use safe predefined function
      functionName = taskFunction;
      args = options.args || [];
    } else {
      // Legacy support: recognize function based on contents
      const funcString = taskFunction.toString();

      // Try to recognize known function patterns
      if (funcString.includes("fibonacci")) functionName = "fibonacci";
      else if (
        funcString.includes("Math.sin") &&
        funcString.includes("Math.cos")
      )
        functionName = "heavyComputation";
      else if (
        funcString.includes("primeFactors") ||
        funcString.includes("factors")
      )
        functionName = "primeFactors";
      else if (funcString.includes("sort")) functionName = "sortNumbers";
      else if (
        funcString.includes("toUpperCase") ||
        funcString.includes("toLowerCase")
      )
        functionName = "processText";
      else if (funcString.includes("analyze") || funcString.includes("mean"))
        functionName = "analyzeData";
      else if (funcString.includes("batch") || funcString.includes("map"))
        functionName = "batchProcess";
      else {
        // Default to heavyComputation for unknown functions
        functionName = "heavyComputation";
        // Use console.warn as fallback since no logger available
        // eslint-disable-next-line no-console
        console.warn(
          "Unknown function pattern, defaulting to heavyComputation",
        );
      }
    }

    const task: IWorkerTask = {
      id: this.generateTaskId(),
      payload: {
        function: functionName,
        args: args,
      },
      priority: options.priority || WorkerTaskPriority.NORMAL,
      timeout: options.timeout || this.defaultPermissions.maxExecutionTime,
      retry: options.retry || 0,
      type: options.type || WorkerTaskType.COMPUTATION,
    };

    return this.executeTask<unknown, R>(task);
  }

  async runParallel<T>(
    taskFunction: string | (() => T),
    options: Partial<IWorkerTask> & { args?: unknown[] } = {},
  ): Promise<T> {
    return this.runTask<T, T>(taskFunction, options);
  }

  async runParallelBatch<T>(
    taskFunctions: (string | (() => T))[],
    options: Partial<IWorkerTask> & { args?: unknown[] } = {},
  ): Promise<T[]> {
    const tasks = taskFunctions.map((func) =>
      this.runTask<T, T>(func, options),
    );
    return Promise.all(tasks);
  }

  async executeTask<T, R>(task: IWorkerTask<T, R>): Promise<R> {
    if (!this._isInitialized) {
      throw new Error("WorkerManager not initialized");
    }

    const poolId = task.command
      ? this.getPoolIdForCommand(task.command)
      : this.defaultPoolId;
    const pool = this.pools.get(poolId);

    if (!pool) {
      throw new Error(`Worker pool '${poolId}' not found`);
    }

    this.emit("task-started", { taskId: task.id, poolId });

    try {
      const result = await pool.executeTask(task);
      this.emit("task-completed", { taskId: task.id, poolId });
      return result;
    } catch (error) {
      this.emit("task-failed", { taskId: task.id, poolId, error });
      throw error;
    }
  }

  async executeBatch<T, R>(
    tasks: IWorkerTask<T, R>[],
  ): Promise<IWorkerTaskResult<R>[]> {
    const promises = tasks.map(async (task): Promise<IWorkerTaskResult<R>> => {
      try {
        const result = await this.executeTask(task);
        return {
          id: task.id,
          success: true,
          result,
          executionTime: 0,
          workerId: "batch",
        };
      } catch (error) {
        return {
          id: task.id,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          executionTime: 0,
          workerId: "batch",
        };
      }
    });

    return Promise.all(promises);
  }

  async cancelTask(taskId: string): Promise<boolean> {
    for (const pool of this.pools.values()) {
      if (pool.cancelTask(taskId)) {
        this.emit("task-cancelled", { taskId });
        return true;
      }
    }
    return false;
  }

  getTaskStatus(taskId: string): WorkerTaskStatus | undefined {
    for (const pool of this.pools.values()) {
      const status = pool.getTaskStatus(taskId);
      if (status) return status;
    }
    return undefined;
  }

  listActiveTasks(): string[] {
    const tasks: string[] = [];
    // Implementation would collect all active task IDs here
    // for (const pool of this.pools.values()) {
    //   tasks.push(...pool.getActiveTaskIds());
    // }
    return tasks;
  }

  clearCompletedTasks(): void {
    this.emit("tasks-cleared");
  }

  getWorkerStatus(): IWorkerPool[] {
    return Array.from(this.pools.values());
  }

  getActiveWorkerCount(): number {
    return Array.from(this.pools.values()).reduce(
      (total, pool) => total + pool.activeWorkers,
      0,
    );
  }

  async terminateAllWorkers(): Promise<void> {
    const promises = Array.from(this.pools.values()).map((pool) =>
      pool.terminate(),
    );
    await Promise.all(promises);
  }

  setDefaultPermissions(permissions: IWorkerPermissions): void {
    this.defaultPermissions = { ...permissions };
  }

  getDefaultPermissions(): IWorkerPermissions {
    return { ...this.defaultPermissions };
  }

  private generateTaskId(): string {
    return `task-${++this.taskIdCounter}-${Date.now()}`;
  }

  private getWorkerScript(poolId: string): string {
    // URL to worker scripts
    switch (poolId) {
      case "command":
        return "/workers/CommandWorker.js";
      case "default":
      default:
        return "/workers/TaskWorker.js";
    }
  }

  private getPoolIdForCommand(command: string): string {
    // Determine pool based on command
    const commandPools: Record<string, string> = {
      grep: "command",
      find: "command",
      cat: "command",
      sort: "command",
      wc: "command",
    };

    return commandPools[command] || this.defaultPoolId;
  }
}

// Export singleton instance
export const workerManager = WorkerManager.getInstance();
