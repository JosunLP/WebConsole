/**
 * IndexedDB VFS Provider
 */

import { FileType } from "../../enums/index.js";
import { IDirEntry, INode, IVFSProvider } from "../../interfaces/index.js";
import { InodeNumber, PermissionMask } from "../../types/index.js";

interface IndexedDBEntry {
  inode: INode;
  data?: Uint8Array;
  children?: { [name: string]: InodeNumber };
}

/**
 * IndexedDB-based VFS Provider for persistent storage
 */
export class IndexedDBProvider implements IVFSProvider {
  public readonly name = "indexedDB";
  public readonly readOnly = false;

  private db: IDBDatabase | null = null;
  private nextInode = 1;
  private readonly dbName: string;
  private readonly version = 1;

  constructor(dbName = "WebConsoleVFS") {
    this.dbName = dbName;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // Store for inodes
        if (!db.objectStoreNames.contains("inodes")) {
          const store = db.createObjectStore("inodes", { keyPath: "inode" });
          store.createIndex("type", "inode.type");
        }

        // Store for metadata
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata");
        }
      };
    });
  }

  async readFile(inode: InodeNumber): Promise<Uint8Array> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readonly");
      const store = transaction.objectStore("inodes");
      const request = store.get(inode);

      request.onsuccess = () => {
        const entry = request.result as IndexedDBEntry;
        if (!entry) {
          reject(new Error(`Inode ${inode} not found`));
          return;
        }

        if (entry.inode.type !== FileType.FILE) {
          reject(new Error(`Inode ${inode} is not a file`));
          return;
        }

        resolve(entry.data || new Uint8Array(0));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async writeFile(inode: InodeNumber, data: Uint8Array): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readwrite");
      const store = transaction.objectStore("inodes");

      const getRequest = store.get(inode);
      getRequest.onsuccess = () => {
        const entry = getRequest.result as IndexedDBEntry;
        if (!entry) {
          reject(new Error(`Inode ${inode} not found`));
          return;
        }

        if (entry.inode.type !== FileType.FILE) {
          reject(new Error(`Inode ${inode} is not a file`));
          return;
        }

        // Update data and size
        entry.data = data;
        entry.inode.size = data.length;
        entry.inode.mtime = Date.now();

        const putRequest = store.put(entry);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async createInode(
    type: (typeof FileType)[keyof typeof FileType],
    permissions: PermissionMask,
  ): Promise<INode> {
    if (!this.db) throw new Error("Database not initialized");

    const now = Date.now();
    const inode: INode = {
      inode: this.nextInode++,
      type,
      permissions,
      owner: "user",
      group: "user",
      size: 0,
      mtime: now,
      atime: now,
      ctime: now,
      blocks: 0,
      linkCount: 1,
    };

    const entry: IndexedDBEntry = { inode };

    if (type === FileType.FILE) {
      entry.data = new Uint8Array(0);
    } else if (type === FileType.DIRECTORY) {
      entry.children = {};
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readwrite");
      const store = transaction.objectStore("inodes");
      const request = store.put(entry);

      request.onsuccess = () => resolve(inode);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteInode(inode: InodeNumber): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readwrite");
      const store = transaction.objectStore("inodes");
      const request = store.delete(inode);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateInode(
    inode: InodeNumber,
    updates: Partial<INode>,
  ): Promise<INode> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readwrite");
      const store = transaction.objectStore("inodes");

      const getRequest = store.get(inode);
      getRequest.onsuccess = () => {
        const entry = getRequest.result as IndexedDBEntry;
        if (!entry) {
          reject(new Error(`Inode ${inode} not found`));
          return;
        }

        // Update inode properties
        Object.assign(entry.inode, updates);
        entry.inode.mtime = Date.now();

        const putRequest = store.put(entry);
        putRequest.onsuccess = () => resolve(entry.inode);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async readDir(inode: InodeNumber): Promise<IDirEntry[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readonly");
      const store = transaction.objectStore("inodes");
      const request = store.get(inode);

      request.onsuccess = () => {
        const entry = request.result as IndexedDBEntry;
        if (!entry) {
          reject(new Error(`Inode ${inode} not found`));
          return;
        }

        if (entry.inode.type !== FileType.DIRECTORY) {
          reject(new Error(`Inode ${inode} is not a directory`));
          return;
        }

        const children = entry.children || {};
        const entries: IDirEntry[] = [];

        // Add "." and ".." entries
        entries.push({
          name: ".",
          type: FileType.DIRECTORY,
          inode: entry.inode.inode,
        });

        entries.push({
          name: "..",
          type: FileType.DIRECTORY,
          inode: entry.inode.inode, // Simplified - should be parent inode
        });

        // Add actual children
        for (const [name, childInode] of Object.entries(children)) {
          const childRequest = store.get(childInode);
          childRequest.onsuccess = () => {
            const childEntry = childRequest.result as IndexedDBEntry;
            if (childEntry) {
              entries.push({
                name,
                type: childEntry.inode.type,
                inode: childEntry.inode.inode,
              });
            }
          };
        }

        // Wait for all child requests to complete
        transaction.oncomplete = () => resolve(entries);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async exists(inode: InodeNumber): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(["inodes"], "readonly");
      const store = transaction.objectStore("inodes");
      const request = store.get(inode);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
  }

  async addChild(
    parentInode: InodeNumber,
    name: string,
    childInode: InodeNumber,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readwrite");
      const store = transaction.objectStore("inodes");

      const getRequest = store.get(parentInode);
      getRequest.onsuccess = () => {
        const entry = getRequest.result as IndexedDBEntry;
        if (!entry) {
          reject(new Error(`Parent inode ${parentInode} not found`));
          return;
        }

        if (entry.inode.type !== FileType.DIRECTORY) {
          reject(new Error(`Inode ${parentInode} is not a directory`));
          return;
        }

        if (!entry.children) {
          entry.children = {};
        }

        entry.children[name] = childInode;

        const putRequest = store.put(entry);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeChild(parentInode: InodeNumber, name: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["inodes"], "readwrite");
      const store = transaction.objectStore("inodes");

      const getRequest = store.get(parentInode);
      getRequest.onsuccess = () => {
        const entry = getRequest.result as IndexedDBEntry;
        if (!entry) {
          reject(new Error(`Parent inode ${parentInode} not found`));
          return;
        }

        if (entry.inode.type !== FileType.DIRECTORY) {
          reject(new Error(`Inode ${parentInode} is not a directory`));
          return;
        }

        if (entry.children && entry.children[name]) {
          delete entry.children[name];

          const putRequest = store.put(entry);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Child doesn't exist, nothing to do
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}
