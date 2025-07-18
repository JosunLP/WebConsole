/**
 * Command Registry for management of built-in and custom commands
 */

import { EventEmitter } from "../core/EventEmitter.js";
import { CommandType } from "../enums/index.js";
import { ICommandHandler, ICommandRegistry } from "../interfaces/index.js";

// Import all built-in commands
import { AliasCommand } from "../console/commands/AliasCommand.js";
import { CatCommand } from "../console/commands/CatCommand.js";
import { CdCommand } from "../console/commands/CdCommand.js";
import { ClearCommand } from "../console/commands/ClearCommand.js";
import { CpCommand } from "../console/commands/CpCommand.js";
import { EchoCommand } from "../console/commands/EchoCommand.js";
import { EnvCommand } from "../console/commands/EnvCommand.js";
import { ExportCommand } from "../console/commands/ExportCommand.js";
import { HelpCommand } from "../console/commands/HelpCommand.js";
import { HistoryCommand } from "../console/commands/HistoryCommand.js";
import { JobsCommand } from "../console/commands/JobsCommand.js";
import { KillCommand } from "../console/commands/KillCommand.js";
import { LsCommand } from "../console/commands/LsCommand.js";
import { MkdirCommand } from "../console/commands/MkdirCommand.js";
import { MvCommand } from "../console/commands/MvCommand.js";
import { PwdCommand } from "../console/commands/PwdCommand.js";
import { RmCommand } from "../console/commands/RmCommand.js";
import { RunCommand } from "../console/commands/RunCommand.js";
import { ThemeCommand } from "../console/commands/ThemeCommand.js";
import { WorkerCommand } from "../console/commands/WorkerCommand.js";

/**
 * Command Registry Events
 */
export const CommandRegistryEvents = {
  COMMAND_REGISTERED: "command:registered",
  COMMAND_UNREGISTERED: "command:unregistered",
  ALIAS_CREATED: "alias:created",
  ALIAS_REMOVED: "alias:removed",
} as const;

/**
 * Command Registry Implementation
 */
export class CommandRegistry extends EventEmitter implements ICommandRegistry {
  private readonly commands = new Map<string, ICommandHandler>();
  private readonly aliases = new Map<string, string>();

  /**
   * Initialize registry
   */
  async initialize(): Promise<void> {
    // Registry is ready for command registration
    // Built-in commands will be registered later by the kernel with VFS
  }

  /**
   * Register command handler
   */
  register(handler: ICommandHandler): void {
    if (this.commands.has(handler.name)) {
      throw new Error(`Command '${handler.name}' is already registered`);
    }

    this.commands.set(handler.name, handler);
    this.emit(CommandRegistryEvents.COMMAND_REGISTERED, {
      name: handler.name,
      type: handler.type,
    });
  }

  /**
   * Remove command handler
   */
  unregister(name: string): void {
    const handler = this.commands.get(name);
    if (!handler) {
      return;
    }

    this.commands.delete(name);
    this.emit(CommandRegistryEvents.COMMAND_UNREGISTERED, {
      name,
      type: handler.type,
    });
  }

  /**
   * Get command handler
   */
  get(name: string): ICommandHandler | undefined {
    // First search for alias
    const resolvedName = this.aliases.get(name) || name;
    return this.commands.get(resolvedName);
  }

  /**
   * Check if command exists
   */
  has(name: string): boolean {
    const resolvedName = this.aliases.get(name) || name;
    return this.commands.has(resolvedName);
  }

  /**
   * List all registered commands
   */
  list(): string[] {
    return Array.from(this.commands.keys()).sort();
  }

  /**
   * Create alias for command
   */
  alias(alias: string, command: string): void {
    if (this.commands.has(alias)) {
      throw new Error(
        `Cannot create alias '${alias}': command with same name exists`,
      );
    }

    if (!this.commands.has(command)) {
      throw new Error(`Cannot create alias for unknown command '${command}'`);
    }

    this.aliases.set(alias, command);
    this.emit(CommandRegistryEvents.ALIAS_CREATED, { alias, command });
  }

  /**
   * Remove alias
   */
  unalias(alias: string): void {
    const command = this.aliases.get(alias);
    if (command) {
      this.aliases.delete(alias);
      this.emit(CommandRegistryEvents.ALIAS_REMOVED, { alias, command });
    }
  }

  /**
   * Get all aliases
   */
  getAliases(): Record<string, string> {
    return Object.fromEntries(this.aliases);
  }

  /**
   * Filter commands by type
   */
  getByType(type: CommandType): ICommandHandler[] {
    return Array.from(this.commands.values()).filter(
      (cmd) => cmd.type === type,
    );
  }

  /**
   * Get command details
   */
  getDetails(
    name: string,
  ):
    | { handler: ICommandHandler; isAlias: boolean; originalName?: string }
    | undefined {
    const isAlias = this.aliases.has(name);
    const resolvedName = isAlias ? this.aliases.get(name)! : name;
    const handler = this.commands.get(resolvedName);

    if (!handler) {
      return undefined;
    }

    if (isAlias) {
      return {
        handler,
        isAlias: true,
        originalName: resolvedName,
      };
    } else {
      return {
        handler,
        isAlias: false,
      };
    }
  }

  /**
   * Get all commands and aliases as Map
   */
  getAllCommands(): Map<string, string> {
    const result = new Map<string, string>();

    // Add direct commands
    for (const name of this.commands.keys()) {
      result.set(name, name);
    }

    // Add aliases
    for (const [alias, command] of this.aliases) {
      result.set(alias, command);
    }

    return result;
  }

  /**
   * Command completion for tab completion
   */
  getCompletions(prefix: string): string[] {
    const completions: string[] = [];

    // Direkte Commands
    for (const name of this.commands.keys()) {
      if (name.startsWith(prefix)) {
        completions.push(name);
      }
    }

    // Aliases
    for (const alias of this.aliases.keys()) {
      if (alias.startsWith(prefix)) {
        completions.push(alias);
      }
    }

    return completions.sort();
  }

  /**
   * Registry statistics
   */
  getStats(): {
    totalCommands: number;
    totalAliases: number;
    commandsByType: Record<string, number>;
  } {
    const commandsByType: Record<string, number> = {};

    for (const handler of this.commands.values()) {
      commandsByType[handler.type] = (commandsByType[handler.type] || 0) + 1;
    }

    return {
      totalCommands: this.commands.size,
      totalAliases: this.aliases.size,
      commandsByType,
    };
  }

  /**
   * Reset registry
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }

  /**
   * Register all built-in commands
   */
  registerBuiltinCommands(
    vfs: import("../interfaces/IVFS.interface.js").IVFS,
  ): void {
    // Commands that work without VFS
    this.register(new EchoCommand() as ICommandHandler);
    this.register(new ClearCommand() as ICommandHandler);
    this.register(new HelpCommand(this) as ICommandHandler);
    this.register(new PwdCommand() as ICommandHandler);

    // Environment commands
    this.register(new ExportCommand() as ICommandHandler);
    this.register(new AliasCommand() as ICommandHandler);
    this.register(new EnvCommand() as ICommandHandler);
    this.register(new HistoryCommand() as ICommandHandler);

    // Theme commands
    this.register(new ThemeCommand() as ICommandHandler);

    // Worker management commands
    this.register(new JobsCommand() as ICommandHandler);
    this.register(new KillCommand() as ICommandHandler);
    this.register(new WorkerCommand() as ICommandHandler);
    this.register(new RunCommand() as ICommandHandler);

    // VFS-dependent commands (register only if VFS is available)
    if (vfs) {
      this.register(new LsCommand(vfs) as ICommandHandler);
      this.register(new CdCommand(vfs) as ICommandHandler);
      this.register(new CatCommand() as ICommandHandler);
      this.register(new MkdirCommand() as ICommandHandler);
      this.register(new CpCommand() as ICommandHandler);
      this.register(new MvCommand() as ICommandHandler);
      this.register(new RmCommand() as ICommandHandler);
    }
  }

  /**
   * Create default registry with all built-in commands
   */
  static createDefault(
    vfs: import("../interfaces/IVFS.interface.js").IVFS,
  ): CommandRegistry {
    const registry = new CommandRegistry();
    registry.registerBuiltinCommands(vfs);
    return registry;
  }

  /**
   * Debug information
   */
  debug(): object {
    return {
      commands: Array.from(this.commands.entries()).map(([name, handler]) => ({
        name,
        type: handler.type,
        description: handler.description,
        usage: handler.usage,
      })),
      aliases: Object.fromEntries(this.aliases),
      stats: this.getStats(),
    };
  }
}
