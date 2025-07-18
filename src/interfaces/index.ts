/**
 * Global interface exports for the Web Console system
 */

// Interface Exports
export type { ICommandHandler } from "./ICommandHandler.interface.js";
export type { ICommandRegistry } from "./ICommandRegistry.interface.js";
export type {
  IComponent,
  IComponentRegistry,
} from "./IComponentRegistry.interface.js";
export type { IConsole } from "./IConsole.interface.js";
export type { IConsoleOptions } from "./IConsoleOptions.interface.js";
export type { IDirEntry } from "./IDirEntry.interface.js";
export type { IEventEmitter } from "./IEventEmitter.interface.js";
export type { IKernel } from "./IKernel.interface.js";
export type { ILogger } from "./ILogger.interface.js";
export type { INode } from "./INode.interface.js";
export type { IParser } from "./IParser.interface.js";
export type { IPlugin } from "./IPlugin.interface.js";
export type { IStateManager } from "./IStateManager.interface.js";
export type { ITheme } from "./ITheme.interface.js";
export type { IThemeManager } from "./IThemeManager.interface.js";
export type { IVFS } from "./IVFS.interface.js";
export type { IVFSProvider } from "./IVFSProvider.interface.js";
export type { IWorkerManager } from "./IWorkerManager.interface.js";
export {
  WorkerTaskPriority,
  WorkerTaskStatus,
  WorkerTaskType,
} from "./IWorkerTask.interface.js";
export type {
  IWorkerPermissions,
  IWorkerPool,
  IWorkerTask,
  IWorkerTaskResult,
} from "./IWorkerTask.interface.js";
