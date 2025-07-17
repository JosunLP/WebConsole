/**
 * Compiled CSS styles for WebConsoleElement
 * Generated from WebConsoleElement.scss
 */

export const webConsoleElementStyles = `
:host {
  display: block;
  width: 100%;
  height: 400px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: #1e1e1e;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 4px;
  overflow: hidden;
}

.terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.output {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.input-line {
  display: flex;
  align-items: center;
  border-top: 1px solid #444;
  padding-top: 8px;
}

.prompt {
  color: #569cd6;
  margin-right: 8px;
  font-weight: bold;
}

.input {
  flex: 1;
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  outline: none;
}

.line {
  margin: 2px 0;
}

.line.command {
  color: #9cdcfe;
}

.line.error {
  color: #f85149;
}

.line.success {
  color: #7ee787;
}
`;
