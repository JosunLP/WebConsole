/**
 * Command-Typen
 */
export enum CommandType {
  /** Built-in Befehl */
  BUILTIN = 'builtin',
  /** Externer Befehl */
  EXTERNAL = 'external',
  /** Alias */
  ALIAS = 'alias',
  /** Funktion */
  FUNCTION = 'function'
}
