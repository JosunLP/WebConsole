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
 * Error Handler for better error handling
 */
export class VFSErrorHandler {
  static handleError(error: unknown, operation: string, path?: string): never {
    // Handle VFSException instances first
    if (error instanceof VFSException) {
      throw error;
    }

    // Handle standard Error objects with type safety
    if (error instanceof Error) {
      console.error(`VFS Error during ${operation}:`, error.message);

      // Map specific error types to appropriate VFS errors
      switch (error.name) {
        case "TypeError":
          throw new VFSException(
            VfsError.INVALID_PATH,
            `Type error during ${operation}${path ? ` on ${path}` : ""}: ${error.message}`,
            path,
          );

        case "ReferenceError":
          throw new VFSException(
            VfsError.NOT_FOUND,
            `Reference error during ${operation}${path ? ` on ${path}` : ""}: ${error.message}`,
            path,
          );

        case "RangeError":
          throw new VFSException(
            VfsError.NO_SPACE,
            `Range error during ${operation}${path ? ` on ${path}` : ""}: ${error.message}`,
            path,
          );

        default:
          // Default error handling for other Error types
          throw new VFSException(
            VfsError.INVALID_PATH,
            `Operation ${operation} failed${path ? ` on ${path}` : ""}: ${error.message}`,
            path,
          );
      }
    }

    // Handle string errors
    if (typeof error === "string") {
      console.error(`VFS Error during ${operation}:`, error);
      throw new VFSException(
        VfsError.INVALID_PATH,
        `Operation ${operation} failed${path ? ` on ${path}` : ""}: ${error}`,
        path,
      );
    }

    // Handle objects with message property (Error-like objects)
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      const errorMessage = (error as { message: string }).message;
      console.error(`VFS Error during ${operation}:`, errorMessage);
      throw new VFSException(
        VfsError.INVALID_PATH,
        `Operation ${operation} failed${path ? ` on ${path}` : ""}: ${errorMessage}`,
        path,
      );
    }

    // Handle objects with toString method
    if (error && typeof error === "object" && "toString" in error) {
      const errorMessage = String(error);
      console.error(`VFS Error during ${operation}:`, errorMessage);
      throw new VFSException(
        VfsError.INVALID_PATH,
        `Operation ${operation} failed${path ? ` on ${path}` : ""}: ${errorMessage}`,
        path,
      );
    }

    // Fallback for any other unknown types
    console.error(`VFS Error during ${operation}:`, "Unknown error occurred");
    throw new VFSException(
      VfsError.INVALID_PATH,
      `Operation ${operation} failed${path ? ` on ${path}` : ""}: Unknown error occurred`,
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
