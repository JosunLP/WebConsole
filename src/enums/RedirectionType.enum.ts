/**
 * Redirection-Typen
 */
export enum RedirectionType {
  /** Input Redirection < */
  INPUT = "input",
  /** Output Redirection > */
  OUTPUT = "output",
  /** Append Redirection >> */
  APPEND = "append",
  /** Error Redirection 2> */
  ERROR = "error",
  /** Error Append 2>> */
  ERROR_APPEND = "error_append",
}
