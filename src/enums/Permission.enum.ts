/**
 * POSIX file permissions
 */
export enum Permission {
  /** Lesen (4) */
  READ = 0b100,
  /** Schreiben (2) */
  WRITE = 0b010,
  /** Execute (1) */
  EXECUTE = 0b001,
}
