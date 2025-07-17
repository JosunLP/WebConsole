/**
 * Command Registry Interface
 */

import { ICommandHandler } from "./ICommandHandler.interface.js";

export interface ICommandRegistry {
  // Lifecycle
  initialize(): Promise<void>;

  register(handler: ICommandHandler): void;
  unregister(name: string): void;
  get(name: string): ICommandHandler | undefined;
  has(name: string): boolean;
  list(): string[];

  // Aliase
  alias(alias: string, command: string): void;
  unalias(alias: string): void;
  getAliases(): Record<string, string>;

  // Built-in Commands
  registerBuiltinCommands(vfs: any): void;
}
