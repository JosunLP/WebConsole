/**
 * Globale Interfaces für das Web-Console-System
 */

import {
    BlockAddress,
    CommandContext,
    CommandResult,
    Environment,
    EventHandler,
    EventUnsubscriber,
    GlobPattern,
    ID,
    InodeNumber,
    MimeType,
    MountConfig,
    ParsedCommand,
    Path,
    PermissionMask,
    StateConfig,
    ThemeTokens,
    Timestamp
} from '../types/index.js';

import {
    CommandType,
    ExitCode,
    FileType,
    LogLevel,
    ThemeMode
} from '../enums/index.js';

/**
 * Event-Emitter Interface
 */
export interface IEventEmitter {
  on<T = unknown>(event: string, handler: EventHandler<T>): EventUnsubscriber;
  off(event: string, handler: EventHandler): void;
  emit<T = unknown>(event: string, data: T): void;
  once<T = unknown>(event: string, handler: EventHandler<T>): EventUnsubscriber;
  removeAllListeners(event?: string): void;
}

/**
 * Logger Interface
 */
export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * VFS-Inode (Filesystem-Metadaten)
 */
export interface INode {
  readonly inode: InodeNumber;
  readonly type: FileType;
  readonly permissions: PermissionMask;
  readonly owner: string;
  readonly group: string;
  readonly size: number;
  readonly created: Timestamp;
  readonly modified: Timestamp;
  readonly accessed: Timestamp;
  readonly mimeType?: MimeType;
  readonly blocks: BlockAddress[];
  readonly linkCount: number;
  readonly target?: Path; // Für Symlinks
}

/**
 * VFS-Eintrag (Directory Entry)
 */
export interface IDirEntry {
  readonly name: string;
  readonly inode: InodeNumber;
  readonly type: FileType;
}

/**
 * VFS-Provider Interface
 */
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

/**
 * Virtual File System Interface
 */
export interface IVFS extends IEventEmitter {
  // Path Operations
  resolve(path: Path): Path;
  join(...paths: Path[]): Path;
  dirname(path: Path): Path;
  basename(path: Path, ext?: string): string;
  extname(path: Path): string;

  // File Operations
  readFile(path: Path): Promise<Uint8Array>;
  writeFile(path: Path, data: Uint8Array, options?: Partial<INode>): Promise<void>;
  appendFile(path: Path, data: Uint8Array): Promise<void>;
  deleteFile(path: Path): Promise<void>;
  exists(path: Path): Promise<boolean>;
  stat(path: Path): Promise<INode>;

  // Directory Operations
  readDir(path: Path): Promise<IDirEntry[]>;
  createDir(path: Path, permissions?: PermissionMask): Promise<void>;
  deleteDir(path: Path, recursive?: boolean): Promise<void>;

  // Link Operations
  symlink(target: Path, linkPath: Path): Promise<void>;
  readlink(path: Path): Promise<Path>;

  // Mount Operations
  mount(config: MountConfig): Promise<void>;
  unmount(path: Path): Promise<void>;
  getMounts(): MountConfig[];

  // Watch Operations
  watch(path: Path, handler: EventHandler): EventUnsubscriber;

  // Glob Operations
  glob(pattern: GlobPattern, cwd?: Path): Promise<Path[]>;

  // Permissions
  chmod(path: Path, permissions: PermissionMask): Promise<void>;
  chown(path: Path, owner: string, group?: string): Promise<void>;
}

/**
 * State Manager Interface
 */
export interface IStateManager extends IEventEmitter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  keys(): string[];

  // Konfiguration für Keys
  configure<T>(config: StateConfig<T>): void;

  // Namespaces
  namespace(name: string): IStateManager;

  // Persistierung
  persist(): Promise<void>;
  restore(): Promise<void>;
}

/**
 * Theme Interface
 */
export interface ITheme {
  readonly name: string;
  readonly mode: ThemeMode;
  readonly tokens: ThemeTokens;
  readonly css?: string;
  readonly variables?: Record<string, string>;
}

/**
 * Theme Manager Interface
 */
export interface IThemeManager extends IEventEmitter {
  getCurrentTheme(): ITheme;
  setTheme(name: string): Promise<void>;
  registerTheme(theme: ITheme): void;
  unregisterTheme(name: string): void;
  getAvailableThemes(): string[];

  // CSS-Integration
  injectCSS(): void;
  removeCSS(): void;

  // Token-Zugriff
  getToken(name: string): string | undefined;
  setToken(name: string, value: string): void;
}

/**
 * Command Handler Interface
 */
export interface ICommandHandler {
  readonly name: string;
  readonly type: CommandType;
  readonly description?: string;
  readonly usage?: string;

  execute(context: CommandContext): Promise<ExitCode>;

  // Optionale Lifecycle-Hooks
  beforeExecute?(context: CommandContext): Promise<void>;
  afterExecute?(context: CommandContext, result: CommandResult): Promise<void>;
  onError?(context: CommandContext, error: Error): Promise<void>;
}

/**
 * Command Registry Interface
 */
export interface ICommandRegistry {
  register(handler: ICommandHandler): void;
  unregister(name: string): void;
  get(name: string): ICommandHandler | undefined;
  has(name: string): boolean;
  list(): string[];

  // Aliase
  alias(alias: string, command: string): void;
  unalias(alias: string): void;
  getAliases(): Record<string, string>;
}

/**
 * Parser Interface
 */
export interface IParser {
  parse(input: string): ParsedCommand;
  tokenize(input: string): string[];

  // Erweiterungen
  addOperator(operator: string, precedence: number): void;
  addFunction(name: string, handler: Function): void;
}

/**
 * Console Interface (Hauptklasse)
 */
export interface IConsole extends IEventEmitter {
  readonly id: ID;
  readonly workingDirectory: Path;
  readonly environment: Environment;
  readonly history: string[];

  // Execution
  execute(command: string): Promise<CommandResult>;

  // Directory Operations
  changeDirectory(path: Path): Promise<void>;

  // Environment
  setEnvironment(key: string, value: string): void;
  getEnvironment(key?: string): string | Environment;
  unsetEnvironment(key: string): void;

  // History
  addToHistory(command: string): void;
  clearHistory(): void;

  // State
  getState(): IStateManager;

  // Lifecycle
  destroy(): Promise<void>;
}

/**
 * Kernel Interface (Singleton)
 */
export interface IKernel extends IEventEmitter {
  readonly version: string;
  readonly isStarted: boolean;

  // Lifecycle
  start(): Promise<void>;
  shutdown(): Promise<void>;

  // Subsystems
  getVFS(): IVFS;
  getThemeManager(): IThemeManager;
  getCommandRegistry(): ICommandRegistry;
  getLogger(): ILogger;

  // Console Management
  createConsole(options?: Partial<IConsoleOptions>): Promise<IConsole>;
  getConsole(id: ID): IConsole | undefined;
  destroyConsole(id: ID): Promise<void>;
  listConsoles(): ID[];

  // Global State
  getGlobalState(): IStateManager;
}

/**
 * Console-Erstellungsoptionen
 */
export interface IConsoleOptions {
  readonly workingDirectory: Path;
  readonly environment: Environment;
  readonly prompt: string;
  readonly maxHistorySize: number;
  readonly enablePersistence: boolean;
}

/**
 * Component Registry Interface
 */
export interface IComponentRegistry {
  register(name: string, loader: () => Promise<unknown>): void;
  load(name: string): Promise<unknown>;
  unregister(name: string): void;
  isRegistered(name: string): boolean;
  list(): string[];
}

/**
 * Plugin Interface
 */
export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];

  install(kernel: IKernel): Promise<void>;
  uninstall(kernel: IKernel): Promise<void>;

  // Optionale Lifecycle-Hooks
  beforeInstall?(kernel: IKernel): Promise<void>;
  afterInstall?(kernel: IKernel): Promise<void>;
  beforeUninstall?(kernel: IKernel): Promise<void>;
  afterUninstall?(kernel: IKernel): Promise<void>;
}
