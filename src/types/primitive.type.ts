/**
 * Grundlegende primitive Typdefinitionen
 */

/**
 * Eindeutige ID für verschiedene Entitäten
 */
export type ID = string;

/**
 * Unix-Timestamp in Millisekunden
 */
export type Timestamp = number;

/**
 * POSIX-ähnlicher Dateipfad
 */
export type Path = string;

/**
 * Mime-Type für Dateien
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
 * Glob-Pattern für Dateisuche
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
