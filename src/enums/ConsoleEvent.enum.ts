/**
 * Console-Events
 */
export enum ConsoleEvent {
  /** Console bereit */
  READY = "console:ready",
  /** Console zerstört */
  DESTROYED = "console:destroyed",
  /** Console wird zerstört */
  DESTROYING = "console:destroying",
  /** Befehl wurde eingegeben */
  COMMAND_ENTERED = "command:entered",
  /** Befehl startet */
  COMMAND_START = "command:start",
  /** Befehl wird ausgeführt */
  COMMAND_EXECUTING = "command:executing",
  /** Befehl abgeschlossen */
  COMMAND_COMPLETED = "command:completed",
  /** Befehl beendet */
  COMMAND_END = "command:end",
  /** Befehl fehlgeschlagen */
  COMMAND_FAILED = "command:failed",
  /** Befehl Fehler */
  COMMAND_ERROR = "command:error",
  /** Working Directory geändert */
  DIRECTORY_CHANGED = "directory:changed",
  /** CWD geändert */
  CWD_CHANGED = "cwd:changed",
  /** Environment Variable geändert */
  ENV_CHANGED = "env:changed",
  /** Prompt geändert */
  PROMPT_CHANGED = "prompt:changed",
  /** History geleert */
  HISTORY_CLEARED = "history:cleared",
  /** History aktualisiert */
  HISTORY_UPDATED = "history:updated",
  /** Theme geändert */
  THEME_CHANGED = "theme:changed",
}
