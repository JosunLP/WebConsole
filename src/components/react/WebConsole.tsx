/**
 * React-Komponente für Web-Console mit verbesserter Implementation
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { IConsole } from '../../interfaces/IConsole.interface.js';
import type { IConsoleOptions } from '../../interfaces/IConsoleOptions.interface.js';
import type { CommandResult } from '../../types/index.js';
import { useCommandHistory, useConsole, useTheme } from './hooks.js';

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
  type: 'command' | 'output' | 'error' | 'info';
  timestamp: Date;
}

export const WebConsole: React.FC<WebConsoleProps> = ({
  prompt = '$ ',
  width = '100%',
  height = 400,
  theme = 'default',
  onCommand,
  onReady,
  className = '',
  style = {},
  consoleOptions = {},
}) => {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { console, isLoading, error, executeCommand } =
    useConsole(consoleOptions);
  const { setTheme: changeTheme, currentTheme } = useTheme();
  const { addCommand, getPreviousCommand, getNextCommand } =
    useCommandHistory();

  // Theme-Änderung
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
    (text: string, type: OutputLine['type']) => {
      const line: OutputLine = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        type,
        timestamp: new Date(),
      };
      setOutput((prev) => [...prev, line]);
    },
    []
  );

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && input.trim()) {
        const command = input.trim();
        addOutputLine(`${prompt}${command}`, 'command');
        addCommand(command);

        try {
          const result = await executeCommand(command);

          if (result) {
            if (result.stdout.length > 0) {
              const outputText = new TextDecoder().decode(result.stdout);
              addOutputLine(outputText, 'output');
            }

            if (result.stderr.length > 0) {
              const errorText = new TextDecoder().decode(result.stderr);
              addOutputLine(errorText, 'error');
            }

            if (onCommand) {
              onCommand(command, result);
            }
          }
        } catch (err) {
          addOutputLine(`Error: ${err}`, 'error');
        }

        setInput('');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevCommand = getPreviousCommand();
        if (prevCommand) {
          setInput(prevCommand);
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextCommand = getNextCommand();
        if (nextCommand !== null) {
          setInput(nextCommand);
        }
      } else if (event.key === 'Tab') {
        event.preventDefault();
        // TODO: Implement tab completion
      } else if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        setOutput([]);
      } else if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        addOutputLine('^C', 'command');
        setInput('');
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
    ]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // CSS-in-JS Styles mit Theme-Integration
  const getTerminalStyle = (): React.CSSProperties => ({
    fontFamily:
      currentTheme?.tokens['font-family'] ||
      "'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: currentTheme?.tokens['font-size'] || '14px',
    lineHeight: currentTheme?.tokens['line-height'] || '1.4',
    backgroundColor: currentTheme?.tokens['color-bg-primary'] || '#1e1e1e',
    color: currentTheme?.tokens['color-text-primary'] || '#cccccc',
    border: `1px solid ${currentTheme?.tokens['color-border'] || '#3e3e42'}`,
    borderRadius: currentTheme?.tokens['border-radius'] || '4px',
    display: 'flex',
    flexDirection: 'column',
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    overflow: 'hidden',
    padding: currentTheme?.tokens['spacing-md'] || '8px',
    boxSizing: 'border-box',
    ...style,
  });

  const getOutputStyle = (): React.CSSProperties => ({
    flex: 1,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginBottom: currentTheme?.tokens['spacing-md'] || '8px',
  });

  const getInputLineStyle = (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    borderTop: `1px solid ${currentTheme?.tokens['color-border'] || '#3e3e42'}`,
    paddingTop: currentTheme?.tokens['spacing-md'] || '8px',
  });

  const getPromptStyle = (): React.CSSProperties => ({
    color: currentTheme?.tokens['color-accent'] || '#569cd6',
    marginRight: currentTheme?.tokens['spacing-md'] || '8px',
    fontWeight: 'bold',
  });

  const getInputStyle = (): React.CSSProperties => ({
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',
  });

  const getLineStyle = (type: OutputLine['type']): React.CSSProperties => {
    const base: React.CSSProperties = {
      margin: '2px 0',
    };

    switch (type) {
      case 'command':
        return {
          ...base,
          color: currentTheme?.tokens['color-text-secondary'] || '#9cdcfe',
        };
      case 'error':
        return {
          ...base,
          color: currentTheme?.tokens['color-error'] || '#f85149',
        };
      case 'output':
        return {
          ...base,
          color: currentTheme?.tokens['color-success'] || '#7ee787',
        };
      case 'info':
        return {
          ...base,
          color: currentTheme?.tokens['color-warning'] || '#f9c74f',
        };
      default:
        return base;
    }
  };

  if (error) {
    return (
      <div style={getTerminalStyle()} className={className}>
        <div style={{ padding: '8px', textAlign: 'center', color: '#f85149' }}>
          Error initializing console: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={getTerminalStyle()} className={className}>
        <div style={{ padding: '8px', textAlign: 'center' }}>
          Loading Web Console...
        </div>
      </div>
    );
  }

  return (
    <div style={getTerminalStyle()} className={className} onClick={focusInput}>
      <div style={getOutputStyle()} ref={outputRef}>
        {output.map((line) => (
          <div key={line.id} style={getLineStyle(line.type)}>
            {line.text}
          </div>
        ))}
      </div>
      <div style={getInputLineStyle()}>
        <span style={getPromptStyle()}>{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          style={getInputStyle()}
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
