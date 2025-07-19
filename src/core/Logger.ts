/**
 * Logger implementation for the Web-Console system
 */

import { LogLevel } from "../enums/index.js";
import { ILogger } from "../interfaces/index.js";

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  args: unknown[];
  timestamp: number;
  source?: string;
}

/**
 * Console logger with configurable level
 */
export class Logger implements ILogger {
  private level: LogLevel = LogLevel.INFO;
  private readonly prefix: string;
  private readonly history: LogEntry[] = [];
  private readonly maxHistorySize: number;

  // Log level priorities (higher number = higher priority)
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
   * Log debug message
   */
  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  /**
   * Log info message
   */
  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  /**
   * Log error message
   */
  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, args);
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Get log history
   */
  getHistory(): readonly LogEntry[] {
    return this.history;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.history.length = 0;
  }

  /**
   * Check if a level should be logged
   */
  shouldLog(level: LogLevel): boolean {
    return Logger.LEVEL_PRIORITY[level] >= Logger.LEVEL_PRIORITY[this.level];
  }

  /**
   * Internal log method
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

    // Add to history
    this.addToHistory(entry);

    // Format console output
    const formattedMessage = this.formatMessage(entry);
    this.writeToConsole(level, formattedMessage, args);
  }

  /**
   * Add entry to history
   */
  private addToHistory(entry: LogEntry): void {
    this.history.push(entry);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Format log message
   */
  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    return `[${timestamp}] ${level} [${entry.source}] ${entry.message}`;
  }

  /**
   * Write to browser console
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
   * Create child logger with additional prefix
   */
  child(suffix: string): Logger {
    return new Logger(`${this.prefix}:${suffix}`, this.maxHistorySize);
  }

  /**
   * Timing methods for performance measurement
   */
  time(label: string): void {
    console.time(`${this.prefix}:${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`${this.prefix}:${label}`);
  }

  /**
   * Log memory usage (if available)
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
   * Start group (for better console organization)
   */
  group(label: string): void {
    console.group(`${this.prefix}: ${label}`);
  }

  /**
   * End group
   */
  groupEnd(): void {
    console.groupEnd();
  }

  /**
   * Output table
   */
  table(data: unknown): void {
    console.table(data);
  }
}
