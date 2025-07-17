import { ExitCode } from "../../enums/ExitCode.enum.js";
import type { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

/**
 * mkdir - Create directories
 *
 * Syntax: mkdir [-p] directory...
 *
 * Creates one or more directories. With -p flag, creates parent directories
 * as needed and doesn't fail if directory already exists.
 */
export class MkdirCommand extends BaseCommand {
  constructor() {
    super("mkdir", "Create directories", "mkdir [-p] directory...");
  }

  override async execute(context: CommandContext): Promise<ExitCode> {
    const args = context.args.slice(1); // Remove command name

    if (args.length === 0) {
      await this.writeToStderr(context, "mkdir: missing operand\n");
      await this.writeToStderr(
        context,
        "Try 'mkdir --help' for more information.\n",
      );
      return ExitCode.FAILURE;
    }

    const createParents = args.includes("-p");
    const verbose = args.includes("-v");
    const directories = args.filter((arg) => !arg.startsWith("-"));

    if (directories.length === 0) {
      await this.writeToStderr(context, "mkdir: missing directory operand\n");
      return ExitCode.FAILURE;
    }

    const vfs = context.vfs;
    const currentDir = context.workingDirectory;
    let hasErrors = false;

    for (const dirPath of directories) {
      try {
        const absolutePath = this.resolvePath(context, dirPath);

        if (createParents) {
          // Create parent directories recursively
          await this.createDirectoryRecursive(
            vfs,
            absolutePath,
            verbose,
            context,
          );
        } else {
          // Check if parent exists
          const parentPath =
            absolutePath.substring(0, absolutePath.lastIndexOf("/")) || "/";

          try {
            await vfs.stat(parentPath);
          } catch (error) {
            await this.writeToStderr(
              context,
              `mkdir: cannot create directory '${dirPath}': No such file or directory\n`,
            );
            hasErrors = true;
            continue;
          }

          // Check if directory already exists
          try {
            await vfs.stat(absolutePath);
            await this.writeToStderr(
              context,
              `mkdir: cannot create directory '${dirPath}': File exists\n`,
            );
            hasErrors = true;
            continue;
          } catch (error) {
            // Directory doesn't exist, create it
          }

          await vfs.createDirectory(absolutePath);

          if (verbose) {
            await this.writeToStdout(
              context,
              `mkdir: created directory '${dirPath}'\n`,
            );
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.writeToStderr(
          context,
          `mkdir: cannot create directory '${dirPath}': ${message}\n`,
        );
        hasErrors = true;
      }
    }

    return hasErrors ? ExitCode.FAILURE : ExitCode.SUCCESS;
  }

  private async createDirectoryRecursive(
    vfs: any,
    path: string,
    verbose: boolean,
    context: CommandContext,
  ): Promise<void> {
    const parts = path.split("/").filter((part) => part.length > 0);
    let currentPath = "";

    for (const part of parts) {
      currentPath += "/" + part;

      try {
        const stat = await vfs.stat(currentPath);
        if (!stat.isDirectory()) {
          throw new Error(`'${currentPath}' exists but is not a directory`);
        }
      } catch (error) {
        // Directory doesn't exist, create it
        await vfs.createDirectory(currentPath);

        if (verbose) {
          await this.writeToStdout(
            context,
            `mkdir: created directory '${currentPath}'\n`,
          );
        }
      }
    }
  }

  private normalizePath(path: string): string {
    const parts = path.split("/").filter((part) => part.length > 0);
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        if (normalized.length > 0) {
          normalized.pop();
        }
      } else {
        normalized.push(part);
      }
    }

    return "/" + normalized.join("/");
  }
}
