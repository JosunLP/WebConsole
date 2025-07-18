/**
 * help - Show available commands and their usage
 */

import { ExitCode } from "../../enums/index.js";
import type { ICommandRegistry } from "../../interfaces/ICommandRegistry.interface.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class HelpCommand extends BaseCommand {
  constructor(private commandRegistry: ICommandRegistry) {
    super("help", "Show available commands and their usage", "help [COMMAND]");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    const { positional } = this.parseArgs(context);

    if (positional.length === 0) {
      // Show all commands
      await this.showAllCommands(context);
    } else {
      // Show help for specific command
      const commandName = positional[0];
      if (commandName) {
        await this.showCommandHelp(context, commandName);
      }
    }

    return ExitCode.SUCCESS;
  }

  private async showAllCommands(context: CommandContext): Promise<void> {
    const availableCommands = this.commandRegistry.list();

    let output = "Available commands:\n\n";

    for (const commandName of availableCommands.sort()) {
      const command = this.commandRegistry.get(commandName);
      if (command) {
        const description = command.description || "No description available";
        output += `  ${commandName.padEnd(12)} ${description}\n`;
      }
    }

    output +=
      '\nType "help <command>" for more information about a specific command.\n';
    output += 'Type "help about" for information about Web Console.\n';

    await this.writeToStdout(context, output);
  }

  private async showCommandHelp(
    context: CommandContext,
    commandName: string,
  ): Promise<void> {
    if (commandName === "about") {
      await this.showAbout(context);
      return;
    }

    const command = this.commandRegistry.get(commandName);

    if (!command) {
      const error = `help: no help topics match '${commandName}'\n`;
      await this.writeToStderr(context, error);
      return;
    }

    let output = `${commandName} - ${command.description || "No description available"}\n\n`;

    if (command.usage) {
      output += `Usage: ${command.usage}\n\n`;
    }

    // Try to get additional help from the command
    if (
      "getDetailedHelp" in command &&
      typeof command.getDetailedHelp === "function"
    ) {
      const detailedHelp = (
        command as { getDetailedHelp: () => string }
      ).getDetailedHelp();
      if (detailedHelp) {
        output += detailedHelp + "\n";
      }
    }

    await this.writeToStdout(context, output);
  }

  private async showAbout(context: CommandContext): Promise<void> {
    const about = `
Web Console v0.1.0

A modular, browser-based console library that allows developers to integrate
a Windows Terminal-like console into any web application in seconds - without
backend, without build steps, without external dependencies.

Features:
  • Modular architecture (Kernel, VFS, StateManager, Parser)
  • Virtual file system with POSIX-like operations
  • Flexible theme system with CSS custom properties
  • Framework-agnostic (Angular, React, Vue, Svelte, Web Components)
  • Security-focused (Sandbox, CSP-compatible, no eval usage)
  • Tree-shaking support for minimal bundle size

Built-in Commands:
  • File operations: ls, cat, cd, pwd, mkdir, rm, cp, mv
  • System: echo, clear, export, alias, env
  • Theme management: theme
  • Help system: help

For more information, visit: https://github.com/your-org/web-console

`;

    await this.writeToStdout(context, about);
  }

  protected getDetailedHelp(): string {
    return `
Options:
  help                 Show all available commands
  help <command>       Show help for a specific command
  help about          Show information about Web Console

Examples:
  help                 # List all commands
  help ls             # Show help for 'ls' command
  help theme          # Show help for 'theme' command
  help about          # Show about information
`;
  }
}
