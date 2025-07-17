import { ExitCode } from "../../enums/ExitCode.enum.js";
import type { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

/**
 * rm - Remove files and directories
 *
 * Syntax: rm [-f] [-r] file...
 *
 * Removes files and directories. Use -r for recursive directory removal.
 */
export class RmCommand extends BaseCommand {
  constructor() {
    super("rm", "Remove files and directories", "rm [-f] [-r] file...");
  }

  override async execute(context: CommandContext): Promise<ExitCode> {
    const args = context.args.slice(1); // Remove command name

    if (args.length === 0) {
      await this.writeToStderr(context, "rm: missing operand\n");
      await this.writeToStderr(
        context,
        "Try 'rm --help' for more information.\n",
      );
      return ExitCode.FAILURE;
    }

    const force = args.includes("-f");
    const recursive = args.includes("-r") || args.includes("-R");
    const verbose = args.includes("-v");
    const targets = args.filter((arg) => !arg.startsWith("-"));

    if (targets.length === 0) {
      await this.writeToStderr(context, "rm: missing file operand\n");
      return ExitCode.FAILURE;
    }

    const vfs = context.vfs;
    let hasErrors = false;

    for (const target of targets) {
      try {
        const absolutePath = this.resolvePath(context, target);

        // Check if file/directory exists
        let stat;
        try {
          stat = await vfs.stat(absolutePath);
        } catch (error) {
          if (!force) {
            await this.writeToStderr(
              context,
              `rm: cannot remove '${target}': No such file or directory\n`,
            );
            hasErrors = true;
          }
          continue;
        }

        if (stat.isDirectory()) {
          if (!recursive) {
            await this.writeToStderr(
              context,
              `rm: cannot remove '${target}': Is a directory\n`,
            );
            hasErrors = true;
            continue;
          }

          // Remove directory recursively
          await this.removeDirectoryRecursive(
            vfs,
            absolutePath,
            verbose,
            context,
          );
        } else {
          // Remove file
          await vfs.deleteFile(absolutePath);

          if (verbose) {
            await this.writeToStdout(context, `removed '${target}'\n`);
          }
        }
      } catch (error) {
        if (!force) {
          const message =
            error instanceof Error ? error.message : String(error);
          await this.writeToStderr(
            context,
            `rm: cannot remove '${target}': ${message}\n`,
          );
          hasErrors = true;
        }
      }
    }

    return hasErrors ? ExitCode.FAILURE : ExitCode.SUCCESS;
  }

  private async removeDirectoryRecursive(
    vfs: any,
    dirPath: string,
    verbose: boolean,
    context: CommandContext,
  ): Promise<void> {
    try {
      // List directory contents
      const entries = await vfs.readDir(dirPath);

      // Remove all entries first
      for (const entry of entries) {
        const entryPath =
          dirPath === "/" ? `/${entry.name}` : `${dirPath}/${entry.name}`;

        if (entry.isDirectory()) {
          await this.removeDirectoryRecursive(vfs, entryPath, verbose, context);
        } else {
          await vfs.deleteFile(entryPath);

          if (verbose) {
            await this.writeToStdout(context, `removed '${entryPath}'\n`);
          }
        }
      }

      // Remove the directory itself
      await vfs.deleteDirectory(dirPath);

      if (verbose) {
        await this.writeToStdout(context, `removed directory '${dirPath}'\n`);
      }
    } catch (error) {
      throw new Error(
        `Failed to remove directory '${dirPath}': ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
