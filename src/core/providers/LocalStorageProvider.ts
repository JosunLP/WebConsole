/**
 * LocalStorage VFS Provider
 * Implementiert ein virtuelles Dateisystem basierend auf localStorage
 */

import { FileType } from "../../enums/FileType.enum.js";
import type { IDirEntry } from "../../interfaces/IDirEntry.interface.js";
import type { INode } from "../../interfaces/INode.interface.js";
import type { IVFSProvider } from "../../interfaces/IVFSProvider.interface.js";
import type { InodeNumber, PermissionMask } from "../../types/index.js";

interface StorageEntry {
  inode: INode;
  data?: Uint8Array;
  children?: Map<string, InodeNumber>;
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
    (entry.inode as any).mtime = Date.now();

    this.saveToStorage();
  }

  async createInode(
    type: FileType,
    permissions: PermissionMask,
  ): Promise<INode> {
    const inode: INode = {
      inode: this.nextInode++,
      type,
      permissions,
      owner: "user",
      group: "users",
      size: 0,
      atime: new Date(),
      mtime: new Date(),
      ctime: new Date(),
      nlink: 1,
    };

    const entry: StorageEntry = {
      inode,
      data: type === FileType.FILE ? new Uint8Array(0) : undefined,
      children: type === FileType.DIRECTORY ? new Map() : undefined,
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
    entry.inode.mtime = new Date();

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
          permissions: childEntry.inode.permissions,
          size: childEntry.inode.size,
          mtime: childEntry.inode.mtime,
        });
      }
    }

    return entries;
  }

  async exists(inode: InodeNumber): Promise<boolean> {
    return this.storage.has(inode);
  }

  // Provider-spezifische Methoden

  /**
   * Füge Eintrag zu Verzeichnis hinzu
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
    entry.inode.mtime = new Date();
    this.saveToStorage();
  }

  /**
   * Entferne Eintrag aus Verzeichnis
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
    entry.inode.mtime = new Date();
    this.saveToStorage();
  }

  /**
   * Finde Inode für Pfad
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
   * Lade Root-Inode (oder erstelle falls nicht vorhanden)
   */
  async getRootInode(): Promise<InodeNumber> {
    // Suche nach Root-Verzeichnis (Inode 1)
    const rootEntry = this.storage.get(1);
    if (rootEntry && rootEntry.inode.type === FileType.DIRECTORY) {
      return 1;
    }

    // Erstelle Root-Verzeichnis
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

      const data = JSON.parse(stored);
      this.nextInode = data.nextInode || 1;

      for (const [inodeStr, entryData] of Object.entries(data.entries)) {
        const inode = parseInt(inodeStr, 10);
        const entry: StorageEntry = {
          inode: {
            ...entryData.inode,
            atime: new Date(entryData.inode.atime),
            mtime: new Date(entryData.inode.mtime),
            ctime: new Date(entryData.inode.ctime),
          },
          data: entryData.data ? new Uint8Array(entryData.data) : undefined,
          children: entryData.children
            ? new Map(
                Object.entries(entryData.children).map(([k, v]) => [
                  k,
                  Number(v),
                ]),
              )
            : undefined,
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
      const data = {
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

    // Erstelle Root-Verzeichnis
    await this.createInode(FileType.DIRECTORY, 0o755);
  }
}
