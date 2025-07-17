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
