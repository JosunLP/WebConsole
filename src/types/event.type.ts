/**
 * Event-bezogene Typdefinitionen
 */

import { ConsoleEvent, KernelEvent, VFSEvent } from '../enums/index.js';
import { CommandArgs, CommandResult } from './command.type.js';
import { MountConfig } from './config.type.js';
import { ID, InodeNumber, Path, Timestamp } from './primitive.type.js';

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
  [KernelEvent.SHUTDOWN]: { timestamp: Timestamp };
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
