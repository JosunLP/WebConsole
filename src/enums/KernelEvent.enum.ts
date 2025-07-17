/**
 * Kernel Events
 */
export enum KernelEvent {
  /** Kernel gestartet */
  STARTED = 'kernel:started',
  /** Kernel wird heruntergefahren */
  SHUTDOWN = 'kernel:shutdown',
  /** Fehler im Kernel */
  ERROR = 'kernel:error',
  /** Console erstellt */
  CONSOLE_CREATED = 'kernel:console:created',
  /** Console zerstört */
  CONSOLE_DESTROYED = 'kernel:console:destroyed',
}
