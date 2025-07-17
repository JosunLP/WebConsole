/**
 * Console-Erstellungsoptionen
 */

import { Environment, ID, Path } from '../types/index.js';

export interface IConsoleOptions {
  readonly id: ID;
  readonly workingDirectory?: Path;
  readonly cwd?: Path;
  readonly environment?: Environment;
  readonly env?: Map<string, string>;
  readonly prompt?: string;
  readonly maxHistorySize?: number;
  readonly enablePersistence?: boolean;
  readonly history?: {
    maxSize: number;
    persistent: boolean;
  };
}
