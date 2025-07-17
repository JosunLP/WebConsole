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
  readonly blocks?: number;
  readonly atime?: Timestamp; // Für Kompatibilität
  mtime?: Timestamp; // Für Kompatibilität
  readonly ctime?: Timestamp; // Für Kompatibilität
}
