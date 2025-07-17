/**
 * Globale Typdefinitionen für das Web-Console-System
 */

import {
    ConsoleEvent,
    ExitCode,
    KernelEvent,
    PersistenceMode,
    RedirectionType,
    VFSEvent
} from '../enums/index.js';

/**
 * Eindeutige ID für verschiedene Entitäten
 */
export type ID = string;

/**
 * Unix-Timestamp in Millisekunden
 */
export type Timestamp = number;

/**
 * POSIX-ähnlicher Dateipfad
 */
export type Path = string;

/**
 * Mime-Type für Dateien
 */
export type MimeType = string;

/**
 * Umgebungsvariablen
 */
export type Environment = Record<string, string>;

/**
 * Befehlsargumente
 */
export type CommandArgs = string[];

/**
 * Exit-Handler für Befehle
 */
export type ExitHandler = (code: ExitCode) => void;

/**
 * Event-Handler generisch
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Async Event-Handler
 */
export type AsyncEventHandler<T = unknown> = (data: T) => Promise<void>;

/**
 * Observable-Pattern für Events
 */
export type EventUnsubscriber = () => void;

/**
 * Stream-Reader für Output
 */
export type StreamReader = ReadableStreamDefaultReader<Uint8Array>;

/**
 * Stream-Writer für Input
 */
export type StreamWriter = WritableStreamDefaultWriter<Uint8Array>;

/**
 * Color-Value (CSS-kompatibel)
 */
export type ColorValue = string;

/**
 * CSS-Custom-Property Name
 */
export type CSSCustomProperty = `--${string}`;

/**
 * Theme-Token Map
 */
export type ThemeTokens = Record<CSSCustomProperty, ColorValue | string>;

/**
 * Glob-Pattern für Dateisuche
 */
export type GlobPattern = string;

/**
 * Permissions als Oktal-Zahl (z.B. 0o755)
 */
export type PermissionMask = number;

/**
 * Inode-Nummer im VFS
 */
export type InodeNumber = number;

/**
 * Block-Adresse im Storage
 */
export type BlockAddress = number;

/**
 * Mount-Point Konfiguration
 */
export interface MountConfig {
  readonly path: Path;
  readonly provider: string;
  readonly options: Record<string, unknown>;
  readonly readOnly: boolean;
}

/**
 * State-Konfiguration
 */
export interface StateConfig<T = unknown> {
  readonly key: string;
  readonly defaultValue: T;
  readonly persistence: PersistenceMode;
  readonly serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
}

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
}

/**
 * Komplett geparste Kommandozeile
 */
export interface ParsedCommand {
  readonly segments: PipelineSegment[];
  readonly background: boolean;
  readonly environment: Environment;
}

/**
 * Event-Daten für verschiedene Events
 */
export interface EventData {
  [ConsoleEvent.COMMAND_ENTERED]: { command: string; args: CommandArgs };
  [ConsoleEvent.COMMAND_EXECUTING]: { command: string; pid: ID };
  [ConsoleEvent.COMMAND_COMPLETED]: { command: string; result: CommandResult };
  [ConsoleEvent.COMMAND_FAILED]: { command: string; error: Error };
  [ConsoleEvent.DIRECTORY_CHANGED]: { oldPath: Path; newPath: Path };
  [ConsoleEvent.THEME_CHANGED]: { oldTheme: string; newTheme: string };
  [ConsoleEvent.READY]: { consoleId: ID };
  [ConsoleEvent.DESTROYING]: { consoleId: ID };

  [VFSEvent.FILE_CREATED]: { path: Path; inode: InodeNumber };
  [VFSEvent.FILE_CHANGED]: { path: Path; inode: InodeNumber };
  [VFSEvent.FILE_DELETED]: { path: Path; inode: InodeNumber };
  [VFSEvent.DIRECTORY_CREATED]: { path: Path; inode: InodeNumber };
  [VFSEvent.DIRECTORY_DELETED]: { path: Path; inode: InodeNumber };
  [VFSEvent.MOUNT_ADDED]: { config: MountConfig };
  [VFSEvent.MOUNT_REMOVED]: { path: Path };

  [KernelEvent.STARTED]: { timestamp: Timestamp };
  [KernelEvent.SHUTTING_DOWN]: { timestamp: Timestamp };
  [KernelEvent.ERROR]: { error: Error; timestamp: Timestamp };
}

/**
 * Generic Event mit Type-Safety
 */
export type TypedEvent<K extends keyof EventData> = {
  readonly type: K;
  readonly data: EventData[K];
  readonly timestamp: Timestamp;
};

/**
 * Union aller möglichen Events
 */
export type AnyEvent = {
  [K in keyof EventData]: TypedEvent<K>;
}[keyof EventData];
