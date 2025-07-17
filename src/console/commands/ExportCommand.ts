/**
 * export - Set environment variables
 */

import { ExitCode } from '../../enums/index.js';
import { CommandContext } from '../../types/index.js';
import { BaseCommand } from '../BaseCommand.js';

export class ExportCommand extends BaseCommand {
  constructor() {
    super(
      'export',
      'Set environment variables',
      'export [name[=value] ...]'
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // -p: display all environment variables in a format that can be reused as input
    const printAll = flags.has('p');

    // If no arguments, print all environment variables
    if (positional.length === 0 || printAll) {
      await this.printEnvironment(context);
      return ExitCode.SUCCESS;
    }

    // Process each argument
    for (const arg of positional) {
      const result = await this.processExportArgument(context, arg);
      if (result !== ExitCode.SUCCESS) {
        return result;
      }
    }

    return ExitCode.SUCCESS;
  }

  private async processExportArgument(context: CommandContext, arg: string): Promise<ExitCode> {
    // Check if it's an assignment (name=value)
    const assignmentMatch = arg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);

    if (assignmentMatch) {
      // Set variable
      const name = assignmentMatch[1]!;
      const value = assignmentMatch[2]!;
      await this.setEnvironmentVariable(context, name, value);
      return ExitCode.SUCCESS;
    }

    // Check if it's just a variable name
    const nameMatch = arg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)$/);

    if (nameMatch) {
      // Export existing variable or set to empty if not exists
      const name = nameMatch[1]!;
      const currentValue = this.getEnvironmentVariable(context, name) || '';
      await this.setEnvironmentVariable(context, name, currentValue);
      return ExitCode.SUCCESS;
    }

    // Invalid variable name
    await this.writeToStderr(context, `export: \`${arg}': not a valid identifier\n`);
    return ExitCode.FAILURE;
  }

  private async printEnvironment(context: CommandContext): Promise<void> {
    const env = context.environment;
    const sorted = Object.keys(env).sort();

    for (const key of sorted) {
      const value = env[key];
      if (value !== undefined) {
        // Escape special characters in the value
        const escapedValue = this.escapeValue(value);
        await this.writeToStdout(context, `export ${key}="${escapedValue}"\n`);
      }
    }
  }

  private escapeValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')   // Escape backslashes
      .replace(/"/g, '\\"')     // Escape double quotes
      .replace(/\$/g, '\\$')    // Escape dollar signs
      .replace(/`/g, '\\`')     // Escape backticks
      .replace(/\n/g, '\\n')    // Escape newlines
      .replace(/\r/g, '\\r')    // Escape carriage returns
      .replace(/\t/g, '\\t');   // Escape tabs
  }

  private async setEnvironmentVariable(context: CommandContext, name: string, value: string): Promise<void> {
    // In a real implementation, this would update the environment in the state manager
    // For now, we'll just update the context environment (which might be read-only)
    try {
      // Try to update the environment through the state manager
      if (context.state && typeof context.state.setEnvironment === 'function') {
        const currentEnv = context.environment;
        const newEnv = { ...currentEnv, [name]: value };
        context.state.setEnvironment(newEnv);
      } else {
        // Fallback: try to modify the context environment directly
        (context.environment as any)[name] = value;
      }
    } catch (error) {
      // If we can't modify the environment, at least log the attempt
      await this.writeToStderr(context, `export: warning: cannot modify environment\n`);
    }
  }

  private getEnvironmentVariable(context: CommandContext, name: string): string | undefined {
    return context.environment[name];
  }

  /**
   * Utility method to get all environment variables
   */
  static getEnvironment(context: CommandContext): Record<string, string> {
    return { ...context.environment };
  }

  /**
   * Utility method to set a single environment variable
   */
  static async setVariable(context: CommandContext, name: string, value: string): Promise<boolean> {
    const command = new ExportCommand();
    try {
      await command.setEnvironmentVariable(context, name, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Utility method to unset an environment variable
   */
  static async unsetVariable(context: CommandContext, name: string): Promise<boolean> {
    try {
      if (context.state && typeof context.state.setEnvironment === 'function') {
        const currentEnv = context.environment;
        const newEnv = { ...currentEnv };
        delete newEnv[name];
        context.state.setEnvironment(newEnv);
        return true;
      } else {
        delete (context.environment as any)[name];
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Check if a variable name is valid
   */
  static isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  /**
   * Parse environment variable assignments from a string
   */
  static parseAssignment(str: string): { name: string; value: string } | null {
    const match = str.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
    return match ? { name: match[1]!, value: match[2]! } : null;
  }
}
