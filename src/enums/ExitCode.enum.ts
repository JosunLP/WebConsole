/**
 * Exit-Codes für Befehlsausführung
 */
export enum ExitCode {
  /** Erfolgreich */
  SUCCESS = 0,
  /** Allgemeiner Fehler */
  ERROR = 1,
  /** Allgemeiner Fehler (Alias für ERROR) */
  FAILURE = 1,
  /** Ungültige Verwendung eines Shell-Builtins */
  MISUSE = 2,
  /** Befehl nicht gefunden */
  COMMAND_NOT_FOUND = 127,
  /** Ungültiges Argument für Exit */
  INVALID_EXIT_ARGUMENT = 128,
  /** Befehl durch Signal beendet */
  TERMINATED_BY_SIGNAL = 130
}
