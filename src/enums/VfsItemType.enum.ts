/**
 * VFS-Eintragstypen (kompatibel mit FileType)
 */
export enum VfsItemType {
  /** Reguläre Datei */
  FILE = "file",
  /** Verzeichnis */
  DIRECTORY = "directory",
  /** Symbolischer Link */
  SYMLINK = "symlink",
}
