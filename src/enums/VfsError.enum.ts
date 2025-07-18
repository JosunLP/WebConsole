/**
 * VFS error codes
 */
export enum VfsError {
  /** File or directory not found */
  NOT_FOUND = "ENOENT",
  /** Access denied */
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
  /** No space left */
  NO_SPACE = "ENOSPC",
  /** Too many links */
  TOO_MANY_LINKS = "EMLINK",
}
