/**
 * Default Theme (Dark Theme basierend auf VS Code)
 */

import { ThemeMode } from "../enums/index.js";
import type { ITheme } from "../interfaces/ITheme.interface.js";

export const DefaultTheme: ITheme = {
  name: "default",
  mode: ThemeMode.DARK,
  tokens: {
    // Colors
    "color-bg-primary": "#1e1e1e",
    "color-bg-secondary": "#252526",
    "color-text-primary": "#d4d4d4",
    "color-text-secondary": "#969696",
    "color-accent": "#007acc",
    "color-border": "#3e3e3e",
    "color-error": "#cd3131",
    "color-success": "#0dbc79",
    "color-warning": "#e5e510",

    // Typography
    "font-family":
      "'Cascadia Code', 'Fira Code', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    "font-size": "14px",
    "line-height": "1.4",

    // Layout
    "border-radius": "4px",
    "spacing-sm": "4px",
    "spacing-md": "8px",
    "spacing-lg": "12px",

    // Console specific
    "console-cursor": "#d4d4d4",
    "console-selection": "#264f78",
    "console-prompt": "#569cd6",
    "ansi-black": "#000000",
    "ansi-red": "#cd3131",
    "ansi-green": "#0dbc79",
    "ansi-yellow": "#e5e510",
    "ansi-blue": "#2472c8",
    "ansi-magenta": "#bc3fbc",
    "ansi-cyan": "#11a8cd",
    "ansi-white": "#e5e5e5",
    "ansi-bright-black": "#666666",
    "ansi-bright-red": "#f14c4c",
    "ansi-bright-green": "#23d18b",
    "ansi-bright-yellow": "#f5f543",
    "ansi-bright-blue": "#3b8eea",
    "ansi-bright-magenta": "#d670d6",
    "ansi-bright-cyan": "#29b8db",
    "ansi-bright-white": "#ffffff",
  },
  variables: {
    "--wc-bg-primary": "#1e1e1e",
    "--wc-bg-secondary": "#252526",
    "--wc-text-primary": "#d4d4d4",
    "--wc-text-secondary": "#969696",
    "--wc-accent": "#007acc",
    "--wc-border": "#3e3e3e",
    "--wc-error": "#cd3131",
    "--wc-success": "#0dbc79",
    "--wc-warning": "#e5e510",
    "--wc-font-family":
      "'Cascadia Code', 'Fira Code', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    "--wc-font-size": "14px",
    "--wc-line-height": "1.4",
    "--wc-border-radius": "4px",
    "--wc-spacing-sm": "4px",
    "--wc-spacing-md": "8px",
    "--wc-spacing-lg": "12px",
  },
};
