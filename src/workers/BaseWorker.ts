/**
 * Base Worker Class for Web Workers
 */

import {
  IWorkerTask,
  IWorkerTaskResult,
} from "../interfaces/IWorkerTask.interface.js";
import { generateWorkerId } from "../utils/helpers.js";

export interface WorkerMessage {
  type: "task" | "cancel" | "ping" | "terminate";
  data?: unknown;
  taskId?: string;
}

export interface WorkerResponse {
  type: "result" | "error" | "progress" | "pong";
  taskId?: string;
  data?: unknown;
  error?: string;
}

/**
 * Base Worker Implementation
 * Runs in worker thread
 */
export abstract class BaseWorker {
  private taskRegistry = new Map<string, AbortController>();
  private isTerminated = false;
  private readonly workerId: string;

  constructor() {
    // Generate worker ID once during initialization
    this.workerId = generateWorkerId();

    // Worker-side message handler
    self.addEventListener("message", this.handleMessage.bind(this));

    // Signal worker ready
    this.postResponse({ type: "pong" });
  }

  private async handleMessage(
    event: MessageEvent<WorkerMessage>,
  ): Promise<void> {
    const { type, data, taskId } = event.data;

    try {
      switch (type) {
        case "task":
          await this.executeTask(data as IWorkerTask, taskId!);
          break;

        case "cancel":
          this.cancelTask(taskId!);
          break;

        case "ping":
          this.postResponse({ type: "pong" });
          break;

        case "terminate":
          this.terminate();
          break;

        default:
          throw new Error(`Unknown message type: ${type}`);
      }
    } catch (error) {
      const response: WorkerResponse = {
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      };
      if (taskId) {
        response.taskId = taskId;
      }
      this.postResponse(response);
    }
  }

  private async executeTask(task: IWorkerTask, taskId: string): Promise<void> {
    if (this.isTerminated) {
      throw new Error("Worker is terminated");
    }

    const controller = new AbortController();
    this.taskRegistry.set(taskId, controller);

    const startTime = performance.now();

    try {
      // Timeout handler
      let timeoutId: number | undefined;
      if (task.timeout) {
        timeoutId = self.setTimeout(() => {
          controller.abort();
          this.postResponse({
            type: "error",
            taskId,
            error: `Task timeout after ${task.timeout}ms`,
          });
        }, task.timeout);
      }

      // Execute task
      const result = await this.processTask(task, controller.signal);

      if (timeoutId) {
        self.clearTimeout(timeoutId);
      }

      const executionTime = performance.now() - startTime;

      // Send success response
      this.postResponse({
        type: "result",
        taskId,
        data: {
          success: true,
          result,
          executionTime,
          workerId: this.workerId,
        } as IWorkerTaskResult,
      });
    } catch (error) {
      const executionTime = performance.now() - startTime;

      this.postResponse({
        type: "result",
        taskId,
        data: {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          executionTime,
          workerId: this.workerId,
        } as IWorkerTaskResult,
      });
    } finally {
      this.taskRegistry.delete(taskId);
    }
  }

  private cancelTask(taskId: string): void {
    const controller = this.taskRegistry.get(taskId);
    if (controller) {
      controller.abort();
      this.taskRegistry.delete(taskId);
    }
  }

  private terminate(): void {
    this.isTerminated = true;

    // Cancel all running tasks
    for (const controller of this.taskRegistry.values()) {
      controller.abort();
    }
    this.taskRegistry.clear();

    // Terminate worker
    self.close();
  }

  private postResponse(response: WorkerResponse): void {
    self.postMessage(response);
  }

  /**
   * Abstract method for task processing
   * Must be overridden by concrete worker implementations
   */
  protected abstract processTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown>;

  /**
   * Helper method for progress updates
   */
  protected reportProgress(
    taskId: string,
    progress: number,
    message?: string,
  ): void {
    this.postResponse({
      type: "progress",
      taskId,
      data: { progress, message },
    });
  }

  /**
   * Check if task was cancelled
   */
  protected checkAborted(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new Error("Task was cancelled");
    }
  }
}
