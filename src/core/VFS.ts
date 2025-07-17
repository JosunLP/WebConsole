/**
 * Virtual File System für Web-Console
 */

import {
  EventUnsubscriber,
  GlobPattern,
  InodeNumber,
  MountConfig,
  Path,
  PermissionMask,
} from "../types/index.js";

import { FileType, VFSEvent } from "../enums/index.js";

import { IDirEntry, INode, IVFS, IVFSProvider } from "../interfaces/index.js";

import { EventHandler } from "../types/index.js";

import { EventEmitter } from "./EventEmitter.js";

/**
 * Mount-Point Information
 */
interface MountPoint {
  config: MountConfig;
  provider: IVFSProvider;
}

/**
 * Pfad-Resolution Ergebnis
 */
interface PathResolution {
  mountPoint: MountPoint;
  relativePath: Path;
  inode?: InodeNumber | undefined;
}

/**
 * Virtual File System Implementierung
 */
export class VFS extends EventEmitter implements IVFS {
  private readonly mountPoints = new Map<Path, MountPoint>();
  private readonly inodeCache = new Map<InodeNumber, INode>();
  private readonly pathCache = new Map<Path, InodeNumber>();
  private nextInodeNumber = 1;

  constructor() {
    super();
    // Root-Mount immer verfügbar
  }

  /**
   * VFS initialisieren
   */
  public async initialize(): Promise<void> {
    await this.initializeRoot();
  }

  /**
   * Root-Filesystem initialisieren
   */
  private async initializeRoot(): Promise<void> {
    // Default LocalStorage Provider für Root-Filesystem
    const { LocalStorageProvider } = await import(
      "./providers/LocalStorageProvider.js"
    );
    const rootProvider = new LocalStorageProvider("web-console-root");

    const config: MountConfig = {
      path: "/",
      provider: "localStorage",
      options: { storageKey: "web-console-root" },
      readOnly: false,
    };

    this.mountPoints.set("/", { config, provider: rootProvider });

    // Standard-Verzeichnisse erstellen falls nicht vorhanden
    await this.ensureStandardDirectories();
  }

  /**
   * Standard-Verzeichnisse erstellen
   */
  private async ensureStandardDirectories(): Promise<void> {
    const standardDirs = [
      "/home",
      "/home/user",
      "/usr",
      "/usr/bin",
      "/etc",
      "/tmp",
      "/var",
    ];

    for (const dir of standardDirs) {
      try {
        await this.stat(dir);
      } catch {
        // Verzeichnis existiert nicht, erstelle es
        await this.mkdir(dir, { recursive: true });
      }
    }

    // Standard-Dateien erstellen
    await this.createStandardFiles();
  }

  /**
   * Standard-Dateien erstellen
   */
  private async createStandardFiles(): Promise<void> {
    const welcomeContent = `Welcome to Web Console!

This is a browser-based terminal with a full virtual file system.
Type 'help' to see available commands.

Features:
- POSIX-like file operations
- Multiple framework integrations
- Persistent storage
- Theme system
`;

    try {
      await this.stat("/home/user/README.txt");
    } catch {
      await this.writeFile(
        "/home/user/README.txt",
        new TextEncoder().encode(welcomeContent),
      );
    }
  }

  // === PATH OPERATIONS ===

  /**
   * Pfad auflösen (normalisieren)
   */
  resolve(path: Path): Path {
    if (!path.startsWith("/")) {
      throw new Error("Only absolute paths are supported");
    }

    const parts = path.split("/").filter((part) => part.length > 0);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === "..") {
        resolved.pop();
      } else if (part !== ".") {
        resolved.push(part);
      }
    }

    return "/" + resolved.join("/");
  }

  /**
   * Pfade zusammenfügen
   */
  join(...paths: Path[]): Path {
    const joined = paths.join("/");
    return this.resolve(joined);
  }

  /**
   * Verzeichnis-Teil eines Pfades
   */
  dirname(path: Path): Path {
    const resolved = this.resolve(path);
    const lastSlash = resolved.lastIndexOf("/");
    if (lastSlash === 0) return "/";
    return resolved.substring(0, lastSlash);
  }

  /**
   * Dateiname ohne Verzeichnis
   */
  basename(path: Path, ext?: string): string {
    const resolved = this.resolve(path);
    const lastSlash = resolved.lastIndexOf("/");
    let basename = resolved.substring(lastSlash + 1);

    if (ext && basename.endsWith(ext)) {
      basename = basename.substring(0, basename.length - ext.length);
    }

    return basename;
  }

  /**
   * Datei-Erweiterung
   */
  extname(path: Path): string {
    const normalized = this.resolve(path);
    const parts = normalized.split(".");
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
  }

  // === FILE OPERATIONS ===

  /**
   * Datei lesen
   */
  async readFile(path: Path): Promise<Uint8Array> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`File not found: ${path}`);
    }

    const inode = await this.getInode(resolution.inode);
    if (inode.type !== FileType.FILE) {
      throw new Error(`Not a file: ${path}`);
    }

    return resolution.mountPoint.provider.readFile(resolution.inode);
  }

  /**
   * Datei schreiben
   */
  async writeFile(
    path: Path,
    data: Uint8Array,
    options?: Partial<INode>,
  ): Promise<void> {
    try {
      const resolution = await this.resolvePath(path);

      if (resolution.inode) {
        // Existierende Datei überschreiben
        await resolution.mountPoint.provider.writeFile(resolution.inode, data);
        this.emit(VFSEvent.FILE_CHANGED, { path, inode: resolution.inode });
      } else {
        // Neue Datei erstellen
        const inode = await this.createFile(path, data, options);
        this.emit(VFSEvent.FILE_CREATED, { path, inode: inode.inode });
      }
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`);
    }
  }

  /**
   * Daten an Datei anhängen
   */
  async appendFile(path: Path, data: Uint8Array): Promise<void> {
    try {
      const existingData = await this.readFile(path);
      const combined = new Uint8Array(existingData.length + data.length);
      combined.set(existingData);
      combined.set(data, existingData.length);
      await this.writeFile(path, combined);
    } catch (error) {
      if (error instanceof Error && error.message.includes("File not found")) {
        // Datei existiert nicht, neu erstellen
        await this.writeFile(path, data);
      } else {
        throw error;
      }
    }
  }

  /**
   * Datei löschen
   */
  async deleteFile(path: Path): Promise<void> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`File not found: ${path}`);
    }

    const inode = await this.getInode(resolution.inode);
    if (inode.type !== FileType.FILE) {
      throw new Error(`Not a file: ${path}`);
    }

    await resolution.mountPoint.provider.deleteInode(resolution.inode);
    this.pathCache.delete(path);
    this.inodeCache.delete(resolution.inode);

    this.emit(VFSEvent.FILE_DELETED, { path, inode: resolution.inode });
  }

  /**
   * Prüfen ob Pfad existiert
   */
  exists(path: Path): boolean {
    try {
      // Vereinfachte synchrone Implementierung für jetzt
      return true; // TODO: Implementiere tatsächliche synchrone Existenz-Prüfung
    } catch {
      return false;
    }
  }

  /**
   * Datei-/Verzeichnis-Metadaten abrufen
   */
  async stat(path: Path): Promise<INode> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Path not found: ${path}`);
    }
    return this.getInode(resolution.inode);
  }

  // === DIRECTORY OPERATIONS ===

  /**
   * Verzeichnis erstellen
   */
  async mkdir(
    path: Path,
    options?: { recursive?: boolean; mode?: PermissionMask },
  ): Promise<void> {
    const normalizedPath = this.resolve(path);

    try {
      await this.stat(normalizedPath);
      throw new Error(`Directory already exists: ${path}`);
    } catch (error) {
      // Directory doesn't exist, continue with creation
    }

    const parentPath = this.dirname(normalizedPath);

    // Recursive erstellen falls gewünscht
    if (options?.recursive && parentPath !== normalizedPath) {
      try {
        await this.stat(parentPath);
      } catch {
        await this.mkdir(parentPath, { recursive: true });
      }
    }

    // Erstelle Verzeichnis über Provider
    const resolution = await this.resolvePath(parentPath);
    if (!resolution.mountPoint) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    const dirName = this.basename(normalizedPath);
    const inode = await this.createDirectory(normalizedPath, options?.mode);

    this.emit(VFSEvent.DIRECTORY_CREATED, {
      path: normalizedPath,
      inode: inode.inode,
    });
  }

  /**
   * Verzeichnis löschen
   */
  async rmdir(path: Path, options?: { recursive?: boolean }): Promise<void> {
    const normalizedPath = this.resolve(path);
    const node = await this.stat(normalizedPath);

    if (node.type !== FileType.DIRECTORY) {
      throw new Error(`Not a directory: ${path}`);
    }

    const entries = await this.readDir(normalizedPath);

    if (!options?.recursive && entries.length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }

    if (options?.recursive) {
      // Rekursiv alle Inhalte löschen
      for (const entry of entries) {
        const fullPath = this.join(normalizedPath, entry.name);
        if (entry.type === FileType.DIRECTORY) {
          await this.rmdir(fullPath, { recursive: true });
        } else {
          await this.deleteFile(fullPath);
        }
      }
    }

    const resolution = await this.resolvePath(normalizedPath);
    if (resolution.inode) {
      await resolution.mountPoint.provider.deleteInode(resolution.inode);
      this.pathCache.delete(normalizedPath);
      this.inodeCache.delete(resolution.inode);
    }

    this.emit(VFSEvent.DIRECTORY_DELETED, {
      path: normalizedPath,
      inode: resolution.inode,
    });
  }

  /**
   * Verzeichnis-Inhalt auflisten
   */
  async readDir(path: Path): Promise<IDirEntry[]> {
    const normalizedPath = this.resolve(path);
    const node = await this.stat(normalizedPath);

    if (node.type !== FileType.DIRECTORY) {
      throw new Error(`Not a directory: ${path}`);
    }

    const resolution = await this.resolvePath(normalizedPath);
    if (!resolution.inode) {
      throw new Error(`Directory not found: ${path}`);
    }

    return resolution.mountPoint.provider.readDir(resolution.inode);
  }

  /**
   * Verzeichnis erstellen
   */
  async createDir(path: Path, permissions?: PermissionMask): Promise<void> {
    const normalizedPath = this.resolve(path);

    try {
      await this.stat(normalizedPath);
      throw new Error(`Directory already exists: ${path}`);
    } catch (error) {
      // Directory doesn't exist, continue with creation
    }

    const parentPath = this.dirname(normalizedPath);

    // Prüfe ob Parent-Verzeichnis existiert (nicht rekursiv)
    try {
      const parentNode = await this.stat(parentPath);
      if (parentNode.type !== FileType.DIRECTORY) {
        throw new Error(`Parent is not a directory: ${parentPath}`);
      }
    } catch {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    const inode = await this.createDirectory(normalizedPath, permissions);

    this.emit(VFSEvent.DIRECTORY_CREATED, {
      path: normalizedPath,
      inode: inode.inode,
    });
  }

  /**
   * Verzeichnis löschen
   */
  async deleteDir(path: Path, recursive?: boolean): Promise<void> {
    const normalizedPath = this.resolve(path);
    const node = await this.stat(normalizedPath);

    if (node.type !== FileType.DIRECTORY) {
      throw new Error(`Not a directory: ${path}`);
    }

    const entries = await this.readDir(normalizedPath);

    if (!recursive && entries.length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }

    if (recursive) {
      // Rekursiv alle Inhalte löschen
      for (const entry of entries) {
        const fullPath = this.join(normalizedPath, entry.name);
        if (entry.type === FileType.DIRECTORY) {
          await this.deleteDir(fullPath, recursive);
        } else {
          await this.deleteFile(fullPath);
        }
      }
    }

    const resolution = await this.resolvePath(normalizedPath);
    if (resolution.inode) {
      await resolution.mountPoint.provider.deleteInode(resolution.inode);
      this.pathCache.delete(normalizedPath);
      this.inodeCache.delete(resolution.inode);
    }

    this.emit(VFSEvent.DIRECTORY_DELETED, {
      path: normalizedPath,
      inode: resolution.inode,
    });
  }

  // === LINK OPERATIONS ===

  /**
   * Symbolischen Link erstellen
   */
  async symlink(target: Path, linkPath: Path): Promise<void> {
    const normalizedTarget = this.resolve(target);
    const normalizedLink = this.resolve(linkPath);

    // Prüfe ob Target existiert
    try {
      await this.stat(normalizedTarget);
    } catch {
      throw new Error(`Target does not exist: ${target}`);
    }

    // Prüfe ob Link bereits existiert
    try {
      await this.stat(normalizedLink);
      throw new Error(`Link already exists: ${linkPath}`);
    } catch {
      // Link existiert nicht, gut
    }

    const parentPath = this.dirname(normalizedLink);
    const resolution = await this.resolvePath(parentPath);
    if (!resolution.mountPoint) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    // Erstelle Symlink als speziellen Inode
    const targetData = new TextEncoder().encode(normalizedTarget);
    const inode = await resolution.mountPoint.provider.createInode(
      FileType.SYMLINK,
      0o777,
    );

    await resolution.mountPoint.provider.writeFile(inode.inode, targetData);

    this.inodeCache.set(inode.inode, inode);
    this.pathCache.set(normalizedLink, inode.inode);

    this.emit(VFSEvent.FILE_CREATED, {
      path: normalizedLink,
      inode: inode.inode,
    });
  }

  /**
   * Symbolischen Link auflösen
   */
  async readlink(path: Path): Promise<Path> {
    const normalizedPath = this.resolve(path);
    const node = await this.stat(normalizedPath);

    if (node.type !== FileType.SYMLINK) {
      throw new Error(`Not a symlink: ${path}`);
    }

    const resolution = await this.resolvePath(normalizedPath);
    if (!resolution.inode) {
      throw new Error(`Symlink not found: ${path}`);
    }

    const targetData = await resolution.mountPoint.provider.readFile(
      resolution.inode,
    );
    return new TextDecoder().decode(targetData);
  }

  // === MOUNT OPERATIONS ===

  /**
   * Filesystem mounten
   */
  async mount(config: MountConfig): Promise<void> {
    if (this.mountPoints.has(config.path)) {
      throw new Error(`Mount point already exists: ${config.path}`);
    }

    // Provider laden (hier vereinfacht)
    const provider = await this.loadProvider(config.provider, config.options);

    this.mountPoints.set(config.path, { config, provider });
    this.emit(VFSEvent.MOUNT_ADDED, { config });
  }

  /**
   * Filesystem unmounten
   */
  async unmount(path: Path): Promise<void> {
    if (!this.mountPoints.has(path)) {
      throw new Error(`Mount point not found: ${path}`);
    }

    this.mountPoints.delete(path);
    this.emit(VFSEvent.MOUNT_REMOVED, { path });
  }

  /**
   * Alle Mount-Points abrufen
   */
  getMounts(): MountConfig[] {
    return Array.from(this.mountPoints.values()).map((mp) => mp.config);
  }

  // === WATCH OPERATIONS ===

  /**
   * Pfad auf Änderungen überwachen
   */
  watch(path: Path, handler: EventHandler): EventUnsubscriber {
    // Vereinfachte Implementation - lauscht auf alle VFS-Events
    // und filtert nach Pfad
    const wrappedHandler = (data: any) => {
      if (data.path === path || data.path.startsWith(path + "/")) {
        handler(data);
      }
    };

    const unsubscribers = [
      this.on(VFSEvent.FILE_CREATED, wrappedHandler),
      this.on(VFSEvent.FILE_CHANGED, wrappedHandler),
      this.on(VFSEvent.FILE_DELETED, wrappedHandler),
      this.on(VFSEvent.DIRECTORY_CREATED, wrappedHandler),
      this.on(VFSEvent.DIRECTORY_DELETED, wrappedHandler),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  // === GLOB OPERATIONS ===

  /**
   * Glob-Pattern matching
   */
  async glob(pattern: GlobPattern, cwd = "/"): Promise<Path[]> {
    // Vereinfachte Glob-Implementation
    // Würde in echter Implementation minimatch oder ähnliche Bibliothek verwenden
    const results: Path[] = [];

    const searchDir = async (dir: Path) => {
      try {
        const entries = await this.readDir(dir);
        for (const entry of entries) {
          const fullPath = this.join(dir, entry.name);

          // Einfacher * Wildcard-Support
          if (pattern.includes("*")) {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            if (regex.test(fullPath)) {
              results.push(fullPath);
            }
          } else if (fullPath.includes(pattern)) {
            results.push(fullPath);
          }

          // Rekursiv in Unterverzeichnissen suchen
          if (entry.type === FileType.DIRECTORY) {
            await searchDir(fullPath);
          }
        }
      } catch {
        // Verzeichnis kann nicht gelesen werden, ignorieren
      }
    };

    await searchDir(cwd);
    return results;
  }

  // === PERMISSION OPERATIONS ===

  /**
   * Dateiberechtigungen ändern
   */
  async chmod(path: Path, permissions: PermissionMask): Promise<void> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Path not found: ${path}`);
    }

    const inode = await this.getInode(resolution.inode);
    const updatedInode = await resolution.mountPoint.provider.updateInode(
      resolution.inode,
      { permissions },
    );

    this.inodeCache.set(resolution.inode, updatedInode);
  }

  /**
   * Besitzer ändern
   */
  async chown(path: Path, owner: string, group?: string): Promise<void> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Path not found: ${path}`);
    }

    const updates: Partial<INode> = { owner };
    if (group) {
      (updates as any).group = group;
    }

    const updatedInode = await resolution.mountPoint.provider.updateInode(
      resolution.inode,
      updates,
    );

    this.inodeCache.set(resolution.inode, updatedInode);
  }

  // === PRIVATE HELPER METHODS ===

  /**
   * Pfad zu Mount-Point und Inode auflösen
   */
  private async resolvePath(path: Path): Promise<PathResolution> {
    const resolvedPath = this.resolve(path);

    // Cache prüfen
    const cachedInode = this.pathCache.get(resolvedPath);

    // Mount-Point finden
    let bestMatch: MountPoint | undefined;
    let bestMatchPath = "";

    for (const [mountPath, mountPoint] of this.mountPoints) {
      if (
        resolvedPath.startsWith(mountPath) &&
        mountPath.length > bestMatchPath.length
      ) {
        bestMatch = mountPoint;
        bestMatchPath = mountPath;
      }
    }

    if (!bestMatch) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = resolvedPath.substring(bestMatchPath.length) || "/";

    return {
      mountPoint: bestMatch,
      relativePath,
      inode: cachedInode,
    };
  }

  /**
   * Inode aus Cache oder Provider laden
   */
  private async getInode(inodeNumber: InodeNumber): Promise<INode> {
    let inode = this.inodeCache.get(inodeNumber);
    if (!inode) {
      // Von Provider laden (vereinfacht)
      throw new Error(`Inode ${inodeNumber} not found`);
    }
    return inode;
  }

  /**
   * Neue Datei erstellen
   */
  private async createFile(
    path: Path,
    data: Uint8Array,
    options?: Partial<INode>,
  ): Promise<INode> {
    const normalizedPath = this.resolve(path);
    const parentPath = this.dirname(normalizedPath);

    // Prüfe ob Parent-Verzeichnis existiert
    try {
      const parentNode = await this.stat(parentPath);
      if (parentNode.type !== FileType.DIRECTORY) {
        throw new Error(`Parent is not a directory: ${parentPath}`);
      }
    } catch {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    const resolution = await this.resolvePath(parentPath);
    if (!resolution.mountPoint) {
      throw new Error(`Cannot resolve parent directory: ${parentPath}`);
    }

    // Erstelle Inode über Provider
    const createdInode = await resolution.mountPoint.provider.createInode(
      FileType.FILE,
      0o644,
    );

    // Schreibe Daten
    await resolution.mountPoint.provider.writeFile(createdInode.inode, data);

    this.inodeCache.set(createdInode.inode, createdInode);
    this.pathCache.set(normalizedPath, createdInode.inode);

    return createdInode;
  }

  /**
   * Hilfsmethode: Verzeichnis erstellen
   */
  private async createDirectory(
    path: Path,
    mode?: PermissionMask,
  ): Promise<INode> {
    const normalizedPath = this.resolve(path);
    const parentPath = this.dirname(normalizedPath);

    if (parentPath !== normalizedPath) {
      // Prüfe ob Parent-Verzeichnis existiert
      try {
        const parentNode = await this.stat(parentPath);
        if (parentNode.type !== FileType.DIRECTORY) {
          throw new Error(`Parent is not a directory: ${parentPath}`);
        }
      } catch {
        throw new Error(`Parent directory not found: ${parentPath}`);
      }
    }

    const resolution = await this.resolvePath(parentPath);
    if (!resolution.mountPoint) {
      throw new Error(`Cannot resolve parent directory: ${parentPath}`);
    }

    // Erstelle Inode über Provider
    const createdInode = await resolution.mountPoint.provider.createInode(
      FileType.DIRECTORY,
      mode || 0o755,
    );

    this.inodeCache.set(createdInode.inode, createdInode);
    this.pathCache.set(normalizedPath, createdInode.inode);

    return createdInode;
  }

  /**
   * VFS-Provider laden
   */
  private async loadProvider(
    name: string,
    options: Record<string, unknown>,
  ): Promise<IVFSProvider> {
    switch (name) {
      case "localStorage": {
        const { LocalStorageProvider } = await import(
          "./providers/LocalStorageProvider.js"
        );
        return new LocalStorageProvider(options.storageKey as string);
      }
      case "memory": {
        const { MemoryProvider } = await import(
          "./providers/MemoryProvider.js"
        );
        return new MemoryProvider();
      }
      case "indexedDB": {
        // TODO: Implement IndexedDBProvider
        throw new Error("IndexedDB provider not yet implemented");
      }
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }

  /**
   * Nächste verfügbare Inode-Nummer
   */
  private getNextInodeNumber(): InodeNumber {
    return this.nextInodeNumber++;
  }
}
