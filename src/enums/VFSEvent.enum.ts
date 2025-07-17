/**
 * VFS Events
 */
export enum VFSEvent {
  /** Datei erstellt */
  FILE_CREATED = "file:created",
  /** Datei geändert */
  FILE_CHANGED = "file:changed",
  /** Datei gelöscht */
  FILE_DELETED = "file:deleted",
  /** Verzeichnis erstellt */
  DIRECTORY_CREATED = "directory:created",
  /** Verzeichnis gelöscht */
  DIRECTORY_DELETED = "directory:deleted",
  /** Mount-Point hinzugefügt */
  MOUNT_ADDED = "mount:added",
  /** Mount-Point entfernt */
  MOUNT_REMOVED = "mount:removed",
}
