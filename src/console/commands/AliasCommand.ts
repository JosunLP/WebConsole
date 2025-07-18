/**
 * alias - Create command aliases
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class AliasCommand extends BaseCommand {
  constructor() {
    super(
      "alias",
      "Create and manage command aliases",
      "alias [-p] [name[=value] ...]",
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // -p: display aliases in a format that can be reused as input
    const printAll = flags.has("p");

    // If no arguments, print all aliases
    if (positional.length === 0 || printAll) {
      await this.printAliases(context);
      return ExitCode.SUCCESS;
    }

    // Process each argument
    for (const arg of positional) {
      const result = await this.processAliasArgument(context, arg);
      if (result !== ExitCode.SUCCESS) {
        return result;
      }
    }

    return ExitCode.SUCCESS;
  }

  private async processAliasArgument(
    context: CommandContext,
    arg: string,
  ): Promise<ExitCode> {
    // Check if it's an assignment (name=value)
    const assignmentMatch = arg.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)=(.*)$/);

    if (assignmentMatch) {
      // Create alias
      const name = assignmentMatch[1]!;
      const value = assignmentMatch[2]!;

      // Remove surrounding quotes if present
      const cleanValue = this.cleanQuotes(value);

      await this.setAlias(context, name, cleanValue);
      return ExitCode.SUCCESS;
    }

    // Check if it's just an alias name (to show its value)
    const nameMatch = arg.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)$/);

    if (nameMatch) {
      const name = nameMatch[1]!;
      const value = this.getAlias(context, name);

      if (value !== undefined) {
        await this.writeToStdout(
          context,
          `alias ${name}='${this.escapeValue(value)}'\n`,
        );
      } else {
        await this.writeToStderr(context, `alias: ${name}: not found\n`);
        return ExitCode.FAILURE;
      }

      return ExitCode.SUCCESS;
    }

    // Invalid alias name
    await this.writeToStderr(context, `alias: \`${arg}': invalid alias name\n`);
    return ExitCode.FAILURE;
  }

  private async printAliases(context: CommandContext): Promise<void> {
    const aliases = this.getAllAliases(context);
    const sorted = Object.keys(aliases).sort();

    if (sorted.length === 0) {
      await this.writeToStdout(context, "No aliases defined.\n");
      return;
    }

    for (const name of sorted) {
      const value = aliases[name];
      if (value !== undefined) {
        const escapedValue = this.escapeValue(value);
        await this.writeToStdout(context, `alias ${name}='${escapedValue}'\n`);
      }
    }
  }

  private cleanQuotes(value: string): string {
    // Remove surrounding single or double quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }
    return value;
  }

  private escapeValue(value: string): string {
    return value
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/'/g, "\\'") // Escape single quotes
      .replace(/\n/g, "\\n") // Escape newlines
      .replace(/\r/g, "\\r") // Escape carriage returns
      .replace(/\t/g, "\\t"); // Escape tabs
  }

  private async setAlias(
    context: CommandContext,
    name: string,
    value: string,
  ): Promise<void> {
    try {
      // Set alias in state manager
      if (context.state && typeof context.state.set === "function") {
        const aliasKey = `console.aliases.${name}`;
        context.state.set(aliasKey, value);
      } else {
        // Fallback: use a global aliases object (not ideal for real implementation)
        const globalAliases = globalThis as unknown as {
          __consoleAliases?: Record<string, string>;
        };
        if (!globalAliases.__consoleAliases) {
          globalAliases.__consoleAliases = {};
        }
        globalAliases.__consoleAliases[name] = value;
      }
    } catch (error) {
      throw new Error(`Failed to set alias: ${error}`);
    }
  }

  private getAlias(context: CommandContext, name: string): string | undefined {
    try {
      // Get alias from state manager
      if (context.state && typeof context.state.get === "function") {
        const aliasKey = `console.aliases.${name}`;
        return context.state.get(aliasKey);
      } else {
        // Fallback: use global aliases object
        const globalAliases = globalThis as unknown as {
          __consoleAliases?: Record<string, string>;
        };
        return globalAliases.__consoleAliases?.[name];
      }
    } catch {
      return undefined;
    }
  }

  private getAllAliases(context: CommandContext): Record<string, string> {
    try {
      // Get all aliases from state manager
      if (context.state && typeof context.state.get === "function") {
        const aliases =
          context.state.get<Record<string, string>>("console.aliases");
        return aliases || {};
      } else {
        // Fallback: use global aliases object
        const globalAliases = globalThis as unknown as {
          __consoleAliases?: Record<string, string>;
        };
        return globalAliases.__consoleAliases || {};
      }
    } catch {
      return {};
    }
  }

  private async removeAlias(
    context: CommandContext,
    name: string,
  ): Promise<boolean> {
    try {
      if (context.state && typeof context.state.delete === "function") {
        const aliasKey = `console.aliases.${name}`;
        return context.state.delete(aliasKey);
      } else {
        // Fallback: delete from global object
        const globalAliases = globalThis as unknown as {
          __consoleAliases?: Record<string, string>;
        };
        if (globalAliases.__consoleAliases?.[name]) {
          delete globalAliases.__consoleAliases[name];
          return true;
        }
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Expand aliases in a command string
   */
  static expandAliases(context: CommandContext, command: string): string {
    const aliasCommand = new AliasCommand();
    const parts = command.trim().split(/\s+/);

    if (parts.length === 0) {
      return command;
    }

    const firstPart = parts[0];
    if (!firstPart) {
      return command;
    }

    const aliasValue = aliasCommand.getAlias(context, firstPart);

    if (aliasValue) {
      // Replace the alias with its value
      const remainingArgs = parts.slice(1);
      return (
        aliasValue +
        (remainingArgs.length > 0 ? " " + remainingArgs.join(" ") : "")
      );
    }

    return command;
  }

  /**
   * Check if a command is an alias
   */
  static isAlias(context: CommandContext, command: string): boolean {
    const aliasCommand = new AliasCommand();
    return aliasCommand.getAlias(context, command) !== undefined;
  }

  /**
   * Get all defined aliases
   */
  static getAllAliases(context: CommandContext): Record<string, string> {
    const aliasCommand = new AliasCommand();
    return aliasCommand.getAllAliases(context);
  }

  /**
   * Set an alias programmatically
   */
  static async setAlias(
    context: CommandContext,
    name: string,
    value: string,
  ): Promise<boolean> {
    const aliasCommand = new AliasCommand();
    try {
      await aliasCommand.setAlias(context, name, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove an alias
   */
  static async removeAlias(
    context: CommandContext,
    name: string,
  ): Promise<boolean> {
    const aliasCommand = new AliasCommand();
    return await aliasCommand.removeAlias(context, name);
  }

  /**
   * Check if an alias name is valid
   */
  static isValidAliasName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name);
  }

  /**
   * Parse alias assignment from string
   */
  static parseAliasAssignment(
    str: string,
  ): { name: string; value: string } | null {
    const match = str.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)=(.*)$/);
    return match ? { name: match[1]!, value: match[2]! } : null;
  }

  /**
   * Get common aliases suggestions
   */
  static getCommonAliases(): Record<string, string> {
    return {
      ll: "ls -la",
      la: "ls -la",
      l: "ls -CF",
      cls: "clear",
      md: "mkdir",
      rd: "rmdir",
      del: "rm",
      copy: "cp",
      move: "mv",
      type: "cat",
      dir: "ls",
      "cd..": "cd ..",
      "cd-": "cd -",
      grep: "grep --color=auto",
      fgrep: "fgrep --color=auto",
      egrep: "egrep --color=auto",
    };
  }
}
