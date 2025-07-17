/**
 * Kommando-bezogene Typdefinitionen
 */

import { ExitCode, RedirectionType } from "../enums/index.js";
import { Environment, Path } from "./primitive.type.js";

/**
 * Befehlsargumente
 */
export type CommandArgs = string[];

/**
 * Exit-Handler für Befehle
 */
export type ExitHandler = (code: ExitCode) => void;

/**
 * Command-Ergebnis
 */
export interface CommandResult {
  readonly exitCode: ExitCode;
  readonly stdout: Uint8Array;
  readonly stderr: Uint8Array;
  readonly executionTime: number;
}

/**
 * Command-Kontext
 */
export interface CommandContext {
  readonly args: CommandArgs;
  readonly environment: Environment;
  readonly workingDirectory: Path;
  readonly stdin: ReadableStream<Uint8Array>;
  readonly stdout: WritableStream<Uint8Array>;
  readonly stderr: WritableStream<Uint8Array>;
  readonly vfs: any; // VirtualFileSystem
  readonly state: any; // StateManager with cwd property
}

/**
 * Redirection-Definiton
 */
export interface Redirection {
  readonly type: RedirectionType;
  readonly target: Path | number;
  readonly source?: number;
}

/**
 * Pipeline-Segment
 */
export interface PipelineSegment {
  readonly command: string;
  readonly args: CommandArgs;
  readonly redirections: Redirection[];
  readonly environment?: Environment; // Lokale Environment-Variablen für diesen Befehl
}

/**
 * Komplett geparste Kommandozeile
 */
export interface ParsedCommand {
  readonly segments: PipelineSegment[];
  readonly background: boolean;
  readonly environment: Environment;
}
