/**
 * React component for Web-Console with improved implementation
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { IConsole } from "../../interfaces/IConsole.interface.js";
import type { IConsoleOptions } from "../../interfaces/IConsoleOptions.interface.js";
import type { CommandResult } from "../../types/index.js";
import { generateMessageId } from "../../utils/helpers.js";
import "../styles/WebConsole.scss";
import { useCommandHistory, useConsole, useTheme } from "./hooks.js";

// CSS custom properties utility function
function setCSSVariables(
  element: HTMLElement | null,
  width: string | number,
  height: string | number,
) {
  if (element) {
    element.style.setProperty(
      "--web-console-width",
      typeof width === "number" ? `${width}px` : width,
    );
    element.style.setProperty(
      "--web-console-height",
      typeof height === "number" ? `${height}px` : height,
    );
  }
}

export interface WebConsoleProps {
  prompt?: string;
  width?: string | number;
  height?: string | number;
  theme?: string;
  onCommand?: (command: string, result: CommandResult) => void;
  onReady?: (console: IConsole) => void;
  className?: string;
  style?: React.CSSProperties;
  consoleOptions?: Partial<IConsoleOptions>;
}

interface OutputLine {
  id: string;
  text: string;
  type: "command" | "output" | "error" | "info";
  timestamp: Date;
}

export const WebConsole: React.FC<WebConsoleProps> = ({
  prompt = "$ ",
  width = "100%",
  height = 400,
  theme = "default",
  onCommand,
  onReady,
  className = "",
  style = {},
  consoleOptions = {},
}) => {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { console, isLoading, error, executeCommand } =
    useConsole(consoleOptions);
  const { setTheme: changeTheme, currentTheme } = useTheme();
  const { addCommand, getPreviousCommand, getNextCommand } =
    useCommandHistory();

  // Set CSS variables for dynamic sizing
  useEffect(() => {
    if (terminalRef.current) {
      setCSSVariables(terminalRef.current, width, height);
    }
  }, [width, height]);

  // Theme change
  useEffect(() => {
    if (theme && changeTheme) {
      changeTheme(theme);
    }
  }, [theme, changeTheme]);

  // Console Ready Event
  useEffect(() => {
    if (console && onReady) {
      onReady(console);
    }
  }, [console, onReady]);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const addOutputLine = useCallback(
    (text: string, type: OutputLine["type"]) => {
      const line: OutputLine = {
        id: `${Date.now()}-${generateMessageId()}`,
        text,
        type,
        timestamp: new Date(),
      };
      setOutput((prev) => [...prev, line]);
    },
    [],
  );

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && input.trim()) {
        const command = input.trim();
        addOutputLine(`${prompt}${command}`, "command");
        addCommand(command);

        try {
          const result = await executeCommand(command);

          if (result) {
            if (result.stdout.length > 0) {
              const outputText = new TextDecoder().decode(result.stdout);
              addOutputLine(outputText, "output");
            }

            if (result.stderr.length > 0) {
              const errorText = new TextDecoder().decode(result.stderr);
              addOutputLine(errorText, "error");
            }

            if (onCommand) {
              onCommand(command, result);
            }
          }
        } catch (err) {
          addOutputLine(`Error: ${err}`, "error");
        }

        setInput("");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevCommand = getPreviousCommand();
        if (prevCommand) {
          setInput(prevCommand);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextCommand = getNextCommand();
        if (nextCommand !== null) {
          setInput(nextCommand);
        }
      } else if (event.key === "Tab") {
        event.preventDefault();
        // TODO: Implement tab completion
      } else if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        setOutput([]);
      } else if (event.ctrlKey && event.key === "c") {
        event.preventDefault();
        addOutputLine("^C", "command");
        setInput("");
      }
    },
    [
      input,
      prompt,
      addOutputLine,
      addCommand,
      executeCommand,
      onCommand,
      getPreviousCommand,
      getNextCommand,
    ],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Style utilities mit Theme-Integration
  const getTerminalClassName = () => {
    const baseClass = "web-console";
    const themeClass = currentTheme?.name
      ? `web-console--${currentTheme.name}`
      : "web-console--dark";
    return `${baseClass} ${themeClass} ${className}`.trim();
  };

  const getLineClassName = (type: OutputLine["type"]) => {
    return `web-console__line web-console__line--${type}`;
  };

  // CSS Custom Properties for dynamic values
  const cssVariables = {
    "--web-console-height": typeof height === "number" ? `${height}px` : height,
    "--web-console-width": typeof width === "number" ? `${width}px` : width,
  } as React.CSSProperties;

  if (error) {
    return (
      <div className={getTerminalClassName()} ref={terminalRef}>
        <div className="web-console__error">
          Error initializing console: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={getTerminalClassName()} ref={terminalRef}>
        <div className="web-console__loading">Loading Web Console...</div>
      </div>
    );
  }

  return (
    <div
      className={getTerminalClassName()}
      ref={terminalRef}
      onClick={focusInput}
    >
      <div className="web-console__output" ref={outputRef}>
        {output.map((line) => (
          <div key={line.id} className={getLineClassName(line.type)}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="web-console__input-line">
        <span className="web-console__prompt">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          className="web-console__input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          disabled={!console}
          placeholder="Enter command..."
          aria-label="Command input"
        />
      </div>
    </div>
  );
};

export default WebConsole;
