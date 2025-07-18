/**
 * Stream-bezogene Typdefinitionen
 */

/**
 * Stream reader for output
 */
export type StreamReader = ReadableStreamDefaultReader<Uint8Array>;

/**
 * Stream writer for input
 */
export type StreamWriter = WritableStreamDefaultWriter<Uint8Array>;
