/**
 * Virtual File System für Web-Console
 */

import {
    EventUnsubscriber,
    GlobPattern,
    InodeNumber,
    MountConfig,
    Path,
    PermissionMask
} from '../types/index.js';

import {
    FileType,
    VFSEvent
} from '../enums/index.js';

import {
    IDirEntry,
    INode,
    IVFS,
    IVFSProvider
} from '../interfaces/index.js';

import { EventHandler } from '../types/index.js';

import { EventEmitter } from './EventEmitter.js';

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
    this.initializeRoot();
  }

  /**
   * Root-Filesystem initialisieren
   */
  private async initializeRoot(): Promise<void> {
    // Hier würde ein Default-Provider für das Root-FS initialisiert
    // Vorerst ein einfacher Memory-Provider
  }

  // === PATH OPERATIONS ===

  /**
   * Pfad auflösen (normalisieren)
   */
  resolve(path: Path): Path {
    if (!path.startsWith('/')) {
      throw new Error('Only absolute paths are supported');
    }

    const parts = path.split('/').filter(part => part.length > 0);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        resolved.pop();
      } else if (part !== '.') {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  /**
   * Pfade zusammenfügen
   */
  join(...paths: Path[]): Path {
    const joined = paths.join('/');
    return this.resolve(joined);
  }

  /**
   * Verzeichnis-Teil eines Pfades
   */
  dirname(path: Path): Path {
    const resolved = this.resolve(path);
    const lastSlash = resolved.lastIndexOf('/');
    if (lastSlash === 0) return '/';
    return resolved.substring(0, lastSlash);
  }

  /**
   * Dateiname ohne Verzeichnis
   */
  basename(path: Path, ext?: string): string {
    const resolved = this.resolve(path);
    const lastSlash = resolved.lastIndexOf('/');
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
    const basename = this.basename(path);
    const lastDot = basename.lastIndexOf('.');
    return lastDot > 0 ? basename.substring(lastDot) : '';
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
  async writeFile(path: Path, data: Uint8Array, options?: Partial<INode>): Promise<void> {
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
      if (error instanceof Error && error.message.includes('File not found')) {
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
  async exists(path: Path): Promise<boolean> {
    try {
      const resolution = await this.resolvePath(path);
      return resolution.inode !== undefined;
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
   * Verzeichnis-Inhalt auflisten
   */
  async readDir(path: Path): Promise<IDirEntry[]> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Directory not found: ${path}`);
    }

    const inode = await this.getInode(resolution.inode);
    if (inode.type !== FileType.DIRECTORY) {
      throw new Error(`Not a directory: ${path}`);
    }

    return resolution.mountPoint.provider.readDir(resolution.inode);
  }

  /**
   * Verzeichnis erstellen
   */
  async createDir(path: Path, permissions = 0o755): Promise<void> {
    try {
      const resolution = await this.resolvePath(path);
      if (resolution.inode) {
        throw new Error(`Directory already exists: ${path}`);
      }

      const inode = await this.createDirectory(path, permissions);
      this.emit(VFSEvent.DIRECTORY_CREATED, { path, inode: inode.inode });
    } catch (error) {
      throw new Error(`Failed to create directory ${path}: ${error}`);
    }
  }

  /**
   * Verzeichnis löschen
   */
  async deleteDir(path: Path, recursive = false): Promise<void> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Directory not found: ${path}`);
    }

    const inode = await this.getInode(resolution.inode);
    if (inode.type !== FileType.DIRECTORY) {
      throw new Error(`Not a directory: ${path}`);
    }

    if (!recursive) {
      const entries = await this.readDir(path);
      if (entries.length > 0) {
        throw new Error(`Directory not empty: ${path}`);
      }
    } else {
      // Rekursiv alle Inhalte löschen
      const entries = await this.readDir(path);
      for (const entry of entries) {
        const entryPath = this.join(path, entry.name);
        if (entry.type === FileType.DIRECTORY) {
          await this.deleteDir(entryPath, true);
        } else {
          await this.deleteFile(entryPath);
        }
      }
    }

    await resolution.mountPoint.provider.deleteInode(resolution.inode);
    this.pathCache.delete(path);
    this.inodeCache.delete(resolution.inode);

    this.emit(VFSEvent.DIRECTORY_DELETED, { path, inode: resolution.inode });
  }

  // === LINK OPERATIONS ===

  /**
   * Symbolischen Link erstellen
   */
  async symlink(target: Path, linkPath: Path): Promise<void> {
    const resolution = await this.resolvePath(linkPath);
    if (resolution.inode) {
      throw new Error(`Link already exists: ${linkPath}`);
    }

    // Symlink-Inode erstellen
    const inode = await resolution.mountPoint.provider.createInode(
      FileType.SYMLINK,
      0o777
    );

    // Target-Pfad als "Datei-Inhalt" speichern
    const targetData = new TextEncoder().encode(target);
    await resolution.mountPoint.provider.writeFile(inode.inode, targetData);

    this.pathCache.set(linkPath, inode.inode);
    this.inodeCache.set(inode.inode, { ...inode, target });
  }

  /**
   * Symbolischen Link auflösen
   */
  async readlink(path: Path): Promise<Path> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Link not found: ${path}`);
    }

    const inode = await this.getInode(resolution.inode);
    if (inode.type !== FileType.SYMLINK) {
      throw new Error(`Not a symbolic link: ${path}`);
    }

    return inode.target || '';
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
    return Array.from(this.mountPoints.values()).map(mp => mp.config);
  }

  // === WATCH OPERATIONS ===

  /**
   * Pfad auf Änderungen überwachen
   */
  watch(path: Path, handler: EventHandler): EventUnsubscriber {
    // Vereinfachte Implementation - lauscht auf alle VFS-Events
    // und filtert nach Pfad
    const wrappedHandler = (data: any) => {
      if (data.path === path || data.path.startsWith(path + '/')) {
        handler(data);
      }
    };

    const unsubscribers = [
      this.on(VFSEvent.FILE_CREATED, wrappedHandler),
      this.on(VFSEvent.FILE_CHANGED, wrappedHandler),
      this.on(VFSEvent.FILE_DELETED, wrappedHandler),
      this.on(VFSEvent.DIRECTORY_CREATED, wrappedHandler),
      this.on(VFSEvent.DIRECTORY_DELETED, wrappedHandler)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  // === GLOB OPERATIONS ===

  /**
   * Glob-Pattern matching
   */
  async glob(pattern: GlobPattern, cwd = '/'): Promise<Path[]> {
    // Vereinfachte Glob-Implementation
    // Würde in echter Implementation minimatch oder ähnliche Bibliothek verwenden
    const results: Path[] = [];

    const searchDir = async (dir: Path) => {
      try {
        const entries = await this.readDir(dir);
        for (const entry of entries) {
          const fullPath = this.join(dir, entry.name);

          // Einfacher * Wildcard-Support
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
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
      { permissions }
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
      updates
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
    let bestMatchPath = '';

    for (const [mountPath, mountPoint] of this.mountPoints) {
      if (resolvedPath.startsWith(mountPath) && mountPath.length > bestMatchPath.length) {
        bestMatch = mountPoint;
        bestMatchPath = mountPath;
      }
    }

    if (!bestMatch) {
      throw new Error(`No mount point found for path: ${path}`);
    }

    const relativePath = resolvedPath.substring(bestMatchPath.length) || '/';

    return {
      mountPoint: bestMatch,
      relativePath,
      inode: cachedInode
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
  private async createFile(path: Path, data: Uint8Array, options?: Partial<INode>): Promise<INode> {
    const resolution = await this.resolvePath(path);

    const inode = await resolution.mountPoint.provider.createInode(
      FileType.FILE,
      options?.permissions || 0o644
    );

    await resolution.mountPoint.provider.writeFile(inode.inode, data);

    this.pathCache.set(path, inode.inode);
    this.inodeCache.set(inode.inode, inode);

    return inode;
  }

  /**
   * Neues Verzeichnis erstellen
   */
  private async createDirectory(path: Path, permissions: PermissionMask): Promise<INode> {
    const resolution = await this.resolvePath(path);

    const inode = await resolution.mountPoint.provider.createInode(
      FileType.DIRECTORY,
      permissions
    );

    this.pathCache.set(path, inode.inode);
    this.inodeCache.set(inode.inode, inode);

    return inode;
  }

  /**
   * VFS-Provider laden
   */
  private async loadProvider(name: string, options: Record<string, unknown>): Promise<IVFSProvider> {
    // Hier würde die Provider-Registry verwendet
    // Vorerst Dummy-Implementation
    throw new Error(`Provider not implemented: ${name}`);
  }

  /**
   * Nächste verfügbare Inode-Nummer
   */
  private getNextInodeNumber(): InodeNumber {
    return this.nextInodeNumber++;
  }
}
