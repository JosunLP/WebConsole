/**
 * VFS-Eintrag (Directory Entry)
 */

import { VfsItemType } from "../enums/index.js";
import { InodeNumber } from "../types/index.js";

export interface IDirEntry {
  readonly name: string;
  readonly inode: InodeNumber;
  readonly type: VfsItemType;
}
