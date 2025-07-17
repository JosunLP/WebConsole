/**
 * Kernel - Zentrale Event- und Lebenszyklus-Steuerung (Singleton)
 */

import { ConsoleInstance } from "../console/index.js";
import { CommandRegistry } from "./CommandRegistry.js";
import { ComponentRegistry } from "./ComponentRegistry.js";
import { EventEmitter } from "./EventEmitter.js";
import { Logger } from "./Logger.js";
import { StateManager } from "./StateManager.js";
import { VFS } from "./VFS.js";

import type { ICommandRegistry } from "../interfaces/ICommandRegistry.interface.js";
import type { IComponentRegistry } from "../interfaces/IComponentRegistry.interface.js";
import type { IConsole } from "../interfaces/IConsole.interface.js";
import type { IConsoleOptions } from "../interfaces/IConsoleOptions.interface.js";
import type { IKernel } from "../interfaces/IKernel.interface.js";
import type { ILogger } from "../interfaces/ILogger.interface.js";
import type { IStateManager } from "../interfaces/IStateManager.interface.js";
import type { IThemeManager } from "../interfaces/IThemeManager.interface.js";
import type { IVFS } from "../interfaces/IVFS.interface.js";
import type { ID } from "../types/index.js";

import { KernelEvent } from "../enums/KernelEvent.enum.js";
import { PluginManager } from "../plugins/PluginManager.js";

export class Kernel extends EventEmitter implements IKernel {
  private static _instance: Kernel | null = null;

  public readonly version = "0.1.0";
  private _isStarted = false;

  // Subsystems
  private _vfs: IVFS;
  private _themeManager: IThemeManager | null = null;
  private _commandRegistry: ICommandRegistry;
  private _componentRegistry: IComponentRegistry;
  private _pluginManager: PluginManager;
  private _logger: ILogger;
  private _globalState: IStateManager;

  // Console Management
  private _consoles = new Map<ID, IConsole>();
  private _nextConsoleId = 0;

  private constructor() {
    super();

    this._logger = new Logger("Kernel");
    this._globalState = new StateManager("global");
    this._vfs = new VFS();
    this._commandRegistry = new CommandRegistry();
    this._componentRegistry = new ComponentRegistry();
    this._pluginManager = new PluginManager();

    this._logger.info("Kernel initialized");
  }

  public static getInstance(): Kernel {
    if (!Kernel._instance) {
      Kernel._instance = new Kernel();
    }
    return Kernel._instance;
  }

  public get isStarted(): boolean {
    return this._isStarted;
  }

  public async start(): Promise<void> {
    if (this._isStarted) {
      this._logger.warn("Kernel already started");
      return;
    }

    this._logger.info("Starting kernel...");

    try {
      // Initialize VFS
      await this._vfs.initialize();

      // Load global state
      await this._globalState.load();

      // Initialize command registry with built-ins
      await this._commandRegistry.initialize();

      // Inject VFS into command registry for VFS-dependent commands
      this._commandRegistry.registerBuiltinCommands(this._vfs);

      // Initialize component registry with built-in components
      await this._componentRegistry.registerBuiltInComponents();

      // Initialize theme manager
      const { ThemeManager } = await import("./ThemeManager.js");
      this._themeManager = new ThemeManager();
      this._themeManager.injectCSS();

      this._isStarted = true;
      this.emit(KernelEvent.STARTED);

      this._logger.info("Kernel started successfully");
    } catch (error) {
      this._logger.error("Failed to start kernel:", error);
      this.emit(KernelEvent.ERROR, error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this._isStarted) {
      return;
    }

    this._logger.info("Shutting down kernel...");

    try {
      // Destroy all consoles
      const consoleIds = Array.from(this._consoles.keys());
      await Promise.all(consoleIds.map((id) => this.destroyConsole(id)));

      // Save global state
      await this._globalState.save();

      // Cleanup subsystems
      if (this._themeManager) {
        this._themeManager.dispose();
      }

      this._isStarted = false;
      this.emit(KernelEvent.SHUTDOWN);

      this._logger.info("Kernel shutdown complete");
    } catch (error) {
      this._logger.error("Error during kernel shutdown:", error);
      this.emit(KernelEvent.ERROR, error);
      throw error;
    }
  }

  // Subsystem access
  public getVFS(): IVFS {
    return this._vfs;
  }

  public getThemeManager(): IThemeManager {
    if (!this._themeManager) {
      throw new Error("Theme manager not initialized");
    }
    return this._themeManager;
  }

  public getCommandRegistry(): ICommandRegistry {
    return this._commandRegistry;
  }

  public getComponentRegistry(): IComponentRegistry {
    return this._componentRegistry;
  }

  public getPluginManager(): PluginManager {
    return this._pluginManager;
  }

  public getLogger(): ILogger {
    return this._logger;
  }

  public getGlobalState(): IStateManager {
    return this._globalState;
  }

  // Console Management
  public async createConsole(
    options: Partial<IConsoleOptions> = {},
  ): Promise<IConsole> {
    if (!this._isStarted) {
      throw new Error("Kernel not started");
    }

    const id = `console-${this._nextConsoleId++}`;

    const defaultOptions: IConsoleOptions = {
      id,
      prompt: "$ ",
      cwd: "/home/user",
      env: new Map([
        ["PATH", "/usr/bin:/bin"],
        ["HOME", "/home/user"],
        ["USER", "user"],
      ]),
      history: {
        maxSize: 1000,
        persistent: true,
      },
      ...options,
    };

    try {
      const console = new ConsoleInstance(defaultOptions, this);
      await console.initialize();

      this._consoles.set(id, console);
      this.emit(KernelEvent.CONSOLE_CREATED, { id, console });

      this._logger.debug(`Console created: ${id}`);
      return console;
    } catch (error) {
      this._logger.error(`Failed to create console ${id}:`, error);
      throw error;
    }
  }

  public getConsole(id: ID): IConsole | undefined {
    return this._consoles.get(id);
  }

  public async destroyConsole(id: ID): Promise<void> {
    const console = this._consoles.get(id);
    if (!console) {
      return;
    }

    try {
      await console.destroy();
      this._consoles.delete(id);
      this.emit(KernelEvent.CONSOLE_DESTROYED, { id });

      this._logger.debug(`Console destroyed: ${id}`);
    } catch (error) {
      this._logger.error(`Failed to destroy console ${id}:`, error);
      throw error;
    }
  }

  public listConsoles(): ID[] {
    return Array.from(this._consoles.keys());
  }
}

// Export singleton instance
export const kernel = Kernel.getInstance();
