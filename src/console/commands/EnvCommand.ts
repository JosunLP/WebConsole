/**
 * env - Display environment variables
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class EnvCommand extends BaseCommand {
  constructor() {
    super(
      "env",
      "Display environment variables",
      "env [OPTION]... [NAME=VALUE]... [COMMAND [ARG]...]",
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // -i, --ignore-environment: start with an empty environment
    const ignoreEnvironment = flags.has("i") || flags.has("ignore-environment");

    // -0, --null: separate output with NUL character instead of newline
    const useNullSeparator = flags.has("0") || flags.has("null");

    // If no arguments, display current environment
    if (positional.length === 0) {
      await this.displayEnvironment(context, useNullSeparator);
      return ExitCode.SUCCESS;
    }

    // Process NAME=VALUE assignments and commands
    const assignments: string[] = [];
    const command: string[] = [];
    let foundCommand = false;

    for (const arg of positional) {
      if (!foundCommand && arg.includes("=")) {
        assignments.push(arg);
      } else {
        foundCommand = true;
        command.push(arg);
      }
    }

    // Apply environment variable assignments
    const newEnv = { ...context.environment };
    for (const assignment of assignments) {
      const [name, ...valueParts] = assignment.split("=");
      const value = valueParts.join("=");
      if (name) {
        newEnv[name] = value;
      }
    }

    // If there's a command to run, execute it
    if (command.length > 0) {
      return await this.executeCommand(
        context,
        command,
        ignoreEnvironment,
        newEnv,
      );
    }

    // Otherwise, just display the environment with any new assignments
    const newContext = { ...context, environment: newEnv };
    await this.displayEnvironment(newContext, useNullSeparator);
    return ExitCode.SUCCESS;
  }

  private async displayEnvironment(
    context: CommandContext,
    useNullSeparator: boolean,
  ): Promise<void> {
    const env = context.environment;
    const separator = useNullSeparator ? "\0" : "\n";

    const entries: string[] = [];
    Object.entries(env).forEach(([key, value]) => {
      entries.push(`${key}=${value}`);
    });

    entries.sort();
    const output =
      entries.join(separator) + (entries.length > 0 ? separator : "");

    await this.writeToStdout(context, output);
  }

  private async executeCommand(
    context: CommandContext,
    command: string[],
    ignoreEnvironment: boolean,
    newEnv: Record<string, string>,
  ): Promise<ExitCode> {
    // Create new environment
    const finalEnv = ignoreEnvironment ? {} : newEnv;

    // For now, we'll just output that we would run the command
    // In a full implementation, this would use the command registry
    const commandName = command[0];
    let output = `env: would execute '${commandName}' with args: [${command.slice(1).join(", ")}]\n`;
    output += `env: environment variables: ${Object.entries(finalEnv)
      .map(([k, v]) => `${k}=${v}`)
      .join(" ")}\n`;

    await this.writeToStdout(context, output);
    return ExitCode.SUCCESS;
  }

  protected getDetailedHelp(): string {
    return `
Display or modify the environment for command execution.

Options:
  -i, --ignore-environment  start with an empty environment
  -0, --null               end each output line with NUL, not newline

Arguments:
  NAME=VALUE              set environment variable NAME to VALUE
  COMMAND [ARG]...        run COMMAND with modified environment

Examples:
  env                     # Show all environment variables
  env PATH=/usr/bin pwd   # Run pwd with modified PATH
  env -i HOME=/tmp bash   # Run bash with only HOME set
  env DEBUG=1 npm test    # Run npm test with DEBUG=1

Notes:
  - Variable assignments must come before the command
  - Use quotes for values containing spaces: NAME="value with spaces"
  - The -i flag starts with a clean environment
`;
  }
}
