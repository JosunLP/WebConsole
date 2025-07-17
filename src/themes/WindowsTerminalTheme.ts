/**
 * Windows Terminal Theme
 */

import { ThemeMode } from "../enums/index.js";
import type { ITheme } from "../interfaces/ITheme.interface.js";

export const WindowsTerminalTheme: ITheme = {
  name: "windows-terminal",
  mode: ThemeMode.DARK,
  tokens: {
    // Colors
    "color-bg-primary": "#0c0c0c",
    "color-bg-secondary": "#1e1e1e",
    "color-text-primary": "#cccccc",
    "color-text-secondary": "#767676",
    "color-accent": "#0078d4",
    "color-border": "#333333",
    "color-error": "#f85149",
    "color-success": "#3fb950",
    "color-warning": "#d29922",

    // Typography
    "font-family": "'Cascadia Code', 'Consolas', 'Courier New', monospace",
    "font-size": "14px",
    "line-height": "1.4",

    // Layout
    "border-radius": "4px",
    "spacing-sm": "4px",
    "spacing-md": "8px",
    "spacing-lg": "12px",

    // Console specific
    "console-cursor": "#cccccc",
    "console-selection": "#264f78",
    "console-prompt": "#0078d4",
    "ansi-black": "#0c0c0c",
    "ansi-red": "#c50f1f",
    "ansi-green": "#13a10e",
    "ansi-yellow": "#c19c00",
    "ansi-blue": "#0037da",
    "ansi-magenta": "#881798",
    "ansi-cyan": "#3a96dd",
    "ansi-white": "#cccccc",
    "ansi-bright-black": "#767676",
    "ansi-bright-red": "#e74856",
    "ansi-bright-green": "#16c60c",
    "ansi-bright-yellow": "#f9f1a5",
    "ansi-bright-blue": "#3b78ff",
    "ansi-bright-magenta": "#b4009e",
    "ansi-bright-cyan": "#61d6d6",
    "ansi-bright-white": "#f2f2f2",

    // Special elements
    "scrollbar-track": "#1e1e1e",
    "scrollbar-thumb": "#3c3c3c",
    "selection-bg": "#264f78",
    "highlight-bg": "#3c3c3c",
  },
  variables: {
    "--wc-bg-primary": "#0c0c0c",
    "--wc-bg-secondary": "#1e1e1e",
    "--wc-text-primary": "#cccccc",
    "--wc-text-secondary": "#767676",
    "--wc-accent": "#0078d4",
    "--wc-border": "#333333",
    "--wc-error": "#f85149",
    "--wc-success": "#3fb950",
    "--wc-warning": "#d29922",
    "--wc-font-family": "'Cascadia Code', 'Consolas', 'Courier New', monospace",
    "--wc-font-size": "14px",
    "--wc-line-height": "1.4",
    "--wc-border-radius": "4px",
    "--wc-spacing-sm": "4px",
    "--wc-spacing-md": "8px",
    "--wc-spacing-lg": "12px",
  },
};
