/**
 * Console Interface (Hauptklasse)
 */

import { CommandResult, Environment, ID, Path } from "../types/index.js";

import { IEventEmitter } from "./IEventEmitter.interface.js";
import { IStateManager } from "./IStateManager.interface.js";

export interface IConsole extends IEventEmitter {
  readonly id: ID;
  readonly workingDirectory: Path;
  readonly environment: Environment;
  readonly history: string[];

  // Execution
  execute(command: string): Promise<CommandResult>;

  // Directory Operations
  changeDirectory(path: Path): Promise<void>;

  // Environment
  setEnvironment(key: string, value: string): void;
  getEnvironment(key?: string): string | Environment;
  unsetEnvironment(key: string): void;

  // History
  addToHistory(command: string): void;
  clearHistory(): void;

  // State
  getState(): IStateManager;

  // Lifecycle
  destroy(): Promise<void>;
}
