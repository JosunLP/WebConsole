/**
 * cat - Display file contents
 */

import { ExitCode, VfsError, VfsItemType } from '../../enums/index.js';
import { CommandContext } from '../../types/index.js';
import { BaseCommand } from '../BaseCommand.js';

export class CatCommand extends BaseCommand {
  constructor() {
    super('cat', 'Display file contents', 'cat [OPTION]... [FILE]...');
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // Options
    const showLineNumbers = flags.has('n') || flags.has('number');
    const showNonBlank = flags.has('b') || flags.has('number-nonblank');
    const showEnds = flags.has('E') || flags.has('show-ends');
    const showTabs = flags.has('T') || flags.has('show-tabs');
    const showAll = flags.has('A') || flags.has('show-all');
    const squeezeBlank = flags.has('s') || flags.has('squeeze-blank');

    // If no files specified, read from stdin
    if (positional.length === 0) {
      await this.readFromStdin(context, {
        showLineNumbers,
        showNonBlank,
        showEnds,
        showTabs,
        showAll,
        squeezeBlank,
      });
      return ExitCode.SUCCESS;
    }

    let hasErrors = false;

    for (const filePath of positional) {
      const result = await this.catFile(context, filePath, {
        showLineNumbers,
        showNonBlank,
        showEnds,
        showTabs,
        showAll,
        squeezeBlank,
      });

      if (result !== ExitCode.SUCCESS) {
        hasErrors = true;
      }
    }

    return hasErrors ? ExitCode.FAILURE : ExitCode.SUCCESS;
  }

  private async catFile(
    context: CommandContext,
    filePath: string,
    options: {
      showLineNumbers: boolean;
      showNonBlank: boolean;
      showEnds: boolean;
      showTabs: boolean;
      showAll: boolean;
      squeezeBlank: boolean;
    }
  ): Promise<ExitCode> {
    try {
      // Resolve path
      const resolvedPath = context.vfs.resolvePath(filePath, context.state.cwd);

      // Check if file exists and get info
      const fileInfo = await context.vfs.stat(resolvedPath);

      if (fileInfo.type !== VfsItemType.FILE) {
        await this.writeToStderr(context, `cat: ${filePath}: Is a directory\n`);
        return ExitCode.FAILURE;
      }

      // Read file content
      const content = await context.vfs.readFile(resolvedPath);

      // Process content based on options
      const processedContent = this.processContent(content, options);

      await this.writeToStdout(context, processedContent);
      return ExitCode.SUCCESS;
    } catch (error: any) {
      let errorMessage: string;

      switch (error.code) {
        case VfsError.NOT_FOUND:
          errorMessage = `cat: ${filePath}: No such file or directory\n`;
          break;
        case VfsError.ACCESS_DENIED:
          errorMessage = `cat: ${filePath}: Permission denied\n`;
          break;
        case VfsError.IS_DIRECTORY:
          errorMessage = `cat: ${filePath}: Is a directory\n`;
          break;
        default:
          errorMessage = `cat: ${filePath}: ${error.message}\n`;
      }

      await this.writeToStderr(context, errorMessage);
      return ExitCode.FAILURE;
    }
  }

  private processContent(
    content: string,
    options: {
      showLineNumbers: boolean;
      showNonBlank: boolean;
      showEnds: boolean;
      showTabs: boolean;
      showAll: boolean;
      squeezeBlank: boolean;
    }
  ): string {
    let lines = content.split('\n');

    // Squeeze blank lines
    if (options.squeezeBlank) {
      lines = this.squeezeBlankLines(lines);
    }

    // Process each line
    let lineNumber = 1;
    const processedLines = lines.map((line, index) => {
      let processedLine = line;

      // Show tabs as ^I
      if (options.showTabs || options.showAll) {
        processedLine = processedLine.replace(/\t/g, '^I');
      }

      // Show other non-printing characters
      if (options.showAll) {
        processedLine = this.showNonPrintingChars(processedLine);
      }

      // Show line ends as $
      if (options.showEnds || options.showAll) {
        processedLine += '$';
      }

      // Add line numbers
      if (options.showLineNumbers || options.showNonBlank) {
        const isBlank = line.trim() === '';

        if (options.showNonBlank && isBlank) {
          // Don't number blank lines
          processedLine = '     \t' + processedLine;
        } else {
          const numberStr = lineNumber.toString().padStart(6, ' ');
          processedLine = numberStr + '\t' + processedLine;
          lineNumber++;
        }
      }

      return processedLine;
    });

    return processedLines.join('\n');
  }

  private squeezeBlankLines(lines: string[]): string[] {
    const result: string[] = [];
    let prevWasBlank = false;

    for (const line of lines) {
      const isBlank = line.trim() === '';

      if (isBlank && prevWasBlank) {
        // Skip consecutive blank lines
        continue;
      }

      result.push(line);
      prevWasBlank = isBlank;
    }

    return result;
  }

  private showNonPrintingChars(line: string): string {
    return line
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);

        // Control characters (0-31, except tab)
        if (code >= 0 && code <= 31 && char !== '\t') {
          return '^' + String.fromCharCode(code + 64);
        }

        // DEL (127)
        if (code === 127) {
          return '^?';
        }

        // High bit characters (128-255)
        if (code >= 128 && code <= 255) {
          return 'M-' + String.fromCharCode(code - 128);
        }

        return char;
      })
      .join('');
  }

  /**
   * Utility method for syntax highlighting (basic implementation)
   */
  private applySyntaxHighlighting(content: string, fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'js':
      case 'ts':
        return this.highlightJavaScript(content);
      case 'json':
        return this.highlightJson(content);
      case 'css':
        return this.highlightCss(content);
      case 'html':
        return this.highlightHtml(content);
      default:
        return content;
    }
  }

  private highlightJavaScript(content: string): string {
    // Basic JavaScript syntax highlighting with ANSI codes
    return content
      .replace(
        /\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/g,
        '\x1b[35m$1\x1b[0m'
      ) // Purple for keywords
      .replace(/\/\/.*$/gm, '\x1b[32m$&\x1b[0m') // Green for comments
      .replace(/"[^"]*"/g, '\x1b[33m$&\x1b[0m') // Yellow for strings
      .replace(/'[^']*'/g, '\x1b[33m$&\x1b[0m'); // Yellow for strings
  }

  private highlightJson(content: string): string {
    return content
      .replace(/"[^"]*":/g, '\x1b[36m$&\x1b[0m') // Cyan for keys
      .replace(/:\s*"[^"]*"/g, (match) =>
        match.replace(/"[^"]*"$/, '\x1b[33m$&\x1b[0m')
      ) // Yellow for string values
      .replace(/:\s*(true|false|null)/g, (match) =>
        match.replace(/(true|false|null)/, '\x1b[35m$1\x1b[0m')
      ); // Purple for literals
  }

  private highlightCss(content: string): string {
    return content
      .replace(/[.#]?[a-zA-Z-]+(?=\s*{)/g, '\x1b[34m$&\x1b[0m') // Blue for selectors
      .replace(/[a-zA-Z-]+(?=\s*:)/g, '\x1b[36m$&\x1b[0m') // Cyan for properties
      .replace(/:\s*[^;{}]+/g, (match) =>
        match.replace(/:\s*(.+)/, ': \x1b[33m$1\x1b[0m')
      ); // Yellow for values
  }

  private highlightHtml(content: string): string {
    return content
      .replace(/<[^>]+>/g, '\x1b[34m$&\x1b[0m') // Blue for tags
      .replace(/\s+\w+=/g, '\x1b[36m$&\x1b[0m') // Cyan for attributes
      .replace(/"[^"]*"/g, '\x1b[33m$&\x1b[0m'); // Yellow for attribute values
  }

  private async readFromStdin(
    context: CommandContext,
    options: {
      showLineNumbers: boolean;
      showNonBlank: boolean;
      showEnds: boolean;
      showTabs: boolean;
      showAll: boolean;
      squeezeBlank: boolean;
    }
  ): Promise<void> {
    // For now, just display a message since we don't have proper stdin support
    await this.writeToStdout(
      context,
      'cat: Press Ctrl+C to exit. Type content and press Enter:\n'
    );

    // In a real implementation, this would read from stdin stream
    // For now, we'll simulate it by asking for input
    await this.writeToStdout(context, '> ');

    // This is a placeholder - in a real implementation we would:
    // 1. Set up a readline interface
    // 2. Listen for input events
    // 3. Process each line according to the options
    // 4. Continue until EOF (Ctrl+D) or interruption (Ctrl+C)
  }
}
