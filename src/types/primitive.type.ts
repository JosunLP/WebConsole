/**
 * Grundlegende primitive Typdefinitionen
 */

/**
 * Unique ID for various entities
 */
export type ID = string;

/**
 * Unix-Timestamp in Millisekunden
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
 * Color-Value (CSS-kompatibel)
 */
export type ColorValue = string;

/**
 * CSS-Custom-Property Name
 */
export type CSSCustomProperty = `--${string}`;

/**
 * Glob pattern for file search
 */
export type GlobPattern = string;

/**
 * Permissions als Oktal-Zahl (z.B. 0o755)
 */
export type PermissionMask = number;

/**
 * Inode-Nummer im VFS
 */
export type InodeNumber = number;

/**
 * Block-Adresse im Storage
 */
export type BlockAddress = number;

/**
 * Umgebungsvariablen
 */
export type Environment = Record<string, string>;
