/**
 * Utility functions for the Web Console system
 */

import { Path } from "../types/index.js";

/**
 * Check if a value is defined and not null
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if a value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

/**
 * Check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Check if a value is an object (but not an array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Deep clone of an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const cloned = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return cloned as T;
  }

  return obj;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle-Funktion
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        break;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay,
      );

      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Sleep-Funktion
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Secure ID generation with crypto.getRandomValues()
 */
export function generateSecureId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      // Use secure cryptographic random numbers
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
    }
  } catch {
    // Fallback for environments without crypto API
    console.warn(
      "crypto.getRandomValues not available, falling back to Math.random()",
    );
  }
  return generateId();
}

/**
 * Secure message ID generation for worker communication
 */
export function generateMessageId(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    // Compact but secure message ID (8 bytes = 16 hex characters)
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } else {
    // Fallback for environments without crypto API
    console.warn(
      "crypto.getRandomValues not available, falling back to Math.random()",
    );
    return Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Secure worker ID generation
 */
export function generateWorkerId(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    const randomPart = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `worker-${randomPart}`;
  } else {
    // Fallback for environments without crypto API
    console.warn(
      "crypto.getRandomValues not available, falling back to Math.random()",
    );
    return "worker-" + Math.random().toString(36).substr(2, 9);
  }
}

/**
 * UUID v4 Generator (simplified) - DEPRECATED, use generateSecureId() instead
 * @deprecated Use generateSecureId() for better security
 */
export function generateId(): string {
  return crypto.randomUUID() || generateSecureId();
}

/**
 * Format bytes into human-readable form
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format time duration into human-readable form
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Escape HTML characters
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Unescape HTML characters
 */
export function unescapeHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

/**
 * Remove ANSI color codes
 */
export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

/**
 * Path validation
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  // Must start with /
  if (!path.startsWith("/")) {
    return false;
  }

  // No invalid characters
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(path)) {
    return false;
  }

  return true;
}

/**
 * Normalize a path
 */
export function normalizePath(path: Path): Path {
  if (!isValidPath(path)) {
    throw new Error(`Invalid path: ${path}`);
  }

  const parts = path.split("/").filter((part) => part.length > 0);
  const normalized: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      normalized.pop();
    } else if (part !== ".") {
      normalized.push(part);
    }
  }

  return "/" + normalized.join("/");
}

/**
 * Calculate relative paths
 */
export function relativePath(from: Path, to: Path): Path {
  const fromParts = normalizePath(from).split("/").filter(Boolean);
  const toParts = normalizePath(to).split("/").filter(Boolean);

  // Find common prefix
  let commonLength = 0;
  for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
    if (fromParts[i] === toParts[i]) {
      commonLength++;
    } else {
      break;
    }
  }

  // Backward navigation + forward navigation
  const upSteps = fromParts.length - commonLength;
  const downSteps = toParts.slice(commonLength);

  const relativeParts = Array(upSteps).fill("..").concat(downSteps);

  return relativeParts.length === 0 ? "." : relativeParts.join("/");
}

/**
 * Validate event names
 */
export function isValidEventName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9:._-]*$/.test(name);
}

/**
 * Timeout-Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Operation timed out",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    }),
  ]);
}
