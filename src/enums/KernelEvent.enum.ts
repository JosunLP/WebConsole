/**
 * Kernel Events
 */
export enum KernelEvent {
  /** Kernel gestartet */
  STARTED = "kernel:started",
  /** Kernel is shutting down */
  SHUTDOWN = "kernel:shutdown",
  /** Kernel error */
  ERROR = "kernel:error",
  /** Console created */
  CONSOLE_CREATED = "kernel:console:created",
  /** Console destroyed */
  CONSOLE_DESTROYED = "kernel:console:destroyed",
}
