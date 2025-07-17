/**
 * VFS-Eintragstypen - Unified type system for file system entries
 * This replaces FileType to avoid conflicts and provides a single source of truth
 */
export enum VfsItemType {
  /** Reguläre Datei */
  FILE = "file",
  /** Verzeichnis */
  DIRECTORY = "directory",
  /** Symbolischer Link */
  SYMLINK = "symlink",
  /** Hard Link */
  HARDLINK = "hardlink",
  /** Block Device */
  BLOCK_DEVICE = "block",
  /** Character Device */
  CHAR_DEVICE = "char",
  /** Named Pipe */
  FIFO = "fifo",
}

// Legacy alias for backward compatibility
export const FileType = VfsItemType;
