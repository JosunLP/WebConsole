/**
 * Command Registry für die Verwaltung von Built-in und Custom Commands
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
import { LsCommand } from "../console/commands/LsCommand.js";
import { MkdirCommand } from "../console/commands/MkdirCommand.js";
import { MvCommand } from "../console/commands/MvCommand.js";
import { PwdCommand } from "../console/commands/PwdCommand.js";
import { RmCommand } from "../console/commands/RmCommand.js";
import { ThemeCommand } from "../console/commands/ThemeCommand.js";

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
 * Command Registry Implementierung
 */
export class CommandRegistry extends EventEmitter implements ICommandRegistry {
  private readonly commands = new Map<string, ICommandHandler>();
  private readonly aliases = new Map<string, string>();

  /**
   * Registry initialisieren und Built-in Commands registrieren
   */
  async initialize(): Promise<void> {
    // Built-in Commands werden lazy geladen wenn sie aufgerufen werden
    // Hier könnten wir die Registry für Standard-Commands vorbereiten
  }

  /**
   * Command-Handler registrieren
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
   * Command-Handler entfernen
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
   * Command-Handler abrufen
   */
  get(name: string): ICommandHandler | undefined {
    // Zuerst nach Alias suchen
    const resolvedName = this.aliases.get(name) || name;
    return this.commands.get(resolvedName);
  }

  /**
   * Prüfen ob Command existiert
   */
  has(name: string): boolean {
    const resolvedName = this.aliases.get(name) || name;
    return this.commands.has(resolvedName);
  }

  /**
   * Alle registrierten Commands auflisten
   */
  list(): string[] {
    return Array.from(this.commands.keys()).sort();
  }

  /**
   * Alias für Command erstellen
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
   * Alias entfernen
   */
  unalias(alias: string): void {
    const command = this.aliases.get(alias);
    if (command) {
      this.aliases.delete(alias);
      this.emit(CommandRegistryEvents.ALIAS_REMOVED, { alias, command });
    }
  }

  /**
   * Alle Aliases abrufen
   */
  getAliases(): Record<string, string> {
    return Object.fromEntries(this.aliases);
  }

  /**
   * Commands nach Typ filtern
   */
  getByType(type: CommandType): ICommandHandler[] {
    return Array.from(this.commands.values()).filter(
      (cmd) => cmd.type === type,
    );
  }

  /**
   * Command-Details abrufen
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
   * Alle Commands und Aliases als Map
   */
  getAllCommands(): Map<string, string> {
    const result = new Map<string, string>();

    // Direkte Commands hinzufügen
    for (const name of this.commands.keys()) {
      result.set(name, name);
    }

    // Aliases hinzufügen
    for (const [alias, command] of this.aliases) {
      result.set(alias, command);
    }

    return result;
  }

  /**
   * Command-Vervollständigung für Tab-Completion
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
   * Registry-Statistiken
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
   * Registry zurücksetzen
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }

  /**
   * Register all built-in commands
   */
  registerBuiltinCommands(vfs: any): void {
    // File system commands that need VFS
    this.register(new LsCommand(vfs) as ICommandHandler);
    this.register(new CdCommand(vfs) as ICommandHandler);

    // File system commands that don't need VFS constructor param
    this.register(new PwdCommand() as ICommandHandler);
    this.register(new CatCommand() as ICommandHandler);
    this.register(new MkdirCommand() as ICommandHandler);
    this.register(new CpCommand() as ICommandHandler);
    this.register(new MvCommand() as ICommandHandler);
    this.register(new RmCommand() as ICommandHandler);

    // Utility commands
    this.register(new EchoCommand() as ICommandHandler);
    this.register(new ClearCommand() as ICommandHandler);
    this.register(new HelpCommand(this) as ICommandHandler);

    // Environment commands
    this.register(new ExportCommand() as ICommandHandler);
    this.register(new AliasCommand() as ICommandHandler);
    this.register(new EnvCommand() as ICommandHandler);
    this.register(new HistoryCommand() as ICommandHandler);

    // Console commands
    this.register(new ThemeCommand() as ICommandHandler);
  }

  /**
   * Create default registry with all built-in commands
   */
  static createDefault(vfs: any): CommandRegistry {
    const registry = new CommandRegistry();
    registry.registerBuiltinCommands(vfs);
    return registry;
  }

  /**
   * Debug-Informationen
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
