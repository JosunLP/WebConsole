/**
 * Globale Enums für das Web-Console-System
 */

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

/**
 * Exit-Codes für Befehlsausführung
 */
export enum ExitCode {
  /** Erfolgreich */
  SUCCESS = 0,
  /** Allgemeiner Fehler */
  ERROR = 1,
  /** Ungültige Verwendung eines Shell-Builtins */
  MISUSE = 2,
  /** Befehl nicht gefunden */
  COMMAND_NOT_FOUND = 127,
  /** Ungültiges Argument für Exit */
  INVALID_EXIT_ARGUMENT = 128,
  /** Befehl durch Signal beendet */
  TERMINATED_BY_SIGNAL = 130
}

/**
 * Verschiedene Arten von Filesystem-Einträgen
 */
export enum FileType {
  /** Reguläre Datei */
  FILE = 'file',
  /** Verzeichnis */
  DIRECTORY = 'directory',
  /** Symbolischer Link */
  SYMLINK = 'symlink',
  /** Hard Link */
  HARDLINK = 'hardlink',
  /** Block Device */
  BLOCK_DEVICE = 'block',
  /** Character Device */
  CHAR_DEVICE = 'char',
  /** Named Pipe */
  FIFO = 'fifo'
}

/**
 * POSIX-Dateiberechtigungen
 */
export enum Permission {
  /** Lesen (4) */
  READ = 0b100,
  /** Schreiben (2) */
  WRITE = 0b010,
  /** Ausführen (1) */
  EXECUTE = 0b001
}

/**
 * Log-Level für das interne Logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Theme-Modi
 */
export enum ThemeMode {
  /** Helles Theme */
  LIGHT = 'light',
  /** Dunkles Theme */
  DARK = 'dark',
  /** System-Theme folgen */
  AUTO = 'auto'
}

/**
 * Console-Events
 */
export enum ConsoleEvent {
  /** Befehl wurde eingegeben */
  COMMAND_ENTERED = 'command:entered',
  /** Befehl wird ausgeführt */
  COMMAND_EXECUTING = 'command:executing',
  /** Befehl abgeschlossen */
  COMMAND_COMPLETED = 'command:completed',
  /** Befehl fehlgeschlagen */
  COMMAND_FAILED = 'command:failed',
  /** Working Directory geändert */
  DIRECTORY_CHANGED = 'directory:changed',
  /** Theme geändert */
  THEME_CHANGED = 'theme:changed',
  /** Console bereit */
  READY = 'console:ready',
  /** Console wird zerstört */
  DESTROYING = 'console:destroying'
}

/**
 * VFS Events
 */
export enum VFSEvent {
  /** Datei erstellt */
  FILE_CREATED = 'file:created',
  /** Datei geändert */
  FILE_CHANGED = 'file:changed',
  /** Datei gelöscht */
  FILE_DELETED = 'file:deleted',
  /** Verzeichnis erstellt */
  DIRECTORY_CREATED = 'directory:created',
  /** Verzeichnis gelöscht */
  DIRECTORY_DELETED = 'directory:deleted',
  /** Mount-Point hinzugefügt */
  MOUNT_ADDED = 'mount:added',
  /** Mount-Point entfernt */
  MOUNT_REMOVED = 'mount:removed'
}

/**
 * Kernel Events
 */
export enum KernelEvent {
  /** Kernel gestartet */
  STARTED = 'kernel:started',
  /** Kernel wird heruntergefahren */
  SHUTTING_DOWN = 'kernel:shutdown',
  /** Fehler im Kernel */
  ERROR = 'kernel:error'
}

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

/**
 * Redirection-Typen
 */
export enum RedirectionType {
  /** Input Redirection < */
  INPUT = 'input',
  /** Output Redirection > */
  OUTPUT = 'output',
  /** Append Redirection >> */
  APPEND = 'append',
  /** Error Redirection 2> */
  ERROR = 'error',
  /** Error Append 2>> */
  ERROR_APPEND = 'error_append'
}
