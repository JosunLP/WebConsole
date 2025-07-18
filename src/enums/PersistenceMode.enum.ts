/**
 * Verschiedene Persistenz-Modi für State-Management
 */
export enum PersistenceMode {
  /** Nur im RAM, nicht persistent */
  VOLATILE = "volatile",
  /** SessionStorage - persists for the session */
  SESSION = "session",
  /** LocalStorage - dauerhaft persistent */
  PERSISTENT = "persistent",
}
