/**
 * VFS Events
 */
export enum VFSEvent {
  /** File created */
  FILE_CREATED = "file:created",
  /** File changed */
  FILE_CHANGED = "file:changed",
  /** File deleted */
  FILE_DELETED = "file:deleted",
  /** Directory created */
  DIRECTORY_CREATED = "directory:created",
  /** Directory deleted */
  DIRECTORY_DELETED = "directory:deleted",
  /** Mount point added */
  MOUNT_ADDED = "mount:added",
  /** Mount point removed */
  MOUNT_REMOVED = "mount:removed",
}
