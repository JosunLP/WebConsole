/**
 * Run Command - Führt Commands parallel in Workern aus
 */

import { BaseCommand } from "../BaseCommand.js";
import { CommandContext } from "../../types/index.js";
import { ExitCode } from "../../enums/index.js";
import { WorkerTaskPriority } from "../../interfaces/IWorkerTask.interface.js";

export class RunCommand extends BaseCommand {
  constructor() {
    super(
      "run",
      "Execute commands in parallel using workers",
      "run [--parallel] [--batch] <command...>"
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    if (positional.length === 0) {
      return this.outputError(context, "Command required");
    }

    const isParallel = flags.has("parallel");
    const isBatch = flags.has("batch");

    try {
      if (isBatch) {
        return this.runBatchCommands(context, positional);
      } else if (isParallel) {
        return this.runParallelCommand(context, positional);
      } else {
        return this.runSingleCommand(context, positional);
      }

    } catch (error) {
      return this.outputError(context, `Run command failed: ${error}`);
    }
  }

  private async runSingleCommand(context: CommandContext, command: string[]): Promise<ExitCode> {
    await this.writeToStdout(context, `Running: ${command.join(' ')}\n`);
    
    // Simulierte Command-Ausführung in Worker
    const result = await this.runCommandInWorker(
      () => {
        // Simuliere Command-Verarbeitung
        return {
          command: command.join(' '),
          output: `Executed: ${command.join(' ')}`,
          exitCode: 0
        };
      },
      {
        priority: WorkerTaskPriority.NORMAL,
        timeout: 30000
      }
    );

    await this.writeToStdout(context, `${result.output}\n`);
    return result.exitCode === 0 ? ExitCode.SUCCESS : ExitCode.ERROR;
  }

  private async runParallelCommand(context: CommandContext, command: string[]): Promise<ExitCode> {
    await this.writeToStdout(context, `Running in parallel: ${command.join(' ')}\n`);
    
    const result = await this.runCommandInWorker(
      () => {
        // Simuliere parallele Verarbeitung
        return {
          command: command.join(' '),
          output: `✓ Parallel execution: ${command.join(' ')}`,
          exitCode: 0,
          executionTime: Math.random() * 1000 + 500 // 0.5-1.5s
        };
      },
      {
        priority: WorkerTaskPriority.HIGH,
        timeout: 60000
      }
    );

    await this.writeToStdout(context, `${result.output} (${result.executionTime?.toFixed(0)}ms)\n`);
    return result.exitCode === 0 ? ExitCode.SUCCESS : ExitCode.ERROR;
  }

  private async runBatchCommands(context: CommandContext, commands: string[]): Promise<ExitCode> {
    await this.writeToStdout(context, `Running batch: ${commands.length} commands\n`);

    // Simuliere mehrere Commands parallel
    const taskFunctions = commands.map(cmd => () => ({
      command: cmd,
      output: `✓ Batch execution: ${cmd}`,
      exitCode: 0,
      executionTime: Math.random() * 1000 + 200
    }));

    const results = await this.runParallelCommands(taskFunctions, {
      priority: WorkerTaskPriority.NORMAL,
      timeout: 45000
    });

    let allSuccessful = true;
    for (const result of results) {
      await this.writeToStdout(context, `${result.output} (${result.executionTime?.toFixed(0)}ms)\n`);
      if (result.exitCode !== 0) {
        allSuccessful = false;
      }
    }

    await this.writeToStdout(context, `\nBatch completed: ${results.length} commands processed\n`);
    return allSuccessful ? ExitCode.SUCCESS : ExitCode.ERROR;
  }

  protected override async outputHelp(context: CommandContext): Promise<void> {
    const helpText = `${this.name} - ${this.description}

Usage: ${this.usage}

Options:
  --parallel    Execute command in parallel worker (single command)
  --batch       Execute multiple commands in parallel batch
  -h, --help    Show this help message

Examples:
  run echo "Hello World"                    # Regular execution
  run --parallel find /home -name "*.js"   # Parallel execution
  run --batch cmd1 cmd2 cmd3               # Batch execution

The run command demonstrates the WebConsole worker system by executing
commands in background workers, enabling true parallelism and non-blocking
operation.
`;
    await this.writeToStdout(context, helpText);
  }
}
