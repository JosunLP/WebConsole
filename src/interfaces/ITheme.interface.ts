/**
 * Theme Interface
 */

import { ThemeMode } from "../enums/index.js";
import { ThemeTokens } from "../types/index.js";

export interface ITheme {
  readonly name: string;
  readonly mode: ThemeMode;
  readonly tokens: ThemeTokens;
  readonly css?: string;
  readonly variables?: Record<string, string>;
}
