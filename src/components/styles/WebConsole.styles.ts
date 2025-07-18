/**
 * Compiled CSS styles for React WebConsole
 * Generated from WebConsole.scss
 */

export const webConsoleStyles = `
.web-console {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  background-color: #1e1e1e;
  color: #cccccc;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px;
  box-sizing: border-box;
  height: var(--web-console-height, 400px);
  width: var(--web-console-width, 100%);
}

.web-console__output {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 8px;
}

.web-console__input-line {
  display: flex;
  align-items: center;
  border-top: 1px solid #3e3e42;
  padding-top: 8px;
}

.web-console__prompt {
  color: #569cd6;
  margin-right: 8px;
  font-weight: bold;
}

.web-console__input {
  flex: 1;
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  outline: none;
}

.web-console__line {
  margin: 2px 0;
}

.web-console__line--command {
  color: #9cdcfe;
}

.web-console__line--error {
  color: #f85149;
}

.web-console__line--output {
  color: #7ee787;
}

.web-console__line--info {
  color: #f9c74f;
}

.web-console__error,
.web-console__loading {
  padding: 8px;
  text-align: center;
}

.web-console__error {
  color: #f85149;
}

.web-console--dark {
  background-color: #1e1e1e;
  color: #cccccc;
}

.web-console--light {
  background-color: #ffffff;
  color: #333333;
  border-color: #d0d7de;
}

.web-console--light .web-console__input-line {
  border-top-color: #d0d7de;
}

.web-console--light .web-console__prompt {
  color: #0969da;
}

.web-console--light .web-console__line--command {
  color: #0969da;
}

.web-console--light .web-console__line--error {
  color: #d1242f;
}

.web-console--light .web-console__line--output {
  color: #1a7f37;
}

.web-console--light .web-console__line--info {
  color: #9a6700;
}
`;

// Style objects for theme integration (to support existing CSS-in-JS usage)
export const getWebConsoleThemeStyles = (theme?: {
  tokens?: Record<string, unknown>;
}) => {
  const tokens = theme?.tokens || {};

  return {
    terminal: {
      fontFamily:
        tokens["font-family"] ||
        "'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: tokens["font-size"] || "14px",
      lineHeight: tokens["line-height"] || "1.4",
      backgroundColor: tokens["color-bg-primary"] || "#1e1e1e",
      color: tokens["color-text-primary"] || "#cccccc",
      border: `1px solid ${tokens["color-border"] || "#3e3e42"}`,
      borderRadius: tokens["border-radius"] || "4px",
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      padding: tokens["spacing-md"] || "8px",
      boxSizing: "border-box" as const,
    },
    output: {
      flex: 1,
      overflowY: "auto" as const,
      whiteSpace: "pre-wrap" as const,
      wordBreak: "break-word" as const,
      marginBottom: tokens["spacing-md"] || "8px",
    },
    inputLine: {
      display: "flex",
      alignItems: "center",
      borderTop: `1px solid ${tokens["color-border"] || "#3e3e42"}`,
      paddingTop: tokens["spacing-md"] || "8px",
    },
    prompt: {
      color: tokens["color-accent"] || "#569cd6",
      marginRight: tokens["spacing-md"] || "8px",
      fontWeight: "bold",
    },
    input: {
      flex: 1,
      background: "transparent",
      border: "none",
      color: "inherit",
      font: "inherit",
      outline: "none",
    },
    line: {
      base: { margin: "2px 0" },
      command: { color: tokens["color-text-secondary"] || "#9cdcfe" },
      error: { color: tokens["color-error"] || "#f85149" },
      output: { color: tokens["color-success"] || "#7ee787" },
      info: { color: tokens["color-warning"] || "#f9c74f" },
    },
  };
};
