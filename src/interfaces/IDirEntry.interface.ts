/**
 * VFS-Eintrag (Directory Entry)
 */

import { FileType } from "../enums/index.js";
import { InodeNumber } from "../types/index.js";

export interface IDirEntry {
  readonly name: string;
  readonly inode: InodeNumber;
  readonly type: FileType;
}
