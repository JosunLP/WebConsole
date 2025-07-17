/**
 * VFS-Provider Interface
 */

import { FileType } from "../enums/index.js";
import { InodeNumber, PermissionMask } from "../types/index.js";
import { IDirEntry } from "./IDirEntry.interface.js";
import { INode } from "./INode.interface.js";

export interface IVFSProvider {
  readonly name: string;
  readonly readOnly: boolean;

  readFile(inode: InodeNumber): Promise<Uint8Array>;
  writeFile(inode: InodeNumber, data: Uint8Array): Promise<void>;
  createInode(type: FileType, permissions: PermissionMask): Promise<INode>;
  deleteInode(inode: InodeNumber): Promise<void>;
  updateInode(inode: InodeNumber, updates: Partial<INode>): Promise<INode>;
  readDir(inode: InodeNumber): Promise<IDirEntry[]>;
  exists(inode: InodeNumber): Promise<boolean>;
}
