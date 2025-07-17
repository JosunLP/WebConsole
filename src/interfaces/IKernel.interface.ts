/**
 * Kernel Interface (Singleton)
 */

import { ID } from '../types/index.js';

import { ICommandRegistry } from './ICommandRegistry.interface.js';
import { IConsole } from './IConsole.interface.js';
import { IConsoleOptions } from './IConsoleOptions.interface.js';
import { IEventEmitter } from './IEventEmitter.interface.js';
import { ILogger } from './ILogger.interface.js';
import { IStateManager } from './IStateManager.interface.js';
import { IThemeManager } from './IThemeManager.interface.js';
import { IVFS } from './IVFS.interface.js';

export interface IKernel extends IEventEmitter {
  readonly version: string;
  readonly isStarted: boolean;

  // Lifecycle
  start(): Promise<void>;
  shutdown(): Promise<void>;

  // Subsystems
  getVFS(): IVFS;
  getThemeManager(): IThemeManager;
  getCommandRegistry(): ICommandRegistry;
  getLogger(): ILogger;

  // Console Management
  createConsole(options?: Partial<IConsoleOptions>): Promise<IConsole>;
  getConsole(id: ID): IConsole | undefined;
  destroyConsole(id: ID): Promise<void>;
  listConsoles(): ID[];

  // Global State
  getGlobalState(): IStateManager;
}
