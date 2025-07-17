/**
 * Console-Erstellungsoptionen
 */

import {
    Environment,
    Path
} from '../types/index.js';

export interface IConsoleOptions {
  readonly workingDirectory: Path;
  readonly environment: Environment;
  readonly prompt: string;
  readonly maxHistorySize: number;
  readonly enablePersistence: boolean;
}
