/**
 * Console events
 */
export enum ConsoleEvent {
  /** Console ready */
  READY = "console:ready",
  /** Console destroyed */
  DESTROYED = "console:destroyed",
  /** Console being destroyed */
  DESTROYING = "console:destroying",
  /** Command was entered */
  COMMAND_ENTERED = "command:entered",
  /** Command starts */
  COMMAND_START = "command:start",
  /** Command being executed */
  COMMAND_EXECUTING = "command:executing",
  /** Command completed */
  COMMAND_COMPLETED = "command:completed",
  /** Command ended */
  COMMAND_END = "command:end",
  /** Command failed */
  COMMAND_FAILED = "command:failed",
  /** Command error */
  COMMAND_ERROR = "command:error",
  /** Working directory changed */
  DIRECTORY_CHANGED = "directory:changed",
  /** CWD changed */
  CWD_CHANGED = "cwd:changed",
  /** Environment variable changed */
  ENV_CHANGED = "env:changed",
  /** Prompt changed */
  PROMPT_CHANGED = "prompt:changed",
  /** History geleert */
  HISTORY_CLEARED = "history:cleared",
  /** History aktualisiert */
  HISTORY_UPDATED = "history:updated",
  /** Theme changed */
  THEME_CHANGED = "theme:changed",
}
