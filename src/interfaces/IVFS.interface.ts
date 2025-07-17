/**
 * Virtual File System Interface
 */

import {
  EventHandler,
  EventUnsubscriber,
  GlobPattern,
  MountConfig,
  Path,
  PermissionMask,
} from "../types/index.js";

import { IDirEntry } from "./IDirEntry.interface.js";
import { IEventEmitter } from "./IEventEmitter.interface.js";
import { INode } from "./INode.interface.js";

export interface IVFS extends IEventEmitter {
  // Lifecycle
  initialize(): Promise<void>;

  // Path Operations
  resolve(path: Path): Path;
  join(...paths: Path[]): Path;
  dirname(path: Path): Path;
  basename(path: Path, ext?: string): string;
  extname(path: Path): string;

  // File Operations
  readFile(path: Path): Promise<Uint8Array>;
  writeFile(
    path: Path,
    data: Uint8Array,
    options?: Partial<INode>,
  ): Promise<void>;
  appendFile(path: Path, data: Uint8Array): Promise<void>;
  deleteFile(path: Path): Promise<void>;
  exists(path: Path): boolean;
  stat(path: Path): Promise<INode>;

  // Directory Operations
  readDir(path: Path): Promise<IDirEntry[]>;
  createDir(path: Path, permissions?: PermissionMask): Promise<void>;
  deleteDir(path: Path, recursive?: boolean): Promise<void>;

  // Link Operations
  symlink(target: Path, linkPath: Path): Promise<void>;
  readlink(path: Path): Promise<Path>;

  // Mount Operations
  mount(config: MountConfig): Promise<void>;
  unmount(path: Path): Promise<void>;
  getMounts(): MountConfig[];

  // Watch Operations
  watch(path: Path, handler: EventHandler): EventUnsubscriber;

  // Glob Operations
  glob(pattern: GlobPattern, cwd?: Path): Promise<Path[]>;

  // Permissions
  chmod(path: Path, permissions: PermissionMask): Promise<void>;
  chown(path: Path, owner: string, group?: string): Promise<void>;
}
