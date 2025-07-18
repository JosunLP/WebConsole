/**
 * Logger-Implementierung für das Web-Console-System
 */

import { LogLevel } from "../enums/index.js";
import { ILogger } from "../interfaces/index.js";

/**
 * Log-Eintrag Struktur
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  args: unknown[];
  timestamp: number;
  source?: string;
}

/**
 * Console-Logger mit konfigurierbarem Level
 */
export class Logger implements ILogger {
  private level: LogLevel = LogLevel.INFO;
  private readonly prefix: string;
  private readonly history: LogEntry[] = [];
  private readonly maxHistorySize: number;

  // Log-Level Prioritäten (höhere Zahl = höhere Priorität)
  private static readonly LEVEL_PRIORITY = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };

  constructor(prefix = "WebConsole", maxHistorySize = 1000) {
    this.prefix = prefix;
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Debug-Nachricht loggen
   */
  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  /**
   * Info-Nachricht loggen
   */
  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  /**
   * Warning-Nachricht loggen
   */
  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  /**
   * Error-Nachricht loggen
   */
  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, args);
  }

  /**
   * Log-Level setzen
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Aktuelles Log-Level abrufen
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Log-History abrufen
   */
  getHistory(): readonly LogEntry[] {
    return this.history;
  }

  /**
   * Log-History leeren
   */
  clearHistory(): void {
    this.history.length = 0;
  }

  /**
   * Prüfen ob ein Level geloggt werden soll
   */
  shouldLog(level: LogLevel): boolean {
    return Logger.LEVEL_PRIORITY[level] >= Logger.LEVEL_PRIORITY[this.level];
  }

  /**
   * Interne Log-Methode
   */
  private log(level: LogLevel, message: string, args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = Date.now();
    const entry: LogEntry = {
      level,
      message,
      args,
      timestamp,
      source: this.prefix,
    };

    // Zur History hinzufügen
    this.addToHistory(entry);

    // Console-Output formatieren
    const formattedMessage = this.formatMessage(entry);
    this.writeToConsole(level, formattedMessage, args);
  }

  /**
   * Eintrag zur History hinzufügen
   */
  private addToHistory(entry: LogEntry): void {
    this.history.push(entry);

    // History-Größe begrenzen
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Log-Nachricht formatieren
   */
  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    return `[${timestamp}] ${level} [${entry.source}] ${entry.message}`;
  }

  /**
   * Zur Browser-Console schreiben
   */
  private writeToConsole(
    level: LogLevel,
    message: string,
    args: unknown[],
  ): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, ...args);
        break;
      case LogLevel.INFO:
        console.info(message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(message, ...args);
        break;
    }
  }

  /**
   * Child-Logger erstellen mit zusätzlichem Prefix
   */
  child(suffix: string): Logger {
    return new Logger(`${this.prefix}:${suffix}`, this.maxHistorySize);
  }

  /**
   * Timing-Methoden für Performance-Messung
   */
  time(label: string): void {
    console.time(`${this.prefix}:${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`${this.prefix}:${label}`);
  }

  /**
   * Memory-Usage loggen (falls verfügbar)
   */
  memory(): void {
    if ("memory" in performance) {
      const memory = (
        performance as {
          memory: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      this.debug("Memory usage:", {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
      });
    }
  }

  /**
   * Gruppe starten (für bessere Console-Organisation)
   */
  group(label: string): void {
    console.group(`${this.prefix}: ${label}`);
  }

  /**
   * Gruppe beenden
   */
  groupEnd(): void {
    console.groupEnd();
  }

  /**
   * Tabelle ausgeben
   */
  table(data: unknown): void {
    console.table(data);
  }
}
