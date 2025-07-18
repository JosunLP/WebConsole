/**
 * Base Worker Class für Web Workers
 */

import { 
  IWorkerTask, 
  IWorkerTaskResult
} from "../interfaces/IWorkerTask.interface.js";

export interface WorkerMessage {
  type: 'task' | 'cancel' | 'ping' | 'terminate';
  data?: unknown;
  taskId?: string;
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress' | 'pong';
  taskId?: string;
  data?: unknown;
  error?: string;
}

/**
 * Base Worker Implementation
 * Läuft im Worker-Thread
 */
export abstract class BaseWorker {
  private taskRegistry = new Map<string, AbortController>();
  private isTerminated = false;

  constructor() {
    // Worker-seitige Message-Handler
    self.addEventListener('message', this.handleMessage.bind(this));
    
    // Worker bereit signalisieren
    this.postResponse({ type: 'pong' });
  }

  private async handleMessage(event: MessageEvent<WorkerMessage>): Promise<void> {
    const { type, data, taskId } = event.data;

    try {
      switch (type) {
        case 'task':
          await this.executeTask(data as IWorkerTask, taskId!);
          break;
          
        case 'cancel':
          this.cancelTask(taskId!);
          break;
          
        case 'ping':
          this.postResponse({ type: 'pong' });
          break;
          
        case 'terminate':
          this.terminate();
          break;
          
        default:
          throw new Error(`Unknown message type: ${type}`);
      }
    } catch (error) {
      this.postResponse({
        type: 'error',
        taskId: taskId || undefined,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async executeTask(task: IWorkerTask, taskId: string): Promise<void> {
    if (this.isTerminated) {
      throw new Error('Worker is terminated');
    }

    const controller = new AbortController();
    this.taskRegistry.set(taskId, controller);

    const startTime = performance.now();

    try {
      // Timeout-Handler
      let timeoutId: number | undefined;
      if (task.timeout) {
        timeoutId = self.setTimeout(() => {
          controller.abort();
          this.postResponse({
            type: 'error',
            taskId,
            error: `Task timeout after ${task.timeout}ms`
          });
        }, task.timeout);
      }

      // Task ausführen
      const result = await this.processTask(task, controller.signal);
      
      if (timeoutId) {
        self.clearTimeout(timeoutId);
      }

      const executionTime = performance.now() - startTime;

      // Erfolg zurücksenden
      this.postResponse({
        type: 'result',
        taskId,
        data: {
          success: true,
          result,
          executionTime,
          workerId: 'worker-' + Math.random().toString(36).substr(2, 9)
        } as IWorkerTaskResult
      });

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      this.postResponse({
        type: 'result',
        taskId,
        data: {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          executionTime,
          workerId: 'worker-' + Math.random().toString(36).substr(2, 9)
        } as IWorkerTaskResult
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
    
    // Alle laufenden Tasks abbrechen
    for (const controller of this.taskRegistry.values()) {
      controller.abort();
    }
    this.taskRegistry.clear();
    
    // Worker beenden
    self.close();
  }

  private postResponse(response: WorkerResponse): void {
    self.postMessage(response);
  }

  /**
   * Abstrakte Methode zur Task-Verarbeitung
   * Muss von konkreten Worker-Implementierungen überschrieben werden
   */
  protected abstract processTask(task: IWorkerTask, signal: AbortSignal): Promise<unknown>;

  /**
   * Hilfsmethode für Progress-Updates
   */
  protected reportProgress(taskId: string, progress: number, message?: string): void {
    this.postResponse({
      type: 'progress',
      taskId,
      data: { progress, message }
    });
  }

  /**
   * Prüft ob Task abgebrochen wurde
   */
  protected checkAborted(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new Error('Task was cancelled');
    }
  }
}
