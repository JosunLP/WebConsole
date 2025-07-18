/**
 * Console Instance - Einzelne Konsole mit Parser, Lexer und Executor
 */

import { EventEmitter } from "../core/EventEmitter.js";
import { StateManager } from "../core/StateManager.js";

import type { IConsole } from "../interfaces/IConsole.interface.js";
import type { IConsoleOptions } from "../interfaces/IConsoleOptions.interface.js";
import type { IKernel } from "../interfaces/IKernel.interface.js";
import type { IStateManager } from "../interfaces/IStateManager.interface.js";
import type { CommandResult, Environment, ID, Path } from "../types/index.js";

import { ConsoleEvent } from "../enums/ConsoleEvent.enum.js";
import { ExitCode } from "../enums/ExitCode.enum.js";

export class ConsoleInstance extends EventEmitter implements IConsole {
  private readonly _id: ID;
  private readonly _kernel: IKernel;
  private readonly _options: IConsoleOptions;

  private _cwd: Path;
  private _env: Map<string, string>;
  private _prompt: string;
  private _history: string[] = [];
  private _state: IStateManager;

  private _isRunning = false;
  private _currentOutput?: Uint8Array;
  private _currentError?: Uint8Array;

  constructor(options: IConsoleOptions, kernel: IKernel) {
    super();

    this._id = options.id;
    this._kernel = kernel;
    this._options = options;

    this._cwd = options.cwd || options.workingDirectory || "/home/user";
    this._env = new Map(options.env || []);
    this._prompt = options.prompt || "$ ";

    // Erstelle Console-spezifischen State
    this._state = new StateManager(`console-${this._id}`);
  }

  public get id(): ID {
    return this._id;
  }

  public get workingDirectory(): Path {
    return this._cwd;
  }

  public get environment(): Environment {
    const env: Environment = {};
    for (const [key, value] of this._env) {
      env[key] = value;
    }
    return env;
  }

  public get history(): string[] {
    return [...this._history];
  }

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public async initialize(): Promise<void> {
    try {
      // Lade persistierten State falls vorhanden
      if (
        this._options.enablePersistence ||
        this._options.history?.persistent
      ) {
        const savedHistory = this._state.get<string[]>("history");
        if (savedHistory) {
          this._history = savedHistory;
        }

        const savedCwd = this._state.get<Path>("cwd");
        if (savedCwd) {
          this._cwd = savedCwd;
        }

        const savedEnv = this._state.get<Array<[string, string]>>("env");
        if (savedEnv) {
          this._env = new Map(savedEnv);
        }
      }

      this.emit(ConsoleEvent.READY);
      this._kernel.getLogger().debug(`Console ${this._id} initialized`);
    } catch (error) {
      this._kernel
        .getLogger()
        .error(`Failed to initialize console ${this._id}:`, error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    try {
      // Speichere State falls Persistenz aktiviert
      if (
        this._options.enablePersistence ||
        this._options.history?.persistent
      ) {
        this._state.set("history", this._history);
        this._state.set("cwd", this._cwd);
        this._state.set("env", Array.from(this._env.entries()));
      }

      // Cleanup
      this.removeAllListeners();
      this._isRunning = false;

      this.emit(ConsoleEvent.DESTROYED);
      this._kernel.getLogger().debug(`Console ${this._id} destroyed`);
    } catch (error) {
      this._kernel
        .getLogger()
        .error(`Failed to destroy console ${this._id}:`, error);
      throw error;
    }
  }

  public async execute(command: string): Promise<CommandResult> {
    if (!command.trim()) {
      return {
        exitCode: ExitCode.SUCCESS,
        stdout: new Uint8Array(),
        stderr: new Uint8Array(),
        executionTime: 0,
      };
    }

    const startTime = performance.now();

    try {
      this._isRunning = true;
      this.emit(ConsoleEvent.COMMAND_START, { input: command });

      // Add to history
      this._addToHistory(command);

      // Parse and execute the command
      const result = await this._executeCommand(command);

      this.emit(ConsoleEvent.COMMAND_END, { input: command, result });
      return result;
    } catch (error) {
      this._kernel
        .getLogger()
        .error(`Command execution failed: ${command}`, error);
      this.emit(ConsoleEvent.COMMAND_ERROR, { input: command, error });

      const errorMsg = error instanceof Error ? error.message : String(error);
      const stderr = new TextEncoder().encode(`Error: ${errorMsg}\n`);

      return {
        exitCode: ExitCode.GENERAL_ERROR,
        stdout: new Uint8Array(),
        stderr,
        executionTime: performance.now() - startTime,
      };
    } finally {
      this._isRunning = false;
    }
  }

  public async changeDirectory(path: Path): Promise<void> {
    // Validation via VFS
    const vfs = this._kernel.getVFS();
    if (!vfs.exists(path)) {
      throw new Error(`Directory does not exist: ${path}`);
    }

    this._cwd = path;
    this.emit(ConsoleEvent.CWD_CHANGED, { cwd: this._cwd });
  }

  public setEnvironment(key: string, value: string): void {
    this._env.set(key, value);
    this.emit(ConsoleEvent.ENV_CHANGED, { key, value });
  }

  public getEnvironment(key?: string): string | Environment {
    if (key) {
      return this._env.get(key) || "";
    }
    return this.environment;
  }

  public unsetEnvironment(key: string): void {
    this._env.delete(key);
    this.emit(ConsoleEvent.ENV_CHANGED, { key, value: undefined });
  }

  public clearHistory(): void {
    this._history = [];
    this.emit(ConsoleEvent.HISTORY_CLEARED);
  }

  public addToHistory(command: string): void {
    this._addToHistory(command);
  }

  public getState(): IStateManager {
    return this._state;
  }

  private _addToHistory(input: string): void {
    this._history.push(input);

    const maxSize =
      this._options.maxHistorySize || this._options.history?.maxSize || 1000;
    if (this._history.length > maxSize) {
      this._history = this._history.slice(-maxSize);
    }

    this.emit(ConsoleEvent.HISTORY_UPDATED, { history: this.history });
  }

  private async _executeCommand(command: string): Promise<CommandResult> {
    const startTime = performance.now();

    // Parse den Command
    const commandParts = command.trim().split(/\s+/);
    const commandName = commandParts[0];

    if (!commandName) {
      return {
        exitCode: ExitCode.SUCCESS,
        stdout: new Uint8Array(),
        stderr: new Uint8Array(),
        executionTime: performance.now() - startTime,
      };
    }

    const args = commandParts.slice(1);

    // Hole den Command Handler
    const commandRegistry = this._kernel.getCommandRegistry();
    const handler = commandRegistry.get(commandName);

    if (!handler) {
      const stderr = new TextEncoder().encode(
        `Command not found: ${commandName}\n`,
      );
      return {
        exitCode: ExitCode.GENERAL_ERROR,
        stdout: new Uint8Array(),
        stderr,
        executionTime: performance.now() - startTime,
      };
    }

    // Reset output buffers
    this._currentOutput = new Uint8Array();
    this._currentError = new Uint8Array();

    // Create synchronous streams for simple outputs
    const context = {
      args,
      environment: this.environment,
      workingDirectory: this._cwd,
      stdin: new ReadableStream(),
      stdout: new WritableStream({
        write: (chunk) => {
          const combined = new Uint8Array(
            (this._currentOutput?.length || 0) + chunk.length,
          );
          if (this._currentOutput) {
            combined.set(this._currentOutput);
            combined.set(chunk, this._currentOutput.length);
          } else {
            combined.set(chunk);
          }
          this._currentOutput = combined;
          return Promise.resolve();
        },
      }),
      stderr: new WritableStream({
        write: (chunk) => {
          const combined = new Uint8Array(
            (this._currentError?.length || 0) + chunk.length,
          );
          if (this._currentError) {
            combined.set(this._currentError);
            combined.set(chunk, this._currentError.length);
          } else {
            combined.set(chunk);
          }
          this._currentError = combined;
          return Promise.resolve();
        },
      }),
      vfs: this._kernel.getVFS(),
      state: this._state,
    };

    try {
      // Execute the command
      const exitCode = await handler.execute(context);

      return {
        exitCode,
        stdout: this._currentOutput || new Uint8Array(),
        stderr: this._currentError || new Uint8Array(),
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const stderr = new TextEncoder().encode(
        `Error executing command: ${errorMessage}\n`,
      );

      return {
        exitCode: ExitCode.GENERAL_ERROR,
        stdout: this._currentOutput || new Uint8Array(),
        stderr,
        executionTime: performance.now() - startTime,
      };
    }
  }
}
