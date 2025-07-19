/**
 * Kill Command - Terminates worker tasks
 */

import { kernel } from "../../core/Kernel.js";
import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class KillCommand extends BaseCommand {
  constructor() {
    super("kill", "Terminate a background task", "kill <task-id>");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { positional } = this.parseArgs(context);

    if (positional.length === 0) {
      return this.outputError(context, "Task ID required");
    }

    const taskId = positional[0];
    if (!taskId) {
      return this.outputError(context, "Task ID required");
    }

    try {
      if (!kernel.isStarted) {
        return this.outputError(context, "Kernel not started");
      }

      const workerManager = kernel.getWorkerManager();
      const success = await workerManager.cancelTask(taskId);

      if (success) {
        await this.writeToStdout(
          context,
          `Task ${taskId} terminated successfully\n`,
        );
        return ExitCode.SUCCESS;
      } else {
        return this.outputError(
          context,
          `Task ${taskId} not found or already completed`,
        );
      }
    } catch (error) {
      return this.outputError(context, `Failed to terminate task: ${error}`);
    }
  }
}
