/**
 * test / [ - Test file types and conditions
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class TestCommand extends BaseCommand {
  constructor() {
    super("test", "Test file types and conditions", "test EXPRESSION");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { positional } = this.parseArgs(context);

    if (positional.length === 0) {
      return ExitCode.FAILURE;
    }

    try {
      const result = await this.evaluateExpression(context, positional);
      return result ? ExitCode.SUCCESS : ExitCode.FAILURE;
    } catch (error) {
      await this.writeToStderr(context, `test: ${error}\n`);
      return ExitCode.FAILURE;
    }
  }

  private async evaluateExpression(
    context: CommandContext,
    args: string[],
  ): Promise<boolean> {
    // Handle different test patterns
    if (args.length === 1) {
      // test STRING - true if string is not empty
      return args[0].length > 0;
    }

    if (args.length === 2) {
      const [operator, operand] = args;
      return await this.evaluateUnaryTest(context, operator, operand);
    }

    if (args.length === 3) {
      const [left, operator, right] = args;
      return await this.evaluateBinaryTest(context, left, operator, right);
    }

    // Complex expressions not supported yet
    return false;
  }

  private async evaluateUnaryTest(
    context: CommandContext,
    operator: string,
    operand: string,
  ): Promise<boolean> {
    switch (operator) {
      case "-e": // File exists
        return await this.fileExists(context, operand);

      case "-f": // Is regular file
        return await this.isRegularFile(context, operand);

      case "-d": // Is directory
        return await this.isDirectory(context, operand);

      case "-r": // Is readable
        return await this.isReadable(context, operand);

      case "-w": // Is writable
        return await this.isWritable(context, operand);

      case "-x": // Is executable
        return await this.isExecutable(context, operand);

      case "-s": // File exists and is not empty
        return await this.isNotEmpty(context, operand);

      case "-L": // Is symbolic link
      case "-h":
        return await this.isSymlink(context, operand);

      case "-z": // String is empty
        return operand.length === 0;

      case "-n": // String is not empty
        return operand.length > 0;

      default:
        throw new Error(`Unknown unary operator: ${operator}`);
    }
  }

  private async evaluateBinaryTest(
    context: CommandContext,
    left: string,
    operator: string,
    right: string,
  ): Promise<boolean> {
    switch (operator) {
      case "=":
      case "==":
        return left === right;

      case "!=":
        return left !== right;

      case "-eq": // Numeric equal
        return parseInt(left, 10) === parseInt(right, 10);

      case "-ne": // Numeric not equal
        return parseInt(left, 10) !== parseInt(right, 10);

      case "-lt": // Less than
        return parseInt(left, 10) < parseInt(right, 10);

      case "-le": // Less than or equal
        return parseInt(left, 10) <= parseInt(right, 10);

      case "-gt": // Greater than
        return parseInt(left, 10) > parseInt(right, 10);

      case "-ge": // Greater than or equal
        return parseInt(left, 10) >= parseInt(right, 10);

      case "-nt": // Newer than (modification time)
        return await this.isNewer(context, left, right);

      case "-ot": // Older than (modification time)
        return await this.isOlder(context, left, right);

      case "-ef": // Same file (same inode)
        return await this.isSameFile(context, left, right);

      default:
        throw new Error(`Unknown binary operator: ${operator}`);
    }
  }

  // File test helper methods
  private async fileExists(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        return await context.vfs.exists(resolvedPath);
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isRegularFile(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat?.type === "file";
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isDirectory(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat?.type === "directory";
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isSymlink(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat?.type === "symlink";
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isReadable(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat && (stat.permissions & 0o444) !== 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isWritable(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat && (stat.permissions & 0o222) !== 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isExecutable(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat && (stat.permissions & 0o111) !== 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isNotEmpty(
    context: CommandContext,
    path: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const resolvedPath = context.vfs.resolvePath(path);
        const stat = await context.vfs.stat(resolvedPath);
        return stat && stat.size > 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isNewer(
    context: CommandContext,
    path1: string,
    path2: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const stat1 = await context.vfs.stat(context.vfs.resolvePath(path1));
        const stat2 = await context.vfs.stat(context.vfs.resolvePath(path2));

        if (!stat1 || !stat2) return false;

        const mtime1 = stat1.mtime || 0;
        const mtime2 = stat2.mtime || 0;

        return mtime1 > mtime2;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isOlder(
    context: CommandContext,
    path1: string,
    path2: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const stat1 = await context.vfs.stat(context.vfs.resolvePath(path1));
        const stat2 = await context.vfs.stat(context.vfs.resolvePath(path2));

        if (!stat1 || !stat2) return false;

        const mtime1 = stat1.mtime || 0;
        const mtime2 = stat2.mtime || 0;

        return mtime1 < mtime2;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async isSameFile(
    context: CommandContext,
    path1: string,
    path2: string,
  ): Promise<boolean> {
    try {
      if (context.vfs) {
        const stat1 = await context.vfs.stat(context.vfs.resolvePath(path1));
        const stat2 = await context.vfs.stat(context.vfs.resolvePath(path2));

        if (!stat1 || !stat2) return false;

        return stat1.inode === stat2.inode;
      }
      return false;
    } catch {
      return false;
    }
  }

  protected getDetailedHelp(): string {
    return `
Test file types and conditions.

Usage: test EXPRESSION
       [ EXPRESSION ]

File tests:
  -e FILE         True if file exists
  -f FILE         True if file is a regular file
  -d FILE         True if file is a directory
  -L FILE         True if file is a symbolic link
  -r FILE         True if file is readable
  -w FILE         True if file is writable
  -x FILE         True if file is executable
  -s FILE         True if file exists and is not empty

String tests:
  -z STRING       True if string is empty
  -n STRING       True if string is not empty
  STRING          True if string is not empty
  STR1 = STR2     True if strings are equal
  STR1 != STR2    True if strings are not equal

Numeric tests:
  INT1 -eq INT2   True if integers are equal
  INT1 -ne INT2   True if integers are not equal
  INT1 -lt INT2   True if INT1 is less than INT2
  INT1 -le INT2   True if INT1 is less than or equal to INT2
  INT1 -gt INT2   True if INT1 is greater than INT2
  INT1 -ge INT2   True if INT1 is greater than or equal to INT2

File comparison:
  FILE1 -nt FILE2 True if FILE1 is newer than FILE2
  FILE1 -ot FILE2 True if FILE1 is older than FILE2
  FILE1 -ef FILE2 True if FILE1 and FILE2 are the same file

Examples:
  test -f /etc/passwd     # Test if file exists and is regular file
  test -d /tmp            # Test if directory exists
  test "$var" = "value"   # Test string equality
  test 5 -gt 3            # Test numeric comparison
  [ -r file.txt ]         # Alternative syntax

Exit Status:
  0    if expression is true
  1    if expression is false or error occurred

Notes:
  - The [ command is equivalent to test
  - Use quotes around variables to handle empty values
  - Numeric tests treat non-numeric strings as 0
`;
  }
}
