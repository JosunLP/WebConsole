/**
 * Light Theme (GitHub-inspired)
 */

import { ThemeMode } from "../enums/index.js";
import type { ITheme } from "../interfaces/ITheme.interface.js";

export const LightTheme: ITheme = {
  name: "light",
  mode: ThemeMode.LIGHT,
  tokens: {
    // Colors
    "color-bg-primary": "#ffffff",
    "color-bg-secondary": "#f6f8fa",
    "color-text-primary": "#24292e",
    "color-text-secondary": "#586069",
    "color-accent": "#0366d6",
    "color-border": "#e1e4e8",
    "color-error": "#d73a49",
    "color-success": "#28a745",
    "color-warning": "#ffd33d",

    // Typography
    "font-family":
      "'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    "font-size": "14px",
    "line-height": "1.4",

    // Layout
    "border-radius": "6px",
    "spacing-sm": "4px",
    "spacing-md": "8px",
    "spacing-lg": "12px",

    // Console specific
    "console-cursor": "#24292e",
    "console-selection": "#c8e1ff",
    "console-prompt": "#0366d6",
    "ansi-black": "#24292e",
    "ansi-red": "#d73a49",
    "ansi-green": "#28a745",
    "ansi-yellow": "#dbab09",
    "ansi-blue": "#0366d6",
    "ansi-magenta": "#5a32a3",
    "ansi-cyan": "#0598bc",
    "ansi-white": "#6a737d",
    "ansi-bright-black": "#959da5",
    "ansi-bright-red": "#cb2431",
    "ansi-bright-green": "#22863a",
    "ansi-bright-yellow": "#b08800",
    "ansi-bright-blue": "#005cc5",
    "ansi-bright-magenta": "#5a32a3",
    "ansi-bright-cyan": "#3192aa",
    "ansi-bright-white": "#24292e",
  },
  variables: {
    "--wc-bg-primary": "#ffffff",
    "--wc-bg-secondary": "#f6f8fa",
    "--wc-text-primary": "#24292e",
    "--wc-text-secondary": "#586069",
    "--wc-accent": "#0366d6",
    "--wc-border": "#e1e4e8",
    "--wc-error": "#d73a49",
    "--wc-success": "#28a745",
    "--wc-warning": "#ffd33d",
    "--wc-font-family":
      "'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    "--wc-font-size": "14px",
    "--wc-line-height": "1.4",
    "--wc-border-radius": "6px",
    "--wc-spacing-sm": "4px",
    "--wc-spacing-md": "8px",
    "--wc-spacing-lg": "12px",
  },
};
