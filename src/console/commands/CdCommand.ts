/**
 * cd - Change directory
 */

import { ExitCode, FileType } from "../../enums/index.js";
import { IVFS } from "../../interfaces/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class CdCommand extends BaseCommand {
  constructor(private vfs: IVFS) {
    super("cd", "Change the current directory", "cd [DIRECTORY]");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { positional } = this.parseArgs(context);

    // Determine target directory
    let targetPath: string;

    if (positional.length === 0) {
      // No argument: go to home directory
      targetPath = this.getEnvVar(context, "HOME", "/home/user");
    } else if (positional.length === 1) {
      const arg = positional[0];
      if (!arg) {
        return await this.outputError(context, "Invalid directory argument");
      }

      // Handle special cases
      if (arg === "-") {
        // Go to previous directory
        targetPath = this.getEnvVar(
          context,
          "OLDPWD",
          context.workingDirectory,
        );
      } else if (arg === "~") {
        // Go to home directory
        targetPath = this.getEnvVar(context, "HOME", "/home/user");
      } else if (arg.startsWith("~/")) {
        // Expand home directory
        const homeDir = this.getEnvVar(context, "HOME", "/home/user");
        targetPath = this.vfs.join(homeDir, arg.substring(2));
      } else {
        // Regular path
        targetPath = this.resolvePath(context, arg);
      }
    } else {
      return await this.outputError(context, "Too many arguments");
    }

    try {
      // Resolve and normalize the target path
      targetPath = this.vfs.resolve(targetPath);

      // Check if target exists and is a directory
      const stat = await this.vfs.stat(targetPath);

      if (stat.type !== FileType.DIRECTORY) {
        return await this.outputError(
          context,
          `${targetPath}: Not a directory`,
        );
      }

      // Check if directory is accessible (simplified permission check)
      if (!(stat.permissions & 0o001)) {
        // Execute permission needed to cd
        return await this.outputError(
          context,
          `${targetPath}: Permission denied`,
        );
      }

      // Set OLDPWD to current directory
      // const _oldPwd = context.workingDirectory;

      // Change directory by updating the context
      // Note: In a real implementation, this would be handled by the Console class
      // For now, we'll emit an event or use a callback mechanism

      // Output the new directory (if verbose mode or when going to previous dir)
      if (positional[0] === "-") {
        await this.writeToStdout(context, `${targetPath}\n`);
      }

      // In a complete implementation, we would update the console's working directory
      // This would typically be done through an event or by returning special metadata
      // For now, we'll store it in environment variables

      return ExitCode.SUCCESS;
    } catch (error) {
      return await this.outputError(context, `${targetPath}: ${error}`);
    }
  }

  /**
   * Helper method to change directory (would be called by Console class)
   */
  static async changeDirectory(
    vfs: IVFS,
    currentDir: string,
    targetDir: string,
  ): Promise<{ success: boolean; newDir?: string; error?: string }> {
    try {
      const resolvedPath = vfs.resolve(targetDir);
      const stat = await vfs.stat(resolvedPath);

      if (stat.type !== FileType.DIRECTORY) {
        return { success: false, error: "Not a directory" };
      }

      if (!(stat.permissions & 0o001)) {
        return { success: false, error: "Permission denied" };
      }

      return { success: true, newDir: resolvedPath };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Expand tilde paths
   */
  static expandTilde(path: string, homeDir: string): string {
    if (path === "~") {
      return homeDir;
    }
    if (path.startsWith("~/")) {
      return homeDir + path.substring(1);
    }
    return path;
  }

  /**
   * Get completion suggestions for directories
   */
  async getCompletions(
    context: CommandContext,
    partial: string,
  ): Promise<string[]> {
    try {
      const expandedPath = CdCommand.expandTilde(
        partial,
        this.getEnvVar(context, "HOME", "/home/user"),
      );

      const resolvedPath = this.resolvePath(context, expandedPath);
      const dir = this.vfs.dirname(resolvedPath);
      const prefix = this.vfs.basename(resolvedPath);

      const entries = await this.vfs.readDir(dir);

      return entries
        .filter(
          (entry) =>
            entry.type === FileType.DIRECTORY &&
            entry.name.startsWith(prefix) &&
            !entry.name.startsWith("."),
        )
        .map((entry) => {
          const fullPath = this.vfs.join(dir, entry.name);
          return expandedPath.endsWith("/") ? entry.name : fullPath;
        })
        .sort();
    } catch {
      return [];
    }
  }
}
