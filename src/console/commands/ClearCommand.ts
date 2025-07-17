/**
 * clear - Clear the terminal screen
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class ClearCommand extends BaseCommand {
  constructor() {
    super("clear", "Clear the terminal screen", "clear");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    // Send clear screen ANSI escape sequence
    await this.writeToStdout(context, "\x1b[2J\x1b[H");

    return ExitCode.SUCCESS;
  }

  /**
   * Clear screen utility method
   */
  static async clearScreen(context: CommandContext): Promise<void> {
    const command = new ClearCommand();
    await command.writeToStdout(context, "\x1b[2J\x1b[H");
  }

  /**
   * Get ANSI clear screen sequence
   */
  static getClearSequence(): string {
    return "\x1b[2J\x1b[H";
  }
}
