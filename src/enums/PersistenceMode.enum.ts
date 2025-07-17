/**
 * Verschiedene Persistenz-Modi für State-Management
 */
export enum PersistenceMode {
  /** Nur im RAM, nicht persistent */
  VOLATILE = 'volatile',
  /** SessionStorage - persistiert für die Session */
  SESSION = 'session',
  /** LocalStorage - dauerhaft persistent */
  PERSISTENT = 'persistent'
}
