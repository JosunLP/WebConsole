/**
 * VFS-Inode (Filesystem-Metadaten)
 */

import { Timestamp } from "../types/index.js";

import { Permission, VfsItemType } from "../enums/index.js";

export interface INode {
  readonly inode: number;
  permissions: Permission;
  readonly uid?: number;
  readonly gid?: number;
  type: VfsItemType;
  size: number;
  readonly nlink?: number;
  readonly linkCount?: number; // Für ls-Command
  readonly blocks?: number;
  readonly atime?: Timestamp;
  mtime?: Timestamp;
  readonly ctime?: Timestamp;
  readonly modified?: number; // Für Sortierung in ls
  readonly owner?: string; // Für ls-Command
  readonly group?: string; // Für ls-Command
  readonly target?: string; // Für Symlinks
}
