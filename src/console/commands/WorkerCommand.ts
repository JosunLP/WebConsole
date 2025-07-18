/**
 * Worker Command - Verwaltet Worker-Pools und -Konfiguration
 */

import { kernel } from "../../core/Kernel.js";
import { ExitCode } from "../../enums/index.js";
import { IWorkerManager } from "../../interfaces/IWorkerManager.interface.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class WorkerCommand extends BaseCommand {
  constructor() {
    super(
      "worker",
      "Manage worker pools and configuration",
      "worker <subcommand> [options]",
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { positional } = this.parseArgs(context);

    if (positional.length === 0) {
      return this.outputError(
        context,
        "Subcommand required. Use: status, config, create, destroy",
      );
    }

    const subcommand = positional[0];

    try {
      if (!kernel.isStarted) {
        return this.outputError(context, "Kernel not started");
      }

      const workerManager = kernel.getWorkerManager();

      switch (subcommand) {
        case "status":
          return this.showStatus(context, workerManager);

        case "config":
          return this.showConfig(context, workerManager);

        case "create":
          return this.createPool(context, workerManager, positional.slice(1));

        case "destroy":
          return this.destroyPool(context, workerManager, positional.slice(1));

        default:
          return this.outputError(context, `Unknown subcommand: ${subcommand}`);
      }
    } catch (error) {
      return this.outputError(context, `Worker command failed: ${error}`);
    }
  }

  private async showStatus(
    context: CommandContext,
    workerManager: IWorkerManager,
  ): Promise<ExitCode> {
    const workerStatus = workerManager.getWorkerStatus();
    const activeWorkerCount = workerManager.getActiveWorkerCount();

    await this.writeToStdout(
      context,
      this.colorize("🔧 Worker Manager Status\n", BaseCommand.COLORS.BOLD),
    );
    await this.writeToStdout(
      context,
      `Total Active Workers: ${activeWorkerCount}\n`,
    );
    await this.writeToStdout(
      context,
      `Worker Pools: ${workerStatus.length}\n\n`,
    );

    await this.writeToStdout(
      context,
      this.colorize("Detailed Pool Status:\n", BaseCommand.COLORS.CYAN),
    );

    for (const pool of workerStatus) {
      await this.writeToStdout(
        context,
        `\n${this.colorize(pool.id, BaseCommand.COLORS.YELLOW)}:\n`,
      );
      await this.writeToStdout(context, `  Max Workers: ${pool.maxWorkers}\n`);
      await this.writeToStdout(context, `  Active: ${pool.activeWorkers}\n`);
      await this.writeToStdout(
        context,
        `  Queued Tasks: ${pool.queuedTasks}\n`,
      );
      await this.writeToStdout(
        context,
        `  Completed: ${pool.completedTasks}\n`,
      );
      await this.writeToStdout(context, `  Failed: ${pool.failedTasks}\n`);
    }

    return ExitCode.SUCCESS;
  }

  private async showConfig(
    context: CommandContext,
    workerManager: IWorkerManager,
  ): Promise<ExitCode> {
    const permissions = workerManager.getDefaultPermissions();

    await this.writeToStdout(
      context,
      this.colorize("⚙️ Worker Configuration\n", BaseCommand.COLORS.BOLD),
    );
    await this.writeToStdout(
      context,
      `VFS Access: ${permissions.vfsAccess ? "Enabled" : "Disabled"}\n`,
    );
    await this.writeToStdout(
      context,
      `Network Access: ${permissions.networkAccess ? "Enabled" : "Disabled"}\n`,
    );
    await this.writeToStdout(
      context,
      `Max Execution Time: ${permissions.maxExecutionTime}ms\n`,
    );

    if (permissions.memoryLimit) {
      await this.writeToStdout(
        context,
        `Memory Limit: ${this.formatFileSize(permissions.memoryLimit)}\n`,
      );
    }

    return ExitCode.SUCCESS;
  }

  private async createPool(
    context: CommandContext,
    workerManager: IWorkerManager,
    args: string[],
  ): Promise<ExitCode> {
    if (args.length === 0) {
      return this.outputError(context, "Pool ID required");
    }

    const poolId = args[0];
    if (!poolId) {
      return this.outputError(context, "Pool ID required");
    }
    const maxWorkers = args.length > 1 ? parseInt(args[1] || "4", 10) : 4;

    if (isNaN(maxWorkers) || maxWorkers < 1) {
      return this.outputError(context, "Invalid max workers count");
    }

    try {
      await workerManager.createPool(poolId, maxWorkers);
      await this.writeToStdout(
        context,
        `Worker pool '${poolId}' created with ${maxWorkers} max workers\n`,
      );
      return ExitCode.SUCCESS;
    } catch (error) {
      return this.outputError(context, `Failed to create pool: ${error}`);
    }
  }

  private async destroyPool(
    context: CommandContext,
    workerManager: IWorkerManager,
    args: string[],
  ): Promise<ExitCode> {
    if (args.length === 0) {
      return this.outputError(context, "Pool ID required");
    }

    const poolId = args[0];
    if (!poolId) {
      return this.outputError(context, "Pool ID required");
    }

    try {
      await workerManager.destroyPool(poolId);
      await this.writeToStdout(context, `Worker pool '${poolId}' destroyed\n`);
      return ExitCode.SUCCESS;
    } catch (error) {
      return this.outputError(context, `Failed to destroy pool: ${error}`);
    }
  }
}
