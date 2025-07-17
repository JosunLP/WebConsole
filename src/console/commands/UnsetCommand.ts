/**
 * unset - Remove environment variables
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class UnsetCommand extends BaseCommand {
  constructor() {
    super("unset", "Remove environment variables", "unset [-v] name ...");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // -v: verbose mode
    const verbose = flags.has("v") || flags.has("verbose");

    if (positional.length === 0) {
      await this.writeToStderr(context, "unset: usage: unset [-v] name ...\n");
      return ExitCode.FAILURE;
    }

    // Remove each specified variable
    for (const varName of positional) {
      if (!this.isValidVariableName(varName)) {
        await this.writeToStderr(
          context,
          `unset: \`${varName}': not a valid identifier\n`,
        );
        continue;
      }

      const hadVariable = this.hasEnvironmentVariable(context, varName);

      if (hadVariable) {
        await this.unsetEnvironmentVariable(context, varName);
        if (verbose) {
          await this.writeToStdout(context, `unset: removed \`${varName}'\n`);
        }
      } else if (verbose) {
        await this.writeToStdout(context, `unset: \`${varName}' not set\n`);
      }
    }

    return ExitCode.SUCCESS;
  }

  private isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  private hasEnvironmentVariable(
    context: CommandContext,
    name: string,
  ): boolean {
    return name in context.environment;
  }

  private async unsetEnvironmentVariable(
    context: CommandContext,
    name: string,
  ): Promise<void> {
    try {
      if (
        context.state &&
        typeof context.state.unsetEnvironment === "function"
      ) {
        context.state.unsetEnvironment(name);
      } else {
        // Fallback: try to modify the context environment directly
        delete (context.environment as any)[name];
      }
    } catch (error) {
      await this.writeToStderr(
        context,
        `unset: warning: cannot modify environment\n`,
      );
    }
  }

  protected getDetailedHelp(): string {
    return `
Remove environment variables.

Options:
  -v, --verbose    explain what is being done

Arguments:
  name ...         names of environment variables to remove

Examples:
  unset PATH              # Remove PATH variable
  unset -v NODE_ENV       # Remove NODE_ENV with verbose output
  unset VAR1 VAR2 VAR3    # Remove multiple variables

Notes:
  - Variable names must be valid identifiers
  - Removing a non-existent variable is not an error
  - Use -v flag to see what variables are being removed
`;
  }
}
