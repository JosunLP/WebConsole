/**
 * Basis-Klasse für Built-in Commands
 */

import { ICommandHandler } from "../interfaces/index.js";
import { IWorkerTask, WorkerTaskType, WorkerTaskPriority } from "../interfaces/IWorkerTask.interface.js";

import { CommandContext, Path } from "../types/index.js";

import { CommandType, ExitCode } from "../enums/index.js";
import { kernel } from "../core/Kernel.js";

/**
 * Abstrakte Basis-Klasse für Commands
 */
export abstract class BaseCommand implements ICommandHandler {
  public readonly type = CommandType.BUILTIN;

  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly usage: string,
  ) {}

  /**
   * Command ausführen (muss von Subklassen implementiert werden)
   */
  abstract execute(context: CommandContext): Promise<ExitCode>;

  /**
   * Hilfe-Text ausgeben
   */
  protected async outputHelp(context: CommandContext): Promise<void> {
    const helpText = `${this.name} - ${this.description}\n\nUsage: ${this.usage}\n`;
    await this.writeToStdout(context, helpText);
  }

  /**
   * Text zu stdout schreiben
   */
  protected async writeToStdout(
    context: CommandContext,
    text: string,
  ): Promise<void> {
    const writer = context.stdout.getWriter();
    try {
      await writer.write(new TextEncoder().encode(text));
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Text zu stderr schreiben
   */
  protected async writeToStderr(
    context: CommandContext,
    text: string,
  ): Promise<void> {
    const writer = context.stderr.getWriter();
    try {
      await writer.write(new TextEncoder().encode(text));
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Fehler ausgeben und Error-Code zurückgeben
   */
  protected async outputError(
    context: CommandContext,
    message: string,
  ): Promise<ExitCode> {
    await this.writeToStderr(context, `${this.name}: ${message}\n`);
    return ExitCode.ERROR;
  }

  /**
   * Prüft ob Help-Flag gesetzt ist
   */
  protected hasHelpFlag(context: CommandContext): boolean {
    return context.args.includes("--help") || context.args.includes("-h");
  }

  /**
   * Pfad relativ zum Working Directory auflösen
   */
  protected resolvePath(context: CommandContext, path: string): Path {
    if (path.startsWith("/")) {
      return path; // Absoluter Pfad
    }

    // Relativer Pfad zum Working Directory
    const cwd = context.workingDirectory.endsWith("/")
      ? context.workingDirectory
      : context.workingDirectory + "/";

    return cwd + path;
  }

  /**
   * Environment-Variable abrufen
   */
  protected getEnvVar(
    context: CommandContext,
    name: string,
    defaultValue = "",
  ): string {
    return context.environment[name] || defaultValue;
  }

  /**
   * Argumente parsen und Flags extrahieren
   */
  protected parseArgs(context: CommandContext): {
    flags: Set<string>;
    options: Map<string, string>;
    positional: string[];
  } {
    const flags = new Set<string>();
    const options = new Map<string, string>();
    const positional: string[] = [];

    for (let i = 0; i < context.args.length; i++) {
      const arg = context.args[i];

      if (!arg) continue; // Skip undefined args

      if (arg.startsWith("--")) {
        // Long option
        const equalIndex = arg.indexOf("=");
        if (equalIndex > 0) {
          // --option=value
          const key = arg.substring(2, equalIndex);
          const value = arg.substring(equalIndex + 1);
          options.set(key, value);
        } else {
          // --flag or --option value
          const key = arg.substring(2);
          const nextArg = context.args[i + 1];

          if (nextArg && !nextArg.startsWith("-")) {
            // --option value
            options.set(key, nextArg);
            i++; // Skip next argument
          } else {
            // --flag
            flags.add(key);
          }
        }
      } else if (arg.startsWith("-") && arg.length > 1) {
        // Short option(s)
        const chars = arg.substring(1);

        // Könnte mehrere Flags sein: -abc = -a -b -c
        for (const char of chars) {
          flags.add(char);
        }
      } else {
        // Positional argument
        positional.push(arg);
      }
    }

    return { flags, options, positional };
  }

  /**
   * Standardmäßige Validierung für Command-Argumente
   */
  protected validateArgs(
    context: CommandContext,
    minArgs = 0,
    maxArgs = Infinity,
  ): ExitCode | null {
    if (context.args.length < minArgs) {
      this.outputError(
        context,
        `Too few arguments. Expected at least ${minArgs}.`,
      );
      return ExitCode.MISUSE;
    }

    if (context.args.length > maxArgs) {
      this.outputError(
        context,
        `Too many arguments. Expected at most ${maxArgs}.`,
      );
      return ExitCode.MISUSE;
    }

    return null; // Validation passed
  }

  /**
   * Bytes in menschenlesbare Größe formatieren
   */
  protected formatFileSize(bytes: number): string {
    const units = ["B", "K", "M", "G", "T"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return unitIndex === 0
      ? `${size}${units[unitIndex]}`
      : `${size.toFixed(1)}${units[unitIndex]}`;
  }

  /**
   * Permissions in rwx-Format formatieren
   */
  protected formatPermissions(permissions: number): string {
    const perms = permissions.toString(8).padStart(3, "0");
    let result = "";

    for (const digit of perms) {
      const num = parseInt(digit, 10);
      result += num & 4 ? "r" : "-";
      result += num & 2 ? "w" : "-";
      result += num & 1 ? "x" : "-";
    }

    return result;
  }

  /**
   * Datum formatieren
   */
  protected formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isThisYear) {
      // Innerhalb des aktuellen Jahres: "Jan 15 14:30"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      // Anderes Jahr: "Jan 15  2023"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  /**
   * ANSI-Farbcodes für Terminal-Output
   */
  protected static readonly COLORS = {
    RESET: "\x1b[0m",
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",

    // Vordergrundfarben
    BLACK: "\x1b[30m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m",

    // Helle Vordergrundfarben
    BRIGHT_BLACK: "\x1b[90m",
    BRIGHT_RED: "\x1b[91m",
    BRIGHT_GREEN: "\x1b[92m",
    BRIGHT_YELLOW: "\x1b[93m",
    BRIGHT_BLUE: "\x1b[94m",
    BRIGHT_MAGENTA: "\x1b[95m",
    BRIGHT_CYAN: "\x1b[96m",
    BRIGHT_WHITE: "\x1b[97m",
  };

  /**
   * Text mit Farbe formatieren
   */
  protected colorize(text: string, color: string): string {
    return `${color}${text}${BaseCommand.COLORS.RESET}`;
  }

  /**
   * Task in Worker ausführen
   */
  protected async runInWorker<T, R>(
    payload: T,
    options: {
      command?: string;
      priority?: WorkerTaskPriority;
      timeout?: number;
      type?: WorkerTaskType;
    } = {}
  ): Promise<R> {
    if (!kernel.isStarted) {
      throw new Error("Kernel not started - cannot execute worker tasks");
    }

    const workerManager = kernel.getWorkerManager();
    
    const task: IWorkerTask<T, R> = {
      id: this.generateTaskId(),
      payload,
      priority: options.priority || WorkerTaskPriority.NORMAL,
      timeout: options.timeout || 30000, // 30 Sekunden default
      command: options.command || this.name,
      type: options.type || WorkerTaskType.COMMAND
    };

    return workerManager.executeTask(task);
  }

  /**
   * Vereinfachte Worker-Ausführung für Command-spezifische Tasks
   */
  protected async runCommandInWorker<T>(
    taskFunction: () => T,
    options: {
      priority?: WorkerTaskPriority;
      timeout?: number;
    } = {}
  ): Promise<T> {
    if (!kernel.isStarted) {
      throw new Error("Kernel not started - cannot execute worker tasks");
    }

    const workerManager = kernel.getWorkerManager();
    return workerManager.runTask<T, T>(taskFunction, {
      priority: options.priority || WorkerTaskPriority.NORMAL,
      timeout: options.timeout || 30000,
      command: this.name,
      type: WorkerTaskType.COMMAND
    });
  }

  /**
   * Parallel ausgeführte Command-Tasks
   */
  protected async runParallelCommands<T>(
    taskFunctions: (() => T)[],
    options: {
      priority?: WorkerTaskPriority;
      timeout?: number;
    } = {}
  ): Promise<T[]> {
    if (!kernel.isStarted) {
      throw new Error("Kernel not started - cannot execute worker tasks");
    }

    const workerManager = kernel.getWorkerManager();
    return workerManager.runParallelBatch(taskFunctions, {
      priority: options.priority || WorkerTaskPriority.NORMAL,
      timeout: options.timeout || 30000,
      command: this.name,
      type: WorkerTaskType.COMMAND
    });
  }

  /**
   * Task-ID generieren
   */
  private generateTaskId(): string {
    return `${this.name}-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
