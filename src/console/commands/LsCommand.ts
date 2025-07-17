/**
 * ls - List directory contents
 */

import { ExitCode, FileType } from '../../enums/index.js';
import { IDirEntry, INode, IVFS } from '../../interfaces/index.js';
import { CommandContext } from '../../types/index.js';
import { BaseCommand } from '../BaseCommand.js';

export class LsCommand extends BaseCommand {
  constructor(private vfs: IVFS) {
    super('ls', 'List directory contents', 'ls [OPTION]... [FILE]...');
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // Flags
    const longFormat = flags.has('l');
    const showAll = flags.has('a');
    const showAlmostAll = flags.has('A');
    const humanReadable = flags.has('h');
    const sortByTime = flags.has('t');
    const reverseSort = flags.has('r');

    // Paths to list (default: current directory)
    const paths = positional.length > 0 ? positional : ['.'];

    try {
      for (let i = 0; i < paths.length; i++) {
        const pathArg = paths[i];
        if (!pathArg) continue;

        const path = this.resolvePath(context, pathArg);

        if (paths.length > 1) {
          if (i > 0) await this.writeToStdout(context, '\n');
          await this.writeToStdout(context, `${path}:\n`);
        }

        await this.listDirectory(context, path, {
          longFormat,
          showAll,
          showAlmostAll,
          humanReadable,
          sortByTime,
          reverseSort,
        });

        if (i < paths.length - 1) {
          await this.writeToStdout(context, '\n');
        }
      }

      return ExitCode.SUCCESS;
    } catch (error) {
      return await this.outputError(context, `${error}`);
    }
  }

  private async listDirectory(
    context: CommandContext,
    path: string,
    options: {
      longFormat: boolean;
      showAll: boolean;
      showAlmostAll: boolean;
      humanReadable: boolean;
      sortByTime: boolean;
      reverseSort: boolean;
    }
  ): Promise<void> {
    try {
      // Check if path exists and is accessible
      const pathStat = await this.vfs.stat(path);

      if (pathStat.type === FileType.FILE) {
        // Single file
        if (options.longFormat) {
          await this.outputLongFormat(
            context,
            path,
            pathStat,
            options.humanReadable
          );
        } else {
          await this.writeToStdout(context, `${this.vfs.basename(path)}\n`);
        }
        return;
      }

      if (pathStat.type !== FileType.DIRECTORY) {
        throw new Error(`${path}: Not a directory`);
      }

      // Read directory contents
      let entries = await this.vfs.readDir(path);

      // Filter hidden files
      if (!options.showAll) {
        entries = entries.filter((entry) => {
          if (options.showAlmostAll) {
            return entry.name !== '.' && entry.name !== '..';
          } else {
            return !entry.name.startsWith('.');
          }
        });
      }

      // Get detailed info for each entry if needed
      const entriesWithStats: Array<{ entry: IDirEntry; stat: INode }> = [];

      for (const entry of entries) {
        const entryPath = this.vfs.join(path, entry.name);
        try {
          const stat = await this.vfs.stat(entryPath);
          entriesWithStats.push({ entry, stat });
        } catch {
          // Skip entries we can't stat
          continue;
        }
      }

      // Sort entries
      this.sortEntries(
        entriesWithStats,
        options.sortByTime,
        options.reverseSort
      );

      // Output
      if (options.longFormat) {
        await this.outputLongFormatList(
          context,
          entriesWithStats,
          options.humanReadable
        );
      } else {
        await this.outputShortFormatList(context, entriesWithStats);
      }
    } catch (error) {
      throw new Error(`cannot access '${path}': ${error}`);
    }
  }

  private sortEntries(
    entries: Array<{ entry: IDirEntry; stat: INode }>,
    sortByTime: boolean,
    reverse: boolean
  ): void {
    entries.sort((a, b) => {
      let comparison: number;

      if (sortByTime) {
        comparison = (b.stat.modified || 0) - (a.stat.modified || 0); // Newer first
      } else {
        comparison = a.entry.name.localeCompare(b.entry.name); // Alphabetical
      }

      return reverse ? -comparison : comparison;
    });
  }

  private async outputShortFormatList(
    context: CommandContext,
    entries: Array<{ entry: IDirEntry; stat: INode }>
  ): Promise<void> {
    const names = entries.map(({ entry, stat }) => {
      let name = entry.name;

      // Colorize based on file type
      switch (stat.type) {
        case FileType.DIRECTORY:
          name = this.colorize(name, BaseCommand.COLORS.BRIGHT_BLUE);
          break;
        case FileType.SYMLINK:
          name = this.colorize(name, BaseCommand.COLORS.BRIGHT_CYAN);
          break;
        default:
          // Check if executable
          if (stat.permissions & 0o111) {
            name = this.colorize(name, BaseCommand.COLORS.BRIGHT_GREEN);
          }
          break;
      }

      return name;
    });

    // Simple column output (could be improved with proper column formatting)
    const output = names.join('  ') + '\n';
    await this.writeToStdout(context, output);
  }

  private async outputLongFormatList(
    context: CommandContext,
    entries: Array<{ entry: IDirEntry; stat: INode }>,
    humanReadable: boolean
  ): Promise<void> {
    let output = '';

    for (const { entry, stat } of entries) {
      output += (await this.formatLongEntry(entry, stat, humanReadable)) + '\n';
    }

    await this.writeToStdout(context, output);
  }

  private async outputLongFormat(
    context: CommandContext,
    path: string,
    stat: INode,
    humanReadable: boolean
  ): Promise<void> {
    const entry: IDirEntry = {
      name: this.vfs.basename(path),
      inode: stat.inode,
      type: stat.type,
    };

    const formatted = await this.formatLongEntry(entry, stat, humanReadable);
    await this.writeToStdout(context, formatted + '\n');
  }

  private async formatLongEntry(
    entry: IDirEntry,
    stat: INode,
    humanReadable: boolean
  ): Promise<string> {
    // File type indicator
    let typeChar = '-';
    switch (stat.type) {
      case FileType.DIRECTORY:
        typeChar = 'd';
        break;
      case FileType.SYMLINK:
        typeChar = 'l';
        break;
      case FileType.BLOCK_DEVICE:
        typeChar = 'b';
        break;
      case FileType.CHAR_DEVICE:
        typeChar = 'c';
        break;
      case FileType.FIFO:
        typeChar = 'p';
        break;
    }

    // Permissions
    const perms = this.formatPermissions(stat.permissions);

    // Link count
    const linkCount = (stat.linkCount || 1).toString().padStart(3);

    // Owner and group
    const owner = (stat.owner || 'user').padEnd(8);
    const group = (stat.group || 'user').padEnd(8);

    // File size
    const size = humanReadable
      ? this.formatFileSize(stat.size).padStart(8)
      : stat.size.toString().padStart(8);

    // Date
    const date = this.formatDate(stat.modified || Date.now()).padEnd(12);

    // File name with color
    let name = entry.name;
    switch (stat.type) {
      case FileType.DIRECTORY:
        name = this.colorize(name, BaseCommand.COLORS.BRIGHT_BLUE);
        break;
      case FileType.SYMLINK:
        name = this.colorize(name, BaseCommand.COLORS.BRIGHT_CYAN);
        if (stat.target) {
          name += ` -> ${stat.target}`;
        }
        break;
      default:
        if (stat.permissions & 0o111) {
          name = this.colorize(name, BaseCommand.COLORS.BRIGHT_GREEN);
        }
        break;
    }

    return `${typeChar}${perms} ${linkCount} ${owner} ${group} ${size} ${date} ${name}`;
  }
}
