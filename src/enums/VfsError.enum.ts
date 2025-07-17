/**
 * VFS-Fehlercodes
 */
export enum VfsError {
  /** Datei oder Verzeichnis nicht gefunden */
  NOT_FOUND = "ENOENT",
  /** Zugriff verweigert */
  ACCESS_DENIED = "EACCES",
  /** Ist ein Verzeichnis */
  IS_DIRECTORY = "EISDIR",
  /** Ist keine Datei */
  NOT_A_FILE = "ENOTFILE",
  /** Datei existiert bereits */
  FILE_EXISTS = "EEXIST",
  /** Verzeichnis nicht leer */
  NOT_EMPTY = "ENOTEMPTY",
  /** Ungültiger Pfad */
  INVALID_PATH = "EINVAL",
  /** Kein Speicherplatz */
  NO_SPACE = "ENOSPC",
  /** Zu viele Links */
  TOO_MANY_LINKS = "EMLINK",
}
