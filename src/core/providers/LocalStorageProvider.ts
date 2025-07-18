/**
 * LocalStorage VFS Provider
 * Implements a virtual file system based on localStorage
 */

import { FileType, Permission, VfsItemType } from "../../enums/index.js";
import { IDirEntry, INode, IVFSProvider } from "../../interfaces/index.js";
import type { InodeNumber } from "../../types/index.js";

interface StorageEntry {
  inode: INode;
  data?: Uint8Array;
  children?: Map<string, InodeNumber>;
}

interface SerializedStorageData {
  nextInode: number;
  entries: Record<
    string,
    {
      inode: INode;
      data?: number[];
      children?: Record<string, number>;
    }
  >;
}

interface StorageEntryData {
  inode: INode & { mtime?: number; atime?: number; ctime?: number };
  data?: number[];
  children?: Record<string, number>;
}

export class LocalStorageProvider implements IVFSProvider {
  public readonly name = "localStorage";
  public readonly readOnly = false;

  private readonly storageKey: string;
  private storage = new Map<InodeNumber, StorageEntry>();
  private nextInode = 1;

  constructor(storageKey = "web-console-vfs") {
    this.storageKey = storageKey;
    this.loadFromStorage();
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
    entry.inode.size = data.length;
    if ("mtime" in entry.inode) {
      (entry.inode as { mtime?: number }).mtime = Date.now();
    }

    this.saveToStorage();
  }

  async createInode(type: VfsItemType, permissions: number): Promise<INode> {
    const inode: INode = {
      inode: this.nextInode++,
      type,
      permissions: permissions as Permission,
      owner: "user",
      group: "users",
      size: 0,
      atime: Date.now(),
      mtime: Date.now(),
      ctime: Date.now(),
      linkCount: 1,
    };

    const entry: StorageEntry = {
      inode,
      data: type === VfsItemType.FILE ? new Uint8Array(0) : new Uint8Array(0),
      children: type === VfsItemType.DIRECTORY ? new Map() : new Map(),
    };

    this.storage.set(inode.inode, entry);
    this.saveToStorage();

    return inode;
  }

  async deleteInode(inode: InodeNumber): Promise<void> {
    const entry = this.storage.get(inode);
    if (!entry) {
      throw new Error(`Inode not found: ${inode}`);
    }

    if (
      entry.inode.type === FileType.DIRECTORY &&
      entry.children &&
      entry.children.size > 0
    ) {
      throw new Error(`Directory not empty: ${inode}`);
    }

    this.storage.delete(inode);
    this.saveToStorage();
  }

  async updateInode(
    inode: InodeNumber,
    updates: Partial<INode>,
  ): Promise<INode> {
    const entry = this.storage.get(inode);
    if (!entry) {
      throw new Error(`Inode not found: ${inode}`);
    }

    Object.assign(entry.inode, updates);
    entry.inode.mtime = Date.now();

    this.saveToStorage();
    return entry.inode;
  }

  async readDir(inode: InodeNumber): Promise<IDirEntry[]> {
    const entry = this.storage.get(inode);
    if (!entry || entry.inode.type !== FileType.DIRECTORY || !entry.children) {
      throw new Error(`Directory not found: ${inode}`);
    }

    const entries: IDirEntry[] = [];
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

    return entries;
  }

  async exists(inode: InodeNumber): Promise<boolean> {
    return this.storage.has(inode);
  }

  // Provider-specific methods

  /**
   * Add entry to directory
   */
  async addDirEntry(
    dirInode: InodeNumber,
    name: string,
    childInode: InodeNumber,
  ): Promise<void> {
    const entry = this.storage.get(dirInode);
    if (!entry || entry.inode.type !== FileType.DIRECTORY || !entry.children) {
      throw new Error(`Directory not found: ${dirInode}`);
    }

    if (entry.children.has(name)) {
      throw new Error(`Entry already exists: ${name}`);
    }

    entry.children.set(name, childInode);
    entry.inode.mtime = Date.now();
    this.saveToStorage();
  }

  /**
   * Remove entry from directory
   */
  async removeDirEntry(dirInode: InodeNumber, name: string): Promise<void> {
    const entry = this.storage.get(dirInode);
    if (!entry || entry.inode.type !== FileType.DIRECTORY || !entry.children) {
      throw new Error(`Directory not found: ${dirInode}`);
    }

    if (!entry.children.has(name)) {
      throw new Error(`Entry not found: ${name}`);
    }

    entry.children.delete(name);
    entry.inode.mtime = Date.now();
    this.saveToStorage();
  }

  /**
   * Find inode for path
   */
  async findInode(
    dirInode: InodeNumber,
    name: string,
  ): Promise<InodeNumber | undefined> {
    const entry = this.storage.get(dirInode);
    if (!entry || entry.inode.type !== FileType.DIRECTORY || !entry.children) {
      return undefined;
    }

    return entry.children.get(name);
  }

  /**
   * Load root inode (or create if not exists)
   */
  async getRootInode(): Promise<InodeNumber> {
    // Search for root directory (Inode 1)
    const rootEntry = this.storage.get(1);
    if (rootEntry && rootEntry.inode.type === FileType.DIRECTORY) {
      return 1;
    }

    // Create root directory
    const rootInode = await this.createInode(FileType.DIRECTORY, 0o755);
    return rootInode.inode;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        this.initializeEmpty();
        return;
      }

      const data = JSON.parse(stored) as SerializedStorageData;
      this.nextInode = data.nextInode || 1;

      for (const [inodeStr, entryData] of Object.entries(data.entries)) {
        const inode = parseInt(inodeStr, 10);
        const typedEntryData = entryData as StorageEntryData;

        const entry: StorageEntry = {
          inode: {
            ...typedEntryData.inode,
            ...(typedEntryData.inode.atime && {
              atime: typedEntryData.inode.atime,
            }),
            ...(typedEntryData.inode.mtime && {
              mtime: typedEntryData.inode.mtime,
            }),
            ...(typedEntryData.inode.ctime && {
              ctime: typedEntryData.inode.ctime,
            }),
          },
          data: typedEntryData.data
            ? new Uint8Array(typedEntryData.data)
            : new Uint8Array(0),
          children: typedEntryData.children
            ? new Map(
                Object.entries(typedEntryData.children).map(([k, v]) => [
                  k,
                  Number(v),
                ]),
              )
            : new Map(),
        };
        this.storage.set(inode, entry);
      }
    } catch (error) {
      console.warn("Failed to load VFS from localStorage:", error);
      this.initializeEmpty();
    }
  }

  private saveToStorage(): void {
    try {
      const data: {
        nextInode: number;
        entries: Record<string, unknown>;
      } = {
        nextInode: this.nextInode,
        entries: {},
      };

      for (const [inode, entry] of this.storage) {
        data.entries[inode] = {
          inode: entry.inode,
          data: entry.data ? Array.from(entry.data) : undefined,
          children: entry.children
            ? Object.fromEntries(entry.children)
            : undefined,
        };
      }

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save VFS to localStorage:", error);
    }
  }

  private async initializeEmpty(): Promise<void> {
    this.storage.clear();
    this.nextInode = 1;

    // Create root directory
    await this.createInode(FileType.DIRECTORY, 0o755);
  }

  // Interface methods
  async addChild(
    parentInode: InodeNumber,
    name: string,
    childInode: InodeNumber,
  ): Promise<void> {
    await this.addDirEntry(parentInode, name, childInode);
  }

  async removeChild(parentInode: InodeNumber, name: string): Promise<void> {
    await this.removeDirEntry(parentInode, name);
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): {
    provider: string;
    storageKey: string;
    totalEntries: number;
    storageSize: number;
  } {
    const data = localStorage.getItem(this.storageKey);
    return {
      provider: this.name,
      storageKey: this.storageKey,
      totalEntries: this.storage.size,
      storageSize: data ? data.length : 0,
    };
  }

  /**
   * Clean storage
   */
  clear(): void {
    this.storage.clear();
    this.nextInode = 1;
    localStorage.removeItem(this.storageKey);
  }
}
