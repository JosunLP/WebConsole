/**
 * Monokai Theme (Sublime Text Classic)
 */

import { ThemeMode } from "../enums/index.js";
import type { ITheme } from "../interfaces/ITheme.interface.js";

export const MonokaiTheme: ITheme = {
  name: "monokai",
  mode: ThemeMode.DARK,
  tokens: {
    // Colors
    "color-bg-primary": "#272822",
    "color-bg-secondary": "#3e3d32",
    "color-text-primary": "#f8f8f2",
    "color-text-secondary": "#75715e",
    "color-accent": "#fd971f",
    "color-border": "#49483e",
    "color-error": "#f92672",
    "color-success": "#a6e22e",
    "color-warning": "#e6db74",

    // Typography
    "font-family": "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    "font-size": "14px",
    "line-height": "1.4",

    // Layout
    "border-radius": "4px",
    "spacing-sm": "4px",
    "spacing-md": "8px",
    "spacing-lg": "12px",

    // Console specific
    "console-cursor": "#f8f8f2",
    "console-selection": "#49483e",
    "console-prompt": "#fd971f",
    "ansi-black": "#272822",
    "ansi-red": "#f92672",
    "ansi-green": "#a6e22e",
    "ansi-yellow": "#f4bf75",
    "ansi-blue": "#66d9ef",
    "ansi-magenta": "#ae81ff",
    "ansi-cyan": "#a1efe4",
    "ansi-white": "#f8f8f2",
    "ansi-bright-black": "#75715e",
    "ansi-bright-red": "#f92672",
    "ansi-bright-green": "#a6e22e",
    "ansi-bright-yellow": "#f4bf75",
    "ansi-bright-blue": "#66d9ef",
    "ansi-bright-magenta": "#ae81ff",
    "ansi-bright-cyan": "#a1efe4",
    "ansi-bright-white": "#f9f8f5",
  },
  variables: {
    "--wc-bg-primary": "#272822",
    "--wc-bg-secondary": "#3e3d32",
    "--wc-text-primary": "#f8f8f2",
    "--wc-text-secondary": "#75715e",
    "--wc-accent": "#fd971f",
    "--wc-border": "#49483e",
    "--wc-error": "#f92672",
    "--wc-success": "#a6e22e",
    "--wc-warning": "#e6db74",
    "--wc-font-family": "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    "--wc-font-size": "14px",
    "--wc-line-height": "1.4",
    "--wc-border-radius": "4px",
    "--wc-spacing-sm": "4px",
    "--wc-spacing-md": "8px",
    "--wc-spacing-lg": "12px",
  },
};
