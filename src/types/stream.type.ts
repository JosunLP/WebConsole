/**
 * Stream-bezogene Typdefinitionen
 */

/**
 * Stream-Reader für Output
 */
export type StreamReader = ReadableStreamDefaultReader<Uint8Array>;

/**
 * Stream-Writer für Input
 */
export type StreamWriter = WritableStreamDefaultWriter<Uint8Array>;
