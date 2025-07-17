/**
 * VFS-Inode (Filesystem-Metadaten)
 */

import {
  BlockAddress,
  InodeNumber,
  MimeType,
  Path,
  PermissionMask,
  Timestamp,
} from "../types/index.js";

import { FileType } from "../enums/index.js";

export interface INode {
  readonly inode: InodeNumber;
  readonly type: FileType;
  readonly permissions: PermissionMask;
  readonly owner: string;
  readonly group: string;
  readonly size: number;
  readonly created: Timestamp;
  readonly modified: Timestamp;
  readonly accessed: Timestamp;
  readonly mtime?: Timestamp; // Für Kompatibilität
  readonly atime?: Timestamp; // Für Kompatibilität
  readonly ctime?: Timestamp; // Für Kompatibilität
  readonly mimeType?: MimeType;
  readonly blocks: BlockAddress[];
  readonly linkCount: number;
  readonly target?: Path; // Für Symlinks
}
