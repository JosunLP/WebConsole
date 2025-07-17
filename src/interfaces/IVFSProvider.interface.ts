/**
 * VFS-Provider Interface
 */

import { VfsItemType } from '../enums/index.js';
import { InodeNumber, PermissionMask } from '../types/index.js';
import { IDirEntry } from './IDirEntry.interface.js';
import { INode } from './INode.interface.js';

export interface IVFSProvider {
  readonly name: string;
  readonly readOnly: boolean;

  readFile(inode: InodeNumber): Promise<Uint8Array>;
  writeFile(inode: InodeNumber, data: Uint8Array): Promise<void>;
  createInode(type: VfsItemType, permissions: PermissionMask): Promise<INode>;
  deleteInode(inode: InodeNumber): Promise<void>;
  updateInode(inode: InodeNumber, updates: Partial<INode>): Promise<INode>;
  readDir(inode: InodeNumber): Promise<IDirEntry[]>;
  exists(inode: InodeNumber): Promise<boolean>;

  // Optional initialization method
  initialize?(): Promise<void>;

  // Optional directory management
  addChild?(
    parentInode: InodeNumber,
    name: string,
    childInode: InodeNumber
  ): Promise<void>;
  removeChild?(parentInode: InodeNumber, name: string): Promise<void>;
}
