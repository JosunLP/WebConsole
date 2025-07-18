/**
 * Jobs Command - Shows active worker tasks
 */

import { kernel } from "../../core/Kernel.js";
import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class JobsCommand extends BaseCommand {
  constructor() {
    super(
      "jobs",
      "Show active background tasks and worker jobs",
      "jobs [options]",
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    try {
      if (!kernel.isStarted) {
        return this.outputError(context, "Kernel not started");
      }

      const workerManager = kernel.getWorkerManager();
      const activeTasks = workerManager.listActiveTasks();
      const workerStatus = workerManager.getWorkerStatus();
      const activeWorkerCount = workerManager.getActiveWorkerCount();

      // Header
      await this.writeToStdout(
        context,
        this.colorize("🔧 Worker Status\n", BaseCommand.COLORS.BOLD),
      );
      await this.writeToStdout(
        context,
        `Active Workers: ${activeWorkerCount}\n`,
      );
      await this.writeToStdout(
        context,
        `Worker Pools: ${workerStatus.length}\n\n`,
      );

      // Worker Pool Status
      await this.writeToStdout(
        context,
        this.colorize("Worker Pools:\n", BaseCommand.COLORS.CYAN),
      );
      await this.writeToStdout(
        context,
        "POOL ID              ACTIVE    QUEUED    COMPLETED    FAILED\n",
      );
      await this.writeToStdout(
        context,
        "────────────────────────────────────────────────────────────\n",
      );

      for (const pool of workerStatus) {
        const poolLine = `${pool.id.padEnd(20)} ${pool.activeWorkers.toString().padStart(6)} ${pool.queuedTasks.toString().padStart(9)} ${pool.completedTasks.toString().padStart(12)} ${pool.failedTasks.toString().padStart(9)}\n`;
        await this.writeToStdout(context, poolLine);
      }

      // Active Tasks
      await this.writeToStdout(
        context,
        `\n${this.colorize("Active Tasks:", BaseCommand.COLORS.CYAN)}\n`,
      );

      if (activeTasks.length === 0) {
        await this.writeToStdout(context, "No active tasks\n");
      } else {
        await this.writeToStdout(
          context,
          "TASK ID                          STATUS     POOL\n",
        );
        await this.writeToStdout(
          context,
          "──────────────────────────────────────────────────\n",
        );

        for (const taskId of activeTasks) {
          const status = workerManager.getTaskStatus(taskId);
          const taskLine = `${taskId.padEnd(32)} ${status?.padEnd(10) || "unknown"} ${this.getPoolForTask(taskId).padEnd(10)}\n`;
          await this.writeToStdout(context, taskLine);
        }
      }

      return ExitCode.SUCCESS;
    } catch (error) {
      return this.outputError(context, `Failed to get worker status: ${error}`);
    }
  }

  private getPoolForTask(taskId: string): string {
    // Extract pool info from task ID if possible
    if (taskId.includes("command")) return "command";
    return "default";
  }
}
