/**
 * Event-related type definitions
 */

import { ConsoleEvent, KernelEvent, VFSEvent } from "../enums/index.js";
import { CommandArgs, CommandResult } from "./command.type.js";
import { MountConfig } from "./config.type.js";
import { ID, InodeNumber, Path, Timestamp } from "./primitive.type.js";

/**
 * Event handler generic
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Async event handler
 */
export type AsyncEventHandler<T = unknown> = (data: T) => Promise<void>;

/**
 * Observable pattern for events
 */
export type EventUnsubscriber = () => void;

/**
 * Event data for various events
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
 * Generic event with type safety
 */
export type TypedEvent<K extends keyof EventData> = {
  readonly type: K;
  readonly data: EventData[K];
  readonly timestamp: Timestamp;
};

/**
 * Union of all possible events
 */
export type AnyEvent = {
  [K in keyof EventData]: TypedEvent<K>;
}[keyof EventData];
