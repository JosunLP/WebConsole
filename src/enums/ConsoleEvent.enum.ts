/**
 * Console-Events
 */
export enum ConsoleEvent {
  /** Befehl wurde eingegeben */
  COMMAND_ENTERED = 'command:entered',
  /** Befehl wird ausgeführt */
  COMMAND_EXECUTING = 'command:executing',
  /** Befehl abgeschlossen */
  COMMAND_COMPLETED = 'command:completed',
  /** Befehl fehlgeschlagen */
  COMMAND_FAILED = 'command:failed',
  /** Working Directory geändert */
  DIRECTORY_CHANGED = 'directory:changed',
  /** Theme geändert */
  THEME_CHANGED = 'theme:changed',
  /** Console bereit */
  READY = 'console:ready',
  /** Console wird zerstört */
  DESTROYING = 'console:destroying'
}
