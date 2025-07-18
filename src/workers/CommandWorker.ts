/**
 * Command Worker für Command-spezifische Tasks
 */

import {
  IWorkerTask,
  WorkerTaskType,
} from "../interfaces/IWorkerTask.interface.js";
import { generateMessageId } from "../utils/helpers.js";
import { BaseWorker } from "./BaseWorker.js";

export interface CommandWorkerPayload {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  input?: string;
}

export interface VFSWorkerProxy {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readdir(path: string): Promise<string[]>;
}

/**
 * CommandWorker - Führt Command-spezifische Tasks aus
 */
export class CommandWorker extends BaseWorker {
  private vfsProxy: VFSWorkerProxy | null = null;

  protected async processTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    switch (task.type) {
      case WorkerTaskType.COMMAND:
        return this.executeCommand(task, signal);

      case WorkerTaskType.VFS_OPERATION:
        return this.executeVFSOperation(task, signal);

      default:
        throw new Error(
          `Unsupported task type for CommandWorker: ${task.type}`,
        );
    }
  }

  private async executeCommand(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    const payload = task.payload as CommandWorkerPayload;
    const { command, args, cwd } = payload;

    // Simulierte Command-Ausführung
    switch (command) {
      case "grep":
        return this.executeGrep(args, signal);

      case "find":
        return this.executeFind(args, cwd, signal);

      case "sort":
        return this.executeSort(args, payload.input || "", signal);

      case "wc":
        return this.executeWordCount(args, payload.input || "", signal);

      case "cat":
        return this.executeCat(args, signal);

      default:
        throw new Error(`Command '${command}' not supported in worker`);
    }
  }

  private async executeVFSOperation(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<unknown> {
    this.checkAborted(signal);

    if (!this.vfsProxy) {
      throw new Error("VFS proxy not available");
    }

    const payload = task.payload as {
      operation: string;
      path: string;
      content?: string;
    };

    switch (payload.operation) {
      case "read":
        return this.vfsProxy.readFile(payload.path);

      case "write":
        if (!payload.content) {
          throw new Error("Content required for write operation");
        }
        await this.vfsProxy.writeFile(payload.path, payload.content);
        return { success: true };

      case "exists":
        return this.vfsProxy.exists(payload.path);

      case "readdir":
        return this.vfsProxy.readdir(payload.path);

      default:
        throw new Error(`Unknown VFS operation: ${payload.operation}`);
    }
  }

  private async executeGrep(
    args: string[],
    signal: AbortSignal,
  ): Promise<string[]> {
    this.checkAborted(signal);

    if (args.length < 2) {
      throw new Error("grep requires pattern and file arguments");
    }

    const pattern = args[0];
    const fileName = args[1];

    if (!pattern || !fileName) {
      throw new Error("Invalid grep arguments");
    }

    // Simuliere Datei-Lesen und Pattern-Matching
    if (this.vfsProxy && (await this.vfsProxy.exists(fileName))) {
      const content = await this.vfsProxy.readFile(fileName);
      const regex = new RegExp(pattern, "gi");

      return content
        .split("\n")
        .filter((line) => regex.test(line))
        .map((line, index) => `${index + 1}: ${line}`);
    }

    return [];
  }

  private async executeFind(
    args: string[],
    cwd: string,
    signal: AbortSignal,
  ): Promise<string[]> {
    this.checkAborted(signal);

    const searchPath = args[0] || cwd;
    const nameIndex = args.indexOf("-name");
    const namePattern =
      nameIndex >= 0 && nameIndex + 1 < args.length ? args[nameIndex + 1] : "*";

    if (!namePattern) {
      return [];
    }

    // Simuliere Datei-Suche
    if (this.vfsProxy) {
      try {
        const files = await this.vfsProxy.readdir(searchPath);
        const regex = new RegExp(namePattern.replace(/\*/g, ".*"), "i");

        return files.filter((file) => regex.test(file));
      } catch {
        return [];
      }
    }

    return [];
  }

  private async executeSort(
    args: string[],
    input: string,
    signal: AbortSignal,
  ): Promise<string[]> {
    this.checkAborted(signal);

    const lines = input.split("\n").filter((line) => line.length > 0);
    const reverse = args.includes("-r");
    const numeric = args.includes("-n");

    if (numeric) {
      lines.sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return reverse ? numB - numA : numA - numB;
      });
    } else {
      lines.sort((a, b) => (reverse ? b.localeCompare(a) : a.localeCompare(b)));
    }

    return lines;
  }

  private async executeWordCount(
    args: string[],
    input: string,
    signal: AbortSignal,
  ): Promise<{ lines: number; words: number; characters: number }> {
    this.checkAborted(signal);

    const lines = input.split("\n").length;
    const words = input.split(/\s+/).filter((word) => word.length > 0).length;
    const characters = input.length;

    return { lines, words, characters };
  }

  private async executeCat(
    args: string[],
    signal: AbortSignal,
  ): Promise<string> {
    this.checkAborted(signal);

    if (!this.vfsProxy) {
      throw new Error("VFS proxy not available");
    }

    let result = "";

    for (const fileName of args) {
      this.checkAborted(signal);

      if (await this.vfsProxy.exists(fileName)) {
        const content = await this.vfsProxy.readFile(fileName);
        result += content + "\n";
      } else {
        throw new Error(`File not found: ${fileName}`);
      }
    }

    return result.trim();
  }

  /**
   * VFS-Proxy für Worker-Kommunikation mit Hauptthread
   */
  private initializeVFSProxy(): void {
    this.vfsProxy = {
      readFile: async (path: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const messageId = generateMessageId();

          const handler = (event: MessageEvent) => {
            if (event.data.id === messageId) {
              self.removeEventListener("message", handler);
              if (event.data.error) {
                reject(new Error(event.data.error));
              } else {
                resolve(event.data.result);
              }
            }
          };

          self.addEventListener("message", handler);
          self.postMessage({
            type: "vfs-request",
            id: messageId,
            operation: "readFile",
            path,
          });
        });
      },

      writeFile: async (path: string, content: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const messageId = generateMessageId();

          const handler = (event: MessageEvent) => {
            if (event.data.id === messageId) {
              self.removeEventListener("message", handler);
              if (event.data.error) {
                reject(new Error(event.data.error));
              } else {
                resolve();
              }
            }
          };

          self.addEventListener("message", handler);
          self.postMessage({
            type: "vfs-request",
            id: messageId,
            operation: "writeFile",
            path,
            content,
          });
        });
      },

      exists: async (path: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
          const messageId = generateMessageId();

          const handler = (event: MessageEvent) => {
            if (event.data.id === messageId) {
              self.removeEventListener("message", handler);
              if (event.data.error) {
                reject(new Error(event.data.error));
              } else {
                resolve(event.data.result);
              }
            }
          };

          self.addEventListener("message", handler);
          self.postMessage({
            type: "vfs-request",
            id: messageId,
            operation: "exists",
            path,
          });
        });
      },

      readdir: async (path: string): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const messageId = generateMessageId();

          const handler = (event: MessageEvent) => {
            if (event.data.id === messageId) {
              self.removeEventListener("message", handler);
              if (event.data.error) {
                reject(new Error(event.data.error));
              } else {
                resolve(event.data.result);
              }
            }
          };

          self.addEventListener("message", handler);
          self.postMessage({
            type: "vfs-request",
            id: messageId,
            operation: "readdir",
            path,
          });
        });
      },
    };
  }

  constructor() {
    super();
    this.initializeVFSProxy();
  }
}

// Worker-Script für Browser
if (
  typeof self !== "undefined" &&
  self.constructor.name === "DedicatedWorkerGlobalScope"
) {
  new CommandWorker();
}
