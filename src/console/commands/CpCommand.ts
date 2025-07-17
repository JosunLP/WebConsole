import { ExitCode } from "../../enums/ExitCode.enum.js";
import type { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

/**
 * cp - Copy files and directories
 *
 * Syntax: cp [-r] source... destination
 *
 * Copies files and directories. Use -r for recursive directory copying.
 */
export class CpCommand extends BaseCommand {
  constructor() {
    super("cp", "Copy files and directories", "cp [-r] source... destination");
  }

  override async execute(context: CommandContext): Promise<ExitCode> {
    const args = context.args.slice(1); // Remove command name

    if (args.length < 2) {
      await this.writeToStderr(context, "cp: missing file operand\n");
      await this.writeToStderr(
        context,
        "Try 'cp --help' for more information.\n",
      );
      return ExitCode.FAILURE;
    }

    const recursive = args.includes("-r") || args.includes("-R");
    const verbose = args.includes("-v");
    const fileArgs = args.filter((arg) => !arg.startsWith("-"));

    if (fileArgs.length < 2) {
      await this.writeToStderr(
        context,
        "cp: missing destination file operand\n",
      );
      return ExitCode.FAILURE;
    }

    const destination = fileArgs[fileArgs.length - 1];
    const sources = fileArgs.slice(0, -1);

    if (!destination) {
      await this.writeToStderr(
        context,
        "cp: missing destination file operand\n",
      );
      return ExitCode.FAILURE;
    }

    const vfs = context.vfs;

    try {
      const destPath = this.resolvePath(context, destination);
      let destStat;

      try {
        destStat = await vfs.stat(destPath);
      } catch (error) {
        destStat = null; // Destination doesn't exist
      }

      // If multiple sources, destination must be a directory
      if (sources.length > 1) {
        if (!destStat || !destStat.isDirectory()) {
          await this.writeToStderr(
            context,
            `cp: target '${destination}' is not a directory\n`,
          );
          return ExitCode.FAILURE;
        }
      }

      let hasErrors = false;

      for (const source of sources) {
        try {
          const sourcePath = this.resolvePath(context, source);
          let finalDestPath = destPath;

          // Check if source exists
          let sourceStat;
          try {
            sourceStat = await vfs.stat(sourcePath);
          } catch (error) {
            await this.writeToStderr(
              context,
              `cp: cannot stat '${source}': No such file or directory\n`,
            );
            hasErrors = true;
            continue;
          }

          // If destination is a directory, copy into it
          if (destStat && destStat.isDirectory()) {
            const sourceName = sourcePath.split("/").pop();
            finalDestPath =
              destPath === "/" ? `/${sourceName}` : `${destPath}/${sourceName}`;
          }

          if (sourceStat.isDirectory()) {
            if (!recursive) {
              await this.writeToStderr(
                context,
                `cp: -r not specified; omitting directory '${source}'\n`,
              );
              hasErrors = true;
              continue;
            }

            await this.copyDirectoryRecursive(
              vfs,
              sourcePath,
              finalDestPath,
              verbose,
              context,
            );
          } else {
            // Copy file
            const content = await vfs.readFile(sourcePath);
            await vfs.writeFile(finalDestPath, content);

            if (verbose) {
              await this.writeToStdout(
                context,
                `'${source}' -> '${finalDestPath}'\n`,
              );
            }
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          await this.writeToStderr(
            context,
            `cp: cannot copy '${source}': ${message}\n`,
          );
          hasErrors = true;
        }
      }

      return hasErrors ? ExitCode.FAILURE : ExitCode.SUCCESS;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.writeToStderr(context, `cp: ${message}\n`);
      return ExitCode.FAILURE;
    }
  }

  private async copyDirectoryRecursive(
    vfs: any,
    sourcePath: string,
    destPath: string,
    verbose: boolean,
    context: CommandContext,
  ): Promise<void> {
    // Create destination directory
    try {
      await vfs.createDirectory(destPath);
    } catch (error) {
      // Directory might already exist
    }

    if (verbose) {
      await this.writeToStdout(context, `'${sourcePath}' -> '${destPath}'\n`);
    }

    // Copy all entries
    const entries = await vfs.readDir(sourcePath);

    for (const entry of entries) {
      const sourceEntryPath =
        sourcePath === "/" ? `/${entry.name}` : `${sourcePath}/${entry.name}`;
      const destEntryPath =
        destPath === "/" ? `/${entry.name}` : `${destPath}/${entry.name}`;

      if (entry.isDirectory()) {
        await this.copyDirectoryRecursive(
          vfs,
          sourceEntryPath,
          destEntryPath,
          verbose,
          context,
        );
      } else {
        const content = await vfs.readFile(sourceEntryPath);
        await vfs.writeFile(destEntryPath, content);

        if (verbose) {
          await this.writeToStdout(
            context,
            `'${sourceEntryPath}' -> '${destEntryPath}'\n`,
          );
        }
      }
    }
  }
}
