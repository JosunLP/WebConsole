/**
 * Basic primitive type definitions
 */

/**
 * Unique ID for various entities
 */
export type ID = string;

/**
 * Unix timestamp in milliseconds
 */
export type Timestamp = number;

/**
 * POSIX-like file path
 */
export type Path = string;

/**
 * MIME type for files
 */
export type MimeType = string;

/**
 * Color value (CSS-compatible)
 */
export type ColorValue = string;

/**
 * CSS custom property name
 */
export type CSSCustomProperty = `--${string}`;

/**
 * Glob pattern for file search
 */
export type GlobPattern = string;

/**
 * Permissions as octal number (e.g. 0o755)
 */
export type PermissionMask = number;

/**
 * Inode number in VFS
 */
export type InodeNumber = number;

/**
 * Block address in storage
 */
export type BlockAddress = number;

/**
 * Environment variables
 */
export type Environment = Record<string, string>;
