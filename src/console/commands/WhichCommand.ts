/**
 * which - Locate a command
 */

import { ExitCode } from '../../enums/index.js';
import { CommandContext } from '../../types/index.js';
import { BaseCommand } from '../BaseCommand.js';

export class WhichCommand extends BaseCommand {
  constructor() {
    super('which', 'Locate a command', 'which [-a] command ...');
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // -a: show all instances of executable
    const showAll = flags.has('a') || flags.has('all');

    if (positional.length === 0) {
      await this.writeToStderr(context, 'which: missing command name\n');
      return ExitCode.FAILURE;
    }

    let foundAny = false;

    for (const command of positional) {
      const paths = await this.findCommand(context, command, showAll);

      if (paths.length > 0) {
        foundAny = true;
        for (const path of paths) {
          await this.writeToStdout(context, `${path}\n`);
        }
      } else {
        await this.writeToStderr(context, `which: ${command}: not found\n`);
      }
    }

    return foundAny ? ExitCode.SUCCESS : ExitCode.FAILURE;
  }

  private async findCommand(
    context: CommandContext,
    command: string,
    showAll: boolean
  ): Promise<string[]> {
    const paths: string[] = [];

    // Check if it's a built-in command
    if (context.state?.commandRegistry?.has(command)) {
      paths.push(`${command}: shell built-in command`);
      if (!showAll) return paths;
    }

    // Check if it's an absolute path
    if (command.startsWith('/')) {
      if (await this.commandExists(context, command)) {
        paths.push(command);
      }
      return paths;
    }

    // Search in PATH
    const pathEnv = context.environment.PATH || '';
    const pathDirs = pathEnv.split(':');

    for (const dir of pathDirs) {
      if (!dir) continue;

      const fullPath = `${dir}/${command}`;
      if (await this.commandExists(context, fullPath)) {
        paths.push(fullPath);
        if (!showAll) break;
      }
    }

    return paths;
  }

  private async commandExists(
    context: CommandContext,
    path: string
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const stat = await context.vfs.stat(path);
        return stat && (stat.permissions & 0o111) !== 0; // Check execute permission
      }
      return false;
    } catch {
      return false;
    }
  }

  protected getDetailedHelp(): string {
    return `
Locate a command.

Options:
  -a, --all        show all instances of the command

Arguments:
  command ...      names of commands to locate

Examples:
  which ls                # Find location of ls command
  which -a python         # Find all instances of python
  which node npm yarn     # Find multiple commands

Exit Status:
  0    if all commands are found
  1    if any command is not found

Notes:
  - Searches built-in commands first
  - Then searches directories in PATH environment variable
  - Use -a to see all matches instead of just the first one
`;
  }
}
