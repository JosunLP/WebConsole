/**
 * Global enums for the Web-Console system
 *
 * This file re-exports all enums from the separate enum files
 * for a clean API and backwards compatibility.
 */

// Re-export all enums from their respective files
export { CommandType } from "./CommandType.enum";
export { ConsoleEvent } from "./ConsoleEvent.enum";
export { ExitCode } from "./ExitCode.enum";
export { KernelEvent } from "./KernelEvent.enum";
export { LogLevel } from "./LogLevel.enum";
export { Permission } from "./Permission.enum";
export { PersistenceMode } from "./PersistenceMode.enum";
export { RedirectionType } from "./RedirectionType.enum";
export { ThemeMode } from "./ThemeMode.enum";
export { VfsError } from "./VfsError.enum";
export { VFSEvent } from "./VFSEvent.enum";
export { FileType, VfsItemType } from "./VfsItemType.enum";
