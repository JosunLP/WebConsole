/**
 * Standard Task Worker für allgemeine Berechnungen
 */

import { BaseWorker } from "./BaseWorker.js";
import { IWorkerTask, WorkerTaskType } from "../interfaces/IWorkerTask.interface.js";

/**
 * TaskWorker - Führt allgemeine JavaScript-Tasks aus
 */
export class TaskWorker extends BaseWorker {
  protected async processTask(task: IWorkerTask, signal: AbortSignal): Promise<unknown> {
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

  private async executeComputation(task: IWorkerTask, signal: AbortSignal): Promise<unknown> {
    const { payload } = task;
    
    if (typeof payload === 'object' && payload && 'function' in payload) {
      // Serialisierte Funktion ausführen
      const functionString = payload.function as string;
      const args = (payload as { args?: unknown[] }).args || [];
      
      // Sichere Funktion-Ausführung
      const func = new Function('args', 'signal', `
        return (${functionString}).apply(null, [args, signal]);
      `);
      
      return await func(args, signal);
    }
    
    // Standard-Payload-Verarbeitung
    return payload;
  }

  private async processFile(task: IWorkerTask, signal: AbortSignal): Promise<unknown> {
    this.checkAborted(signal);
    
    const { payload } = task;
    
    if (typeof payload === 'object' && payload && 'fileData' in payload && 'operation' in payload) {
      const filePayload = payload as { fileData: string; operation: string };
      
      switch (filePayload.operation) {
        case 'parse':
          return this.parseFileContent(filePayload.fileData, signal);
          
        case 'validate':
          return this.validateFileContent(filePayload.fileData, signal);
          
        case 'transform':
          return this.transformFileContent(filePayload.fileData, signal);
          
        default:
          throw new Error(`Unknown file operation: ${filePayload.operation}`);
      }
    }
    
    throw new Error('Invalid file processing payload');
  }

  private async executeCustomTask(task: IWorkerTask, signal: AbortSignal): Promise<unknown> {
    this.checkAborted(signal);
    
    // Custom Task Execution
    // Kann von Plugin-System erweitert werden
    return task.payload;
  }

  private async parseFileContent(content: string, signal: AbortSignal): Promise<unknown> {
    this.checkAborted(signal);
    
    // Beispiel: JSON-Parsing
    try {
      return JSON.parse(content);
    } catch {
      // Fallback: Line-by-line parsing
      return content.split('\n').map((line, index) => ({
        line: index + 1,
        content: line.trim()
      }));
    }
  }

  private async validateFileContent(content: string, signal: AbortSignal): Promise<{ valid: boolean; errors: string[] }> {
    this.checkAborted(signal);
    
    const errors: string[] = [];
    
    // Basis-Validierungen
    if (content.length === 0) {
      errors.push('File is empty');
    }
    
    if (content.length > 1024 * 1024) {
      errors.push('File is too large (>1MB)');
    }
    
    // JSON-Validierung falls anwendbar
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        JSON.parse(content);
      } catch (error) {
        errors.push(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async transformFileContent(content: string, signal: AbortSignal): Promise<string> {
    this.checkAborted(signal);
    
    // Basis-Transformationen
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
}

// Worker-Script für Browser
if (typeof self !== 'undefined' && self.constructor.name === 'DedicatedWorkerGlobalScope') {
  new TaskWorker();
}
