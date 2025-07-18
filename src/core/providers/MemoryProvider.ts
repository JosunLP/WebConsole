/**
 * Memory VFS Provider
 * Implements a purely memory-based virtual file system
 */

import { FileType, Permission, VfsItemType } from "../../enums/index.js";
import { IDirEntry, INode, IVFSProvider } from "../../interfaces/index.js";
import type { InodeNumber, PermissionMask } from "../../types/index.js";

interface MemoryEntry {
  inode: INode;
  data?: Uint8Array;
  children?: Map<string, InodeNumber>;
}

// interface MutableINode extends Omit<INode, "size" | "modified" | "accessed"> {
//   size: number;
//   modified: Timestamp;
//   accessed: Timestamp;
// }

export class MemoryProvider implements IVFSProvider {
  public readonly name = "memory";
  public readonly readOnly = false;

  private storage = new Map<InodeNumber, MemoryEntry>();
  private nextInode = 1;

  constructor() {
    // Create root directory
    this.createRootDirectory();
  }

  async readFile(inode: InodeNumber): Promise<Uint8Array> {
    const entry = this.storage.get(inode);
    if (!entry || entry.inode.type !== FileType.FILE) {
      throw new Error(`File not found: ${inode}`);
    }
    return entry.data || new Uint8Array(0);
  }

  async writeFile(inode: InodeNumber, data: Uint8Array): Promise<void> {
    const entry = this.storage.get(inode);
    if (!entry || entry.inode.type !== FileType.FILE) {
      throw new Error(`File not found: ${inode}`);
    }

    entry.data = data;

    // Create new INode with updated values
    const updatedInode: INode = {
      ...entry.inode,
      size: data.length,
      mtime: Date.now(),
      atime: Date.now(),
    };

    entry.inode = updatedInode;
  }

  async createInode(
    type: VfsItemType,
    permissions: PermissionMask,
  ): Promise<INode> {
    const now = Date.now();
    const inode: INode = {
      inode: this.nextInode++,
      type,
      permissions: permissions as Permission,
      owner: "user",
      group: "user",
      size: 0,
      mtime: now,
      atime: now,
      ctime: now,
      blocks: 0,
      linkCount: 1,
    };

    const entry: MemoryEntry = {
      inode,
    };

    if (type === FileType.FILE) {
      entry.data = new Uint8Array(0);
    } else if (type === FileType.DIRECTORY) {
      entry.children = new Map();
    }

    this.storage.set(inode.inode, entry);
    return inode;
  }

  async deleteInode(inode: InodeNumber): Promise<void> {
    const entry = this.storage.get(inode);
    if (!entry) {
      throw new Error(`Inode not found: ${inode}`);
    }

    // Recursively delete directory contents
    if (entry.inode.type === FileType.DIRECTORY && entry.children) {
      for (const childInode of entry.children.values()) {
        await this.deleteInode(childInode);
      }
    }

    this.storage.delete(inode);
  }

  async updateInode(
    inode: InodeNumber,
    updates: Partial<INode>,
  ): Promise<INode> {
    const entry = this.storage.get(inode);
    if (!entry) {
      throw new Error(`Inode not found: ${inode}`);
    }

    // Create new INode with updates
    const updatedInode: INode = {
      ...entry.inode,
      ...updates,
      modified: Date.now(),
    };

    entry.inode = updatedInode;
    return updatedInode;
  }

  async readDir(inode: InodeNumber): Promise<IDirEntry[]> {
    const entry = this.storage.get(inode);
    if (!entry || entry.inode.type !== FileType.DIRECTORY) {
      throw new Error(`Directory not found: ${inode}`);
    }

    const entries: IDirEntry[] = [];

    if (entry.children) {
      for (const [name, childInode] of entry.children) {
        const childEntry = this.storage.get(childInode);
        if (childEntry) {
          entries.push({
            name,
            type: childEntry.inode.type,
            inode: childInode,
          });
        }
      }
    }

    return entries;
  }

  async exists(inode: InodeNumber): Promise<boolean> {
    return this.storage.has(inode);
  }

  /**
   * Helper method: add child to directory
   */
  async addChild(
    parentInode: InodeNumber,
    name: string,
    childInode: InodeNumber,
  ): Promise<void> {
    const parentEntry = this.storage.get(parentInode);
    if (!parentEntry || parentEntry.inode.type !== FileType.DIRECTORY) {
      throw new Error(`Parent directory not found: ${parentInode}`);
    }

    if (!parentEntry.children) {
      parentEntry.children = new Map();
    }

    parentEntry.children.set(name, childInode);
  }

  /**
   * Helper method: remove child from directory
   */
  async removeChild(parentInode: InodeNumber, name: string): Promise<void> {
    const parentEntry = this.storage.get(parentInode);
    if (!parentEntry || parentEntry.inode.type !== FileType.DIRECTORY) {
      throw new Error(`Parent directory not found: ${parentInode}`);
    }

    if (parentEntry.children) {
      parentEntry.children.delete(name);
    }
  }

  /**
   * Helper method: find child in directory
   */
  async findChild(
    parentInode: InodeNumber,
    name: string,
  ): Promise<InodeNumber | undefined> {
    const parentEntry = this.storage.get(parentInode);
    if (!parentEntry || parentEntry.inode.type !== FileType.DIRECTORY) {
      return undefined;
    }

    return parentEntry.children?.get(name);
  }

  /**
   * Get debug information
   */
  debug(): object {
    return {
      provider: this.name,
      inodeCount: this.storage.size,
      nextInode: this.nextInode,
      entries: Array.from(this.storage.entries()).map(([inode, entry]) => ({
        inode,
        type: entry.inode.type,
        size: entry.inode.size,
        childCount: entry.children?.size || 0,
      })),
    };
  }

  /**
   * Create root directory
   */
  private createRootDirectory(): void {
    const now = Date.now();
    const rootInode: INode = {
      inode: this.nextInode++,
      type: VfsItemType.DIRECTORY,
      permissions: 0o755 as Permission,
      owner: "root",
      group: "root",
      size: 0,
      mtime: now,
      atime: now,
      ctime: now,
      blocks: 0,
      linkCount: 2, // '.' and '..'
    };

    const rootEntry: MemoryEntry = {
      inode: rootInode,
      children: new Map(),
    };

    this.storage.set(rootInode.inode, rootEntry);
  }

  /**
   * Clear memory
   */
  clear(): void {
    this.storage.clear();
    this.nextInode = 1;
    this.createRootDirectory();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalInodes: number;
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
  } {
    let totalFiles = 0;
    let totalDirectories = 0;
    let totalSize = 0;

    for (const entry of this.storage.values()) {
      if (entry.inode.type === FileType.FILE) {
        totalFiles++;
        totalSize += entry.data?.length || 0;
      } else if (entry.inode.type === FileType.DIRECTORY) {
        totalDirectories++;
      }
    }

    return {
      totalInodes: this.storage.size,
      totalFiles,
      totalDirectories,
      totalSize,
    };
  }

  /**
   * Optimize memory usage
   */
  public optimize(): void {
    // Remove unreferenced inodes (simplified)
    const referencedInodes = new Set<InodeNumber>();

    // Collect all referenced inodes from directories
    for (const entry of this.storage.values()) {
      if (entry.inode.type === FileType.DIRECTORY && entry.children) {
        for (const childInode of entry.children.values()) {
          referencedInodes.add(childInode);
        }
      }
    }

    // Remove unreferenced inodes
    for (const [inode] of this.storage) {
      if (!referencedInodes.has(inode) && inode !== 1) {
        // Keep root
        this.storage.delete(inode);
      }
    }
  }
}
