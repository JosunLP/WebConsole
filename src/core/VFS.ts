/**
 * Virtual File System for Web Console
 * Implements a complete virtual file system with mount points
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

import { PathUtils } from "../utils/pathUtils.js";
import { EventEmitter } from "./EventEmitter.js";

/**
 * Mount-Point Information
 */
interface MountPoint {
  config: MountConfig;
  provider: IVFSProvider;
}

/**
 * Path resolution result
 */
interface PathResolution {
  mountPoint: MountPoint;
  relativePath: Path;
  inode?: InodeNumber | undefined;
}

/**
 * Virtual File System Implementation
 */
export class VFS extends EventEmitter implements IVFS {
  private readonly mountPoints = new Map<Path, MountPoint>();
  private readonly inodeCache = new Map<InodeNumber, INode>();
  private readonly pathCache = new Map<Path, InodeNumber>();
  private nextInodeNumber = 1;

  constructor() {
    super();
    // Root mount always available
  }

  /**
   * Initialize VFS
   */
  public async initialize(): Promise<void> {
    await this.initializeRoot();
  }

  /**
   * Initialize root filesystem
   */
  private async initializeRoot(): Promise<void> {
    // Default LocalStorage provider for root filesystem
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

    // Create standard directories if they don't exist
    await this.ensureStandardDirectories();
  }

  /**
   * Create standard directories
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
        // Directory doesn't exist, create it
        await this.mkdir(dir, { recursive: true });
      }
    }

    // Create standard files
    await this.createStandardFiles();
  }

  /**
   * Create standard files
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
   * Resolve path (normalize)
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
   * Join paths together
   */
  join(...paths: Path[]): Path {
    const joined = paths.join("/");
    return this.resolve(joined);
  }

  /**
   * Directory part of a path
   */
  dirname(path: Path): Path {
    const resolved = this.resolve(path);
    const lastSlash = resolved.lastIndexOf("/");
    if (lastSlash === 0) return "/";
    return resolved.substring(0, lastSlash);
  }

  /**
   * Filename without directory
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
   * File extension
   */
  extname(path: Path): string {
    const normalized = this.resolve(path);
    const parts = normalized.split(".");
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
  }

  // === FILE OPERATIONS ===

  /**
   * Read file
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
   * Write file
   */
  async writeFile(
    path: Path,
    data: Uint8Array,
    options?: Partial<INode>,
  ): Promise<void> {
    try {
      const resolution = await this.resolvePath(path);

      if (resolution.inode) {
        // Overwrite existing file
        await resolution.mountPoint.provider.writeFile(resolution.inode, data);
        this.emit(VFSEvent.FILE_CHANGED, { path, inode: resolution.inode });
      } else {
        // Create new file
        const inode = await this.createFile(path, data, options);
        this.emit(VFSEvent.FILE_CREATED, { path, inode: inode.inode });
      }
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`);
    }
  }

  /**
   * Append data to file
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
        // File doesn't exist, create new
        await this.writeFile(path, data);
      } else {
        throw error;
      }
    }
  }

  /**
   * Delete file
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
   * Check if path exists
   * Optimized version with better cache usage
   */
  exists(path: Path): boolean {
    try {
      const normalizedPath = this.resolve(path);

      // Check cache first - fastest way
      if (this.pathCache.has(normalizedPath)) {
        const inode = this.pathCache.get(normalizedPath)!;
        return this.inodeCache.has(inode);
      }

      // Try to resolve the path through parent directories
      const segments = normalizedPath.split("/").filter(Boolean);
      let currentPath = "/";

      // Root directory always exists
      if (segments.length === 0) {
        return true;
      }

      for (const segment of segments) {
        const cachedInode = this.pathCache.get(currentPath);
        if (!cachedInode) {
          return false;
        }

        const nextPath =
          currentPath === "/" ? `/${segment}` : `${currentPath}/${segment}`;
        if (!this.pathCache.has(nextPath)) {
          return false;
        }

        currentPath = nextPath;
      }

      return this.pathCache.has(normalizedPath);
    } catch {
      return false;
    }
  }

  /**
   * Get file/directory metadata
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
   * Create directory
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

    // Create recursively if desired
    if (options?.recursive && parentPath !== normalizedPath) {
      try {
        await this.stat(parentPath);
      } catch {
        await this.mkdir(parentPath, { recursive: true });
      }
    }

    // Create directory via provider
    const resolution = await this.resolvePath(parentPath);
    if (!resolution.mountPoint) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    // const dirName = this.basename(normalizedPath);
    const inode = await this.createDirectory(normalizedPath, options?.mode);

    this.emit(VFSEvent.DIRECTORY_CREATED, {
      path: normalizedPath,
      inode: inode.inode,
    });
  }

  /**
   * Delete directory
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
      // Recursively delete all contents
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
   * List directory contents
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
   * Create directory
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

    // Check if parent directory exists (not recursive)
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
   * Delete directory
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
      // Recursively delete all contents
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
   * Create symbolic link
   */
  async symlink(target: Path, linkPath: Path): Promise<void> {
    const normalizedTarget = this.resolve(target);
    const normalizedLink = this.resolve(linkPath);

    // Check if target exists
    try {
      await this.stat(normalizedTarget);
    } catch {
      throw new Error(`Target does not exist: ${target}`);
    }

    // Check if link already exists
    try {
      await this.stat(normalizedLink);
      throw new Error(`Link already exists: ${linkPath}`);
    } catch {
      // Link does not exist, good
    }

    const parentPath = this.dirname(normalizedLink);
    const resolution = await this.resolvePath(parentPath);
    if (!resolution.mountPoint) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    // Create symlink as special inode
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
   * Resolve symbolic link
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
   * Mount filesystem
   */
  async mount(config: MountConfig): Promise<void> {
    if (this.mountPoints.has(config.path)) {
      throw new Error(`Mount point already exists: ${config.path}`);
    }

    // Load provider (simplified here)
    const provider = await this.loadProvider(config.provider, config.options);

    this.mountPoints.set(config.path, { config, provider });
    this.emit(VFSEvent.MOUNT_ADDED, { config });
  }

  /**
   * Unmount filesystem
   */
  async unmount(path: Path): Promise<void> {
    if (!this.mountPoints.has(path)) {
      throw new Error(`Mount point not found: ${path}`);
    }

    this.mountPoints.delete(path);
    this.emit(VFSEvent.MOUNT_REMOVED, { path });
  }

  /**
   * Get all mount points
   */
  getMounts(): MountConfig[] {
    return Array.from(this.mountPoints.values()).map((mp) => mp.config);
  }

  // === WATCH OPERATIONS ===

  /**
   * Watch path for changes
   */
  watch(path: Path, handler: EventHandler): EventUnsubscriber {
    // Simplified implementation - listens to all VFS events
    // and filters by path
    const wrappedHandler = (data: unknown) => {
      if (typeof data === "object" && data !== null && "path" in data) {
        const eventData = data as { path: string };
        if (eventData.path === path || eventData.path.startsWith(path + "/")) {
          handler(data);
        }
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
    // Use PathUtils.globToRegex for secure and robust glob matching
    const results: Path[] = [];

    const searchDir = async (dir: Path) => {
      try {
        const entries = await this.readDir(dir);
        for (const entry of entries) {
          const fullPath = this.join(dir, entry.name);

          // Use PathUtils.globToRegex for secure pattern matching
          const regex = PathUtils.globToRegex(pattern);
          if (regex.test(fullPath) || regex.test(entry.name)) {
            results.push(fullPath);
          }

          // Recursively search in subdirectories
          if (entry.type === FileType.DIRECTORY) {
            await searchDir(fullPath);
          }
        }
      } catch {
        // Directory cannot be read, ignore
      }
    };

    await searchDir(cwd);
    return results;
  }

  // === PERMISSION OPERATIONS ===

  /**
   * Change file permissions
   */
  async chmod(path: Path, permissions: PermissionMask): Promise<void> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Path not found: ${path}`);
    }

    // const inode = await this.getInode(resolution.inode);
    const updatedInode = await resolution.mountPoint.provider.updateInode(
      resolution.inode,
      { permissions },
    );

    this.inodeCache.set(resolution.inode, updatedInode);
  }

  /**
   * Change owner
   */
  async chown(path: Path, owner: string, group?: string): Promise<void> {
    const resolution = await this.resolvePath(path);
    if (!resolution.inode) {
      throw new Error(`Path not found: ${path}`);
    }

    const updates: Partial<INode> = { owner, ...(group && { group }) };

    const updatedInode = await resolution.mountPoint.provider.updateInode(
      resolution.inode,
      updates,
    );

    this.inodeCache.set(resolution.inode, updatedInode);
  }

  // === PRIVATE HELPER METHODS ===

  /**
   * Resolve path to mount point and inode
   */
  private async resolvePath(path: Path): Promise<PathResolution> {
    const resolvedPath = this.resolve(path);

    // Check cache
    const cachedInode = this.pathCache.get(resolvedPath);

    // Find mount point
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
   * Load inode from cache or provider
   */
  private async getInode(inodeNumber: InodeNumber): Promise<INode> {
    const inode = this.inodeCache.get(inodeNumber);
    if (!inode) {
      // Try to load from provider
      for (const mountPoint of this.mountPoints.values()) {
        try {
          const exists = await mountPoint.provider.exists(inodeNumber);
          if (exists) {
            // Provider should have a method to load inode
            // For now we throw an error
            throw new Error(`Inode ${inodeNumber} not found in cache`);
          }
        } catch {
          // Provider might not support exists method
        }
      }
      throw new Error(`Inode ${inodeNumber} not found`);
    }
    return inode;
  }

  /**
   * Create new file
   */
  private async createFile(
    path: Path,
    data: Uint8Array,
    _options?: Partial<INode>,
  ): Promise<INode> {
    const normalizedPath = this.resolve(path);
    const parentPath = this.dirname(normalizedPath);

    // Check if parent directory exists
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

    // Create inode via provider
    const createdInode = await resolution.mountPoint.provider.createInode(
      FileType.FILE,
      0o644,
    );

    // Write data
    await resolution.mountPoint.provider.writeFile(createdInode.inode, data);

    this.inodeCache.set(createdInode.inode, createdInode);
    this.pathCache.set(normalizedPath, createdInode.inode);

    return createdInode;
  }

  /**
   * Helper method: Create directory
   */
  private async createDirectory(
    path: Path,
    mode?: PermissionMask,
  ): Promise<INode> {
    const normalizedPath = this.resolve(path);
    const parentPath = this.dirname(normalizedPath);

    if (parentPath !== normalizedPath) {
      // Check if parent directory exists
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

    // Create inode via provider
    const createdInode = await resolution.mountPoint.provider.createInode(
      FileType.DIRECTORY,
      mode || 0o755,
    );

    this.inodeCache.set(createdInode.inode, createdInode);
    this.pathCache.set(normalizedPath, createdInode.inode);

    return createdInode;
  }

  /**
   * Load VFS provider
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
        const { IndexedDBProvider } = await import(
          "./providers/IndexedDBProvider.js"
        );
        const provider = new IndexedDBProvider(options.dbName as string);
        await provider.initialize();
        return provider;
      }
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }

  /**
   * Next available inode number
   */
  private getNextInodeNumber(): InodeNumber {
    return this.nextInodeNumber++;
  }

  /**
   * Get cache statistics (for debugging)
   */
  public getCacheStats(): {
    pathCacheSize: number;
    inodeCacheSize: number;
    mountPointsCount: number;
    nextInodeNumber: number;
  } {
    return {
      pathCacheSize: this.pathCache.size,
      inodeCacheSize: this.inodeCache.size,
      mountPointsCount: this.mountPoints.size,
      nextInodeNumber: this.nextInodeNumber,
    };
  }

  /**
   * Clear cache (for tests or debugging)
   */
  public clearCache(): void {
    this.pathCache.clear();
    this.inodeCache.clear();
  }
}
