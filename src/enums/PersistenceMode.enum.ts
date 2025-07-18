/**
 * Different persistence modes for state management
 */
export enum PersistenceMode {
  /** RAM only, not persistent */
  VOLATILE = "volatile",
  /** SessionStorage - persists for the session */
  SESSION = "session",
  /** LocalStorage - permanently persistent */
  PERSISTENT = "persistent",
}
