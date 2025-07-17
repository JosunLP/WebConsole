/**
 * Verschiedene Arten von Filesystem-Einträgen
 */
export enum FileType {
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
