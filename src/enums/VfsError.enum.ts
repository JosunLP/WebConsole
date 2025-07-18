/**
 * VFS-Fehlercodes
 */
export enum VfsError {
  /** File or directory not found */
  NOT_FOUND = "ENOENT",
  /** Zugriff verweigert */
  ACCESS_DENIED = "EACCES",
  /** Is a directory */
  IS_DIRECTORY = "EISDIR",
  /** Is not a file */
  NOT_A_FILE = "ENOTFILE",
  /** File already exists */
  FILE_EXISTS = "EEXIST",
  /** Directory not empty */
  NOT_EMPTY = "ENOTEMPTY",
  /** Invalid path */
  INVALID_PATH = "EINVAL",
  /** Kein Speicherplatz */
  NO_SPACE = "ENOSPC",
  /** Zu viele Links */
  TOO_MANY_LINKS = "EMLINK",
}
