/**
 * Theme Manager Interface
 */

import { IEventEmitter } from "./IEventEmitter.interface.js";
import { ITheme } from "./ITheme.interface.js";

export interface IThemeManager extends IEventEmitter {
  getCurrentTheme(): ITheme;
  setTheme(name: string): Promise<void>;
  registerTheme(theme: ITheme): void;
  unregisterTheme(name: string): void;
  getAvailableThemes(): string[];

  // CSS-Integration
  injectCSS(): void;
  removeCSS(): void;

  // Token-Zugriff
  getToken(name: string): string | undefined;
  setToken(name: string, value: string): void;
}
