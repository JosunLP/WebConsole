/**
 * VFS Error Handling Utilities
 */

import { VfsError } from "../enums/index.js";

export class VFSException extends Error {
  constructor(
    public readonly code: VfsError,
    message: string,
    public readonly path?: string,
    public readonly errno?: number,
  ) {
    super(message);
    this.name = "VFSException";
  }

  static notFound(path: string): VFSException {
    return new VFSException(
      VfsError.NOT_FOUND,
      `No such file or directory: ${path}`,
      path,
      -2,
    );
  }

  static accessDenied(path: string): VFSException {
    return new VFSException(
      VfsError.ACCESS_DENIED,
      `Permission denied: ${path}`,
      path,
      -13,
    );
  }

  static isDirectory(path: string): VFSException {
    return new VFSException(
      VfsError.IS_DIRECTORY,
      `Is a directory: ${path}`,
      path,
      -21,
    );
  }

  static notAFile(path: string): VFSException {
    return new VFSException(
      VfsError.NOT_A_FILE,
      `Not a file: ${path}`,
      path,
      -20,
    );
  }

  static fileExists(path: string): VFSException {
    return new VFSException(
      VfsError.FILE_EXISTS,
      `File exists: ${path}`,
      path,
      -17,
    );
  }

  static notEmpty(path: string): VFSException {
    return new VFSException(
      VfsError.NOT_EMPTY,
      `Directory not empty: ${path}`,
      path,
      -39,
    );
  }

  static invalidPath(path: string): VFSException {
    return new VFSException(
      VfsError.INVALID_PATH,
      `Invalid path: ${path}`,
      path,
      -22,
    );
  }

  static noSpace(): VFSException {
    return new VFSException(
      VfsError.NO_SPACE,
      "No space left on device",
      undefined,
      -28,
    );
  }
}

/**
 * Error Handler für bessere Fehlerbehandlung
 */
export class VFSErrorHandler {
  static handleError(error: unknown, operation: string, path?: string): never {
    if (error instanceof VFSException) {
      throw error;
    }

    console.error(`VFS Error during ${operation}:`, error);

    if (path) {
      throw VFSException.notFound(path);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new VFSException(
      VfsError.INVALID_PATH,
      `Unknown error during ${operation}: ${errorMessage}`,
      path,
    );
  }

  static wrapAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    operation: string,
  ) {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        const path = args.find((arg) => typeof arg === "string");
        VFSErrorHandler.handleError(error, operation, path);
      }
    };
  }
}
