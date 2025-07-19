/**
 * Command Worker for command-specific tasks
 */

import {
  IWorkerTask,
  WorkerTaskType,
} from "../interfaces/IWorkerTask.interface.js";
import {
  TaskResult,
  WorkerAbortError,
  WorkerTaskError,
} from "../types/worker.type.js";
import { generateMessageId } from "../utils/helpers.js";
import { RegexUtils } from "../utils/regexUtils.js";
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
 * CommandWorker - Executes command-specific tasks
 */
export class CommandWorker extends BaseWorker {
  private vfsProxy: VFSWorkerProxy | null = null;

  protected async processTask(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<TaskResult> {
    try {
      this.checkAborted(signal);

      switch (task.type) {
        case WorkerTaskType.COMMAND:
          return await this.executeCommand(task, signal);

        case WorkerTaskType.VFS_OPERATION:
          return await this.executeVFSOperation(task, signal);

        default:
          throw new WorkerTaskError(
            `Unsupported task type for CommandWorker: ${task.type}`,
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

  private async executeCommand(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<TaskResult> {
    try {
      this.checkAborted(signal);

      const payload = task.payload as CommandWorkerPayload;
      const { command, args, cwd } = payload;

      // Simulated command execution
      switch (command) {
        case "grep": {
          const result = await this.executeGrep(args, signal);
          return { success: true, data: result };
        }

        case "find": {
          const result = await this.executeFind(args, cwd, signal);
          return { success: true, data: result };
        }

        case "sort": {
          const result = await this.executeSort(
            args,
            payload.input || "",
            signal,
          );
          return { success: true, data: result };
        }

        case "wc": {
          const result = await this.executeWordCount(
            args,
            payload.input || "",
            signal,
          );
          return { success: true, data: result };
        }

        case "cat": {
          const result = await this.executeCat(args, signal);
          return { success: true, data: result };
        }

        default:
          throw new WorkerTaskError(
            `Command '${command}' not supported in worker`,
            task.id,
            "command",
          );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async executeVFSOperation(
    task: IWorkerTask,
    signal: AbortSignal,
  ): Promise<TaskResult> {
    try {
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
        case "read": {
          const result = await this.vfsProxy.readFile(payload.path);
          return { success: true, data: result };
        }

        case "write": {
          if (!payload.content) {
            throw new Error("Content required for write operation");
          }
          await this.vfsProxy.writeFile(payload.path, payload.content);
          return {
            success: true,
            data: { operation: "write", path: payload.path },
          };
        }

        case "exists": {
          const result = await this.vfsProxy.exists(payload.path);
          return { success: true, data: result };
        }

        case "readdir": {
          const result = await this.vfsProxy.readdir(payload.path);
          return { success: true, data: result };
        }

        default:
          throw new WorkerTaskError(
            `Unknown VFS operation: ${payload.operation}`,
            task.id,
            "vfs_operation",
          );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
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

    // Parse flags and get pattern/filename
    const flags = args.filter((arg) => arg.startsWith("-"));
    const nonFlagArgs = args.filter((arg) => !arg.startsWith("-"));

    if (nonFlagArgs.length < 2) {
      throw new Error("grep requires pattern and file arguments");
    }

    const pattern = nonFlagArgs[0];
    const fileName = nonFlagArgs[1];

    if (!pattern || !fileName) {
      throw new Error("Invalid grep arguments");
    }

    // Check for additional flags
    const caseInsensitive = flags.includes("-i");
    const literalMode = flags.includes("-F");

    // Simulate file reading and pattern matching
    if (this.vfsProxy && (await this.vfsProxy.exists(fileName))) {
      const content = await this.vfsProxy.readFile(fileName);

      // Use safe regex creation with validation
      let regex: RegExp;
      try {
        regex = RegexUtils.createSearchRegex(
          pattern,
          !caseInsensitive,
          literalMode,
        );
      } catch (error) {
        // If regex creation fails, fall back to literal search
        console.warn(
          `Invalid regex pattern '${pattern}', falling back to literal search:`,
          error,
        );
        regex = RegexUtils.createSearchRegex(pattern, !caseInsensitive, true);
      }

      return content
        .split("\n")
        .map((line, index) => ({ line, lineNumber: index + 1 }))
        .filter(({ line }) => regex.test(line))
        .map(({ line, lineNumber }) => `${lineNumber}: ${line}`);
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

    // Simulate file search
    if (this.vfsProxy) {
      try {
        const files = await this.vfsProxy.readdir(searchPath);

        // Use safe regex creation for filename patterns
        const regex = RegexUtils.createFilenameRegex(namePattern);

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
   * VFS proxy for worker communication with main thread
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

// Worker script for browser
if (
  typeof self !== "undefined" &&
  self.constructor.name === "DedicatedWorkerGlobalScope"
) {
  new CommandWorker();
}
