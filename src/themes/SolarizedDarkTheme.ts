/**
 * Solarized Dark Theme
 */

import { ThemeMode } from "../enums/index.js";
import type { ITheme } from "../interfaces/ITheme.interface.js";

export const SolarizedDarkTheme: ITheme = {
  name: "solarized-dark",
  mode: ThemeMode.DARK,
  tokens: {
    // Colors
    "color-bg-primary": "#002b36",
    "color-bg-secondary": "#073642",
    "color-text-primary": "#839496",
    "color-text-secondary": "#586e75",
    "color-accent": "#268bd2",
    "color-border": "#073642",
    "color-error": "#dc322f",
    "color-success": "#859900",
    "color-warning": "#b58900",

    // Typography
    "font-family":
      "'Source Code Pro', 'Ubuntu Mono', 'Liberation Mono', monospace",
    "font-size": "14px",
    "line-height": "1.4",

    // Layout
    "border-radius": "4px",
    "spacing-sm": "4px",
    "spacing-md": "8px",
    "spacing-lg": "12px",

    // Console specific
    "console-cursor": "#839496",
    "console-selection": "#073642",
    "console-prompt": "#268bd2",
    "ansi-black": "#073642",
    "ansi-red": "#dc322f",
    "ansi-green": "#859900",
    "ansi-yellow": "#b58900",
    "ansi-blue": "#268bd2",
    "ansi-magenta": "#d33682",
    "ansi-cyan": "#2aa198",
    "ansi-white": "#eee8d5",
    "ansi-bright-black": "#002b36",
    "ansi-bright-red": "#cb4b16",
    "ansi-bright-green": "#586e75",
    "ansi-bright-yellow": "#657b83",
    "ansi-bright-blue": "#839496",
    "ansi-bright-magenta": "#6c71c4",
    "ansi-bright-cyan": "#93a1a1",
    "ansi-bright-white": "#fdf6e3",
  },
  variables: {
    "--wc-bg-primary": "#002b36",
    "--wc-bg-secondary": "#073642",
    "--wc-text-primary": "#839496",
    "--wc-text-secondary": "#586e75",
    "--wc-accent": "#268bd2",
    "--wc-border": "#073642",
    "--wc-error": "#dc322f",
    "--wc-success": "#859900",
    "--wc-warning": "#b58900",
    "--wc-font-family":
      "'Source Code Pro', 'Ubuntu Mono', 'Liberation Mono', monospace",
    "--wc-font-size": "14px",
    "--wc-line-height": "1.4",
    "--wc-border-radius": "4px",
    "--wc-spacing-sm": "4px",
    "--wc-spacing-md": "8px",
    "--wc-spacing-lg": "12px",
  },
};
