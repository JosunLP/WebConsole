/**
 * pwd - Print working directory
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class PwdCommand extends BaseCommand {
  constructor() {
    super(
      "pwd",
      "Print the full pathname of the current working directory",
      "pwd [OPTION]",
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags } = this.parseArgs(context);

    // -L: use PWD from environment (logical)
    // -P: avoid all symlinks (physical) - default
    const logical = flags.has("L");
    const physical = flags.has("P");

    // If both are specified, the last one wins
    // For simplicity, we'll default to physical
    const useLogical = logical && !physical;

    let workingDirectory: string;

    if (useLogical) {
      // Use the PWD environment variable if it exists and is valid
      const envPwd = this.getEnvVar(context, "PWD");
      if (envPwd && this.isValidLogicalPwd(context, envPwd)) {
        workingDirectory = envPwd;
      } else {
        workingDirectory = context.workingDirectory;
      }
    } else {
      // Use the actual current working directory (physical path)
      workingDirectory = context.workingDirectory;
    }

    await this.writeToStdout(context, `${workingDirectory}\n`);
    return ExitCode.SUCCESS;
  }

  /**
   * Validate that the logical PWD points to the same directory
   * as the current working directory
   */
  private isValidLogicalPwd(
    context: CommandContext,
    logicalPwd: string,
  ): boolean {
    try {
      // In a real implementation, we would resolve both paths
      // and check if they point to the same directory
      // For now, we'll do a simple check
      return (
        logicalPwd.startsWith("/") && logicalPwd === context.workingDirectory
      );
    } catch {
      return false;
    }
  }
}
