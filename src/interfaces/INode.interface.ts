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
  readonly linkCount?: number; // For ls command
  readonly blocks?: number;
  readonly atime?: Timestamp;
  mtime?: Timestamp;
  readonly ctime?: Timestamp;
  readonly modified?: number; // For sorting in ls
  readonly owner?: string; // For ls command
  readonly group?: string; // For ls command
  readonly target?: string; // For symlinks
}
