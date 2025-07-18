/**
 * Exit-Codes für Befehlsausführung
 */
export enum ExitCode {
  /** Erfolgreich */
  SUCCESS = 0,
  /** Allgemeiner Fehler */
  ERROR = 1,
  /** General error (alias for ERROR) */
  FAILURE = 1,
  /** Allgemeiner Fehler */
  GENERAL_ERROR = 1,
  /** Invalid use of a shell builtin */
  MISUSE = 2,
  /** Befehl nicht gefunden */
  COMMAND_NOT_FOUND = 127,
  /** Invalid argument for exit */
  INVALID_EXIT_ARGUMENT = 128,
  /** Befehl durch Signal beendet */
  TERMINATED_BY_SIGNAL = 130,
}
