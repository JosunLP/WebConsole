/**
 * echo - Display text
 */

import { ExitCode } from '../../enums/index.js';
import { CommandContext } from '../../types/index.js';
import { BaseCommand } from '../BaseCommand.js';

export class EchoCommand extends BaseCommand {
  constructor() {
    super(
      'echo',
      'Display a line of text',
      'echo [OPTION]... [STRING]...'
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // -n: do not output the trailing newline
    // -e: enable interpretation of backslash escapes
    // -E: disable interpretation of backslash escapes (default)
    const noNewline = flags.has('n');
    const enableEscapes = flags.has('e');
    const disableEscapes = flags.has('E');

    // If both -e and -E are specified, the last one wins
    const interpretEscapes = enableEscapes && !disableEscapes;

    // Join all arguments with spaces
    let output = positional.join(' ');

    // Process escape sequences if enabled
    if (interpretEscapes) {
      output = this.processEscapeSequences(output);
    }

    // Add newline unless -n is specified
    if (!noNewline) {
      output += '\n';
    }

    await this.writeToStdout(context, output);
    return ExitCode.SUCCESS;
  }

  /**
   * Process backslash escape sequences
   */
  private processEscapeSequences(text: string): string {
    return text
      .replace(/\\a/g, '\x07')    // alert (bell)
      .replace(/\\b/g, '\x08')    // backspace
      .replace(/\\c/g, '')        // suppress trailing newline
      .replace(/\\e/g, '\x1b')    // escape
      .replace(/\\f/g, '\x0c')    // form feed
      .replace(/\\n/g, '\n')      // newline
      .replace(/\\r/g, '\r')      // carriage return
      .replace(/\\t/g, '\t')      // horizontal tab
      .replace(/\\v/g, '\x0b')    // vertical tab
      .replace(/\\\\/g, '\\')     // backslash
      .replace(/\\0([0-7]{1,3})/g, (match, octal) => {
        // Octal escape sequence
        const charCode = parseInt(octal, 8);
        return String.fromCharCode(charCode);
      })
      .replace(/\\x([0-9a-fA-F]{1,2})/g, (match, hex) => {
        // Hexadecimal escape sequence
        const charCode = parseInt(hex, 16);
        return String.fromCharCode(charCode);
      });
  }

  /**
   * Special handling for echo with no arguments
   */
  static async echoEmpty(context: CommandContext): Promise<ExitCode> {
    const command = new EchoCommand();
    await command.writeToStdout(context, '\n');
    return ExitCode.SUCCESS;
  }

  /**
   * Utility method for other commands to echo text
   */
  static async echoText(context: CommandContext, text: string, options?: {
    noNewline?: boolean;
    enableEscapes?: boolean;
  }): Promise<void> {
    const command = new EchoCommand();
    let output = text;

    if (options?.enableEscapes) {
      output = command.processEscapeSequences(output);
    }

    if (!options?.noNewline) {
      output += '\n';
    }

    await command.writeToStdout(context, output);
  }
}
