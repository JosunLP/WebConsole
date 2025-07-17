import { ExitCode } from "../../enums/ExitCode.enum.js";
import type { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

/**
 * mv - Move/rename files and directories
 *
 * Syntax: mv source... destination
 *
 * Moves or renames files and directories.
 */
export class MvCommand extends BaseCommand {
  constructor() {
    super(
      "mv",
      "Move/rename files and directories",
      "mv source... destination",
    );
  }

  override async execute(context: CommandContext): Promise<ExitCode> {
    const args = context.args.slice(1); // Remove command name

    if (args.length < 2) {
      await this.writeToStderr(context, "mv: missing file operand\n");
      await this.writeToStderr(
        context,
        "Try 'mv --help' for more information.\n",
      );
      return ExitCode.FAILURE;
    }

    const verbose = args.includes("-v");
    const fileArgs = args.filter((arg) => !arg.startsWith("-"));

    if (fileArgs.length < 2) {
      await this.writeToStderr(
        context,
        "mv: missing destination file operand\n",
      );
      return ExitCode.FAILURE;
    }

    const destination = fileArgs[fileArgs.length - 1];
    const sources = fileArgs.slice(0, -1);
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
            `mv: target '${destination}' is not a directory\n`,
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
              `mv: cannot stat '${source}': No such file or directory\n`,
            );
            hasErrors = true;
            continue;
          }

          // If destination is a directory, move into it
          if (destStat && destStat.isDirectory()) {
            const sourceName = sourcePath.split("/").pop();
            finalDestPath =
              destPath === "/" ? `/${sourceName}` : `${destPath}/${sourceName}`;
          }

          // Check if trying to move to same location
          if (sourcePath === finalDestPath) {
            await this.writeToStderr(
              context,
              `mv: '${source}' and '${finalDestPath}' are the same file\n`,
            );
            hasErrors = true;
            continue;
          }

          // Perform the move operation
          if (sourceStat.isDirectory()) {
            await this.moveDirectory(
              vfs,
              sourcePath,
              finalDestPath,
              verbose,
              context,
            );
          } else {
            await this.moveFile(
              vfs,
              sourcePath,
              finalDestPath,
              verbose,
              context,
            );
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          await this.writeToStderr(
            context,
            `mv: cannot move '${source}': ${message}\n`,
          );
          hasErrors = true;
        }
      }

      return hasErrors ? ExitCode.FAILURE : ExitCode.SUCCESS;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.writeToStderr(context, `mv: ${message}\n`);
      return ExitCode.FAILURE;
    }
  }

  private async moveFile(
    vfs: any,
    sourcePath: string,
    destPath: string,
    verbose: boolean,
    context: CommandContext,
  ): Promise<void> {
    // Read source file
    const content = await vfs.readFile(sourcePath);

    // Write to destination
    await vfs.writeFile(destPath, content);

    // Delete source
    await vfs.deleteFile(sourcePath);

    if (verbose) {
      await this.writeToStdout(context, `'${sourcePath}' -> '${destPath}'\n`);
    }
  }

  private async moveDirectory(
    vfs: any,
    sourcePath: string,
    destPath: string,
    verbose: boolean,
    context: CommandContext,
  ): Promise<void> {
    // Copy directory recursively
    await this.copyDirectoryRecursive(
      vfs,
      sourcePath,
      destPath,
      verbose,
      context,
    );

    // Remove source directory
    await this.removeDirectoryRecursive(vfs, sourcePath);
  }

  private async copyDirectoryRecursive(
    vfs: any,
    sourcePath: string,
    destPath: string,
    verbose: boolean,
    context: CommandContext,
  ): Promise<void> {
    // Create destination directory
    await vfs.createDirectory(destPath);

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
      }
    }
  }

  private async removeDirectoryRecursive(
    vfs: any,
    dirPath: string,
  ): Promise<void> {
    const entries = await vfs.readDir(dirPath);

    // Remove all entries first
    for (const entry of entries) {
      const entryPath =
        dirPath === "/" ? `/${entry.name}` : `${dirPath}/${entry.name}`;

      if (entry.isDirectory()) {
        await this.removeDirectoryRecursive(vfs, entryPath);
      } else {
        await vfs.deleteFile(entryPath);
      }
    }

    // Remove the directory itself
    await vfs.deleteDirectory(dirPath);
  }
}
