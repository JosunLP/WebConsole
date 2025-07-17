import { ExitCode } from "../../enums/ExitCode.enum.js";
import type { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

/**
 * history - Display command history
 *
 * Syntax: history [n]
 *
 * Display the command history. Optional argument n shows only the last n commands.
 */
export class HistoryCommand extends BaseCommand {
  constructor() {
    super("history", "Display command history", "history [n]");
  }

  override async execute(context: CommandContext): Promise<ExitCode> {
    const args = context.args.slice(1); // Remove command name

    try {
      // Get history from state or a default history service
      // This is a simplified implementation - in a real system you'd have
      // a proper history service integrated with the console
      const history = this.getCommandHistory(context);

      let linesToShow = history.length;

      if (args.length > 0) {
        const firstArg = args[0];
        if (!firstArg) {
          await this.writeToStderr(context, "history: invalid argument\n");
          return ExitCode.FAILURE;
        }

        const n = parseInt(firstArg, 10);
        if (isNaN(n)) {
          await this.writeToStderr(
            context,
            `history: ${args[0]}: numeric argument required\n`,
          );
          return ExitCode.FAILURE;
        }
        linesToShow = Math.min(n, history.length);
      }

      const startIndex = Math.max(0, history.length - linesToShow);

      for (let i = startIndex; i < history.length; i++) {
        const historyNumber = i + 1;
        const command = history[i];
        await this.writeToStdout(
          context,
          `${historyNumber.toString().padStart(5, " ")}  ${command}\n`,
        );
      }

      return ExitCode.SUCCESS;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.writeToStderr(context, `history: ${message}\n`);
      return ExitCode.FAILURE;
    }
  }

  private getCommandHistory(_context: CommandContext): string[] {
    // Try to get history from localStorage or session storage
    try {
      const historyJson = localStorage.getItem("webconsole-history");
      if (historyJson) {
        return JSON.parse(historyJson);
      }
    } catch (error) {
      // Fallback to empty history
    }

    // Return a sample history for demo purposes
    return [
      "ls",
      "cd /home",
      "ls -la",
      "cat README.md",
      "mkdir test",
      "cd test",
      'echo "Hello World" > hello.txt',
      "cat hello.txt",
      "cd ..",
      "rm -r test",
      "theme list",
      "theme set monokai",
      "help",
      "pwd",
    ];
  }
}
