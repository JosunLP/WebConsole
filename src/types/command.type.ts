/**
 * Command-related type definitions
 */

import { ExitCode, RedirectionType } from "../enums/index.js";
import { Environment, Path } from "./primitive.type.js";

/**
 * Command arguments
 */
export type CommandArgs = string[];

/**
 * Exit handler for commands
 */
export type ExitHandler = (code: ExitCode) => void;

/**
 * Command result
 */
export interface CommandResult {
  readonly exitCode: ExitCode;
  readonly stdout: Uint8Array;
  readonly stderr: Uint8Array;
  readonly executionTime: number;
}

/**
 * Command context
 */
export interface CommandContext {
  readonly args: CommandArgs;
  readonly environment: Environment;
  readonly workingDirectory: Path;
  readonly stdin: ReadableStream<Uint8Array>;
  readonly stdout: WritableStream<Uint8Array>;
  readonly stderr: WritableStream<Uint8Array>;
  readonly vfs: import("../interfaces/IVFS.interface.js").IVFS;
  readonly state: import("../interfaces/IStateManager.interface.js").IStateManager;
}

/**
 * Redirection definition
 */
export interface Redirection {
  readonly type: RedirectionType;
  readonly target: Path | number;
  readonly source?: number;
}

/**
 * Pipeline segment
 */
export interface PipelineSegment {
  readonly command: string;
  readonly args: CommandArgs;
  readonly redirections: Redirection[];
  readonly environment?: Environment; // Local environment variables for this command
}

/**
 * Completely parsed command line
 */
export interface ParsedCommand {
  readonly segments: PipelineSegment[];
  readonly background: boolean;
  readonly environment: Environment;
}
