/**
 * Dark Theme (Monokai-inspiriert)
 */

import { ThemeMode } from "../enums/index.js";
import type { ITheme } from "../interfaces/ITheme.interface.js";

export const DarkTheme: ITheme = {
  name: "dark",
  mode: ThemeMode.DARK,
  tokens: {
    // Colors
    "color-bg-primary": "#272822",
    "color-bg-secondary": "#383830",
    "color-text-primary": "#f8f8f2",
    "color-text-secondary": "#75715e",
    "color-accent": "#66d9ef",
    "color-border": "#49483e",
    "color-error": "#f92672",
    "color-success": "#a6e22e",
    "color-warning": "#e6db74",

    // Typography
    "font-family":
      "'Fira Code', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    "font-size": "14px",
    "line-height": "1.4",

    // Layout
    "border-radius": "6px",
    "spacing-sm": "4px",
    "spacing-md": "8px",
    "spacing-lg": "12px",

    // Console specific
    "console-cursor": "#f8f8f2",
    "console-selection": "#49483e",
    "console-prompt": "#66d9ef",
    "ansi-black": "#272822",
    "ansi-red": "#f92672",
    "ansi-green": "#a6e22e",
    "ansi-yellow": "#e6db74",
    "ansi-blue": "#66d9ef",
    "ansi-magenta": "#ae81ff",
    "ansi-cyan": "#a1efe4",
    "ansi-white": "#f8f8f2",
    "ansi-bright-black": "#75715e",
    "ansi-bright-red": "#f92672",
    "ansi-bright-green": "#a6e22e",
    "ansi-bright-yellow": "#e6db74",
    "ansi-bright-blue": "#66d9ef",
    "ansi-bright-magenta": "#ae81ff",
    "ansi-bright-cyan": "#a1efe4",
    "ansi-bright-white": "#f9f8f5",
  },
  variables: {
    "--wc-bg-primary": "#272822",
    "--wc-bg-secondary": "#383830",
    "--wc-text-primary": "#f8f8f2",
    "--wc-text-secondary": "#75715e",
    "--wc-accent": "#66d9ef",
    "--wc-border": "#49483e",
    "--wc-error": "#f92672",
    "--wc-success": "#a6e22e",
    "--wc-warning": "#e6db74",
    "--wc-font-family":
      "'Fira Code', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', monospace",
    "--wc-font-size": "14px",
    "--wc-line-height": "1.4",
    "--wc-border-radius": "6px",
    "--wc-spacing-sm": "4px",
    "--wc-spacing-md": "8px",
    "--wc-spacing-lg": "12px",
  },
};
