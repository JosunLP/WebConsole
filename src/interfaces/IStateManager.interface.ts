/**
 * State Manager Interface
 */

import { StateConfig } from "../types/index.js";

import { IEventEmitter } from "./IEventEmitter.interface.js";

export interface IStateManager extends IEventEmitter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  keys(): string[];

  // Configuration for keys
  configure<T>(config: StateConfig<T>): void;

  // Namespaces
  namespace(name: string): IStateManager;

  // Persistence
  persist(): Promise<void>;
  restore(): Promise<void>;
  load(): Promise<void>;
  save(): Promise<void>;
}
