/**
 * Exit codes for command execution
 */
export enum ExitCode {
  /** Successful */
  SUCCESS = 0,
  /** General error */
  ERROR = 1,
  /** General error (alias for ERROR) */
  FAILURE = 1,
  /** General error */
  GENERAL_ERROR = 1,
  /** Invalid use of a shell builtin */
  MISUSE = 2,
  /** Command not found */
  COMMAND_NOT_FOUND = 127,
  /** Invalid argument for exit */
  INVALID_EXIT_ARGUMENT = 128,
  /** Command terminated by signal */
  TERMINATED_BY_SIGNAL = 130,
}
