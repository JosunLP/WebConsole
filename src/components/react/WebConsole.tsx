/**
 * React-Komponente für Web-Console
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { kernel } from '../../core/Kernel.js';
import type { IConsole } from '../../interfaces/IConsole.interface.js';
import type { IConsoleOptions } from '../../interfaces/IConsoleOptions.interface.js';
import type { CommandResult } from '../../types/index.js';

export interface WebConsoleProps {
  prompt?: string;
  width?: string | number;
  height?: string | number;
  theme?: string;
  onCommand?: (command: string, result: CommandResult) => void;
  onReady?: (console: IConsole) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface OutputLine {
  id: string;
  text: string;
  type: 'command' | 'output' | 'error';
  timestamp: Date;
}

export const WebConsole: React.FC<WebConsoleProps> = ({
  prompt = '$ ',
  width = '100%',
  height = 400,
  theme = 'dark',
  onCommand,
  onReady,
  className = '',
  style = {},
}) => {
  const [console, setConsole] = useState<IConsole | null>(null);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialisierung
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Starte Kernel falls noch nicht gestartet
        if (!kernel.isStarted) {
          await kernel.start();
        }

        // Erstelle Console-Instanz
        const options: Partial<IConsoleOptions> = {
          prompt,
          cwd: '/home/user',
          env: new Map([
            ['PATH', '/usr/bin:/bin'],
            ['HOME', '/home/user'],
            ['USER', 'user'],
          ]),
        };

        const consoleInstance = await kernel.createConsole(options);

        if (mounted) {
          setConsole(consoleInstance);
          setIsLoading(false);

          // Willkommensnachricht
          addOutputLine('Welcome to Web Console!', 'output');
          addOutputLine('Type "help" for available commands.', 'output');

          if (onReady) {
            onReady(consoleInstance);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Web Console:', error);
        if (mounted) {
          addOutputLine(`Initialization failed: ${error}`, 'error');
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (console) {
        console.destroy();
      }
    };
  }, [prompt, onReady]);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

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
      if (event.key === 'Enter' && console && input.trim()) {
        const command = input.trim();
        addOutputLine(`${prompt}${command}`, 'command');

        try {
          const result = await console.execute(command);

          if (result.stdout.length > 0) {
            const output = new TextDecoder().decode(result.stdout);
            addOutputLine(output, 'output');
          }

          if (result.stderr.length > 0) {
            const error = new TextDecoder().decode(result.stderr);
            addOutputLine(error, 'error');
          }

          if (onCommand) {
            onCommand(command, result);
          }
        } catch (error) {
          addOutputLine(`Error: ${error}`, 'error');
        }

        setInput('');
      }
    },
    [console, input, prompt, addOutputLine, onCommand]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    []
  );

  // Fokus auf Input
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const terminalStyle: React.CSSProperties = {
    width,
    height,
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    border: '1px solid #444',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const outputStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: 1.4,
    padding: '8px',
    margin: 0,
  };

  const inputLineStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #444',
    padding: '8px',
    gap: '8px',
  };

  const promptStyle: React.CSSProperties = {
    color: theme === 'dark' ? '#569cd6' : '#0066cc',
    fontWeight: 'bold',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',
  };

  const getLineStyle = (type: OutputLine['type']): React.CSSProperties => {
    const base: React.CSSProperties = {
      margin: '2px 0',
    };

    switch (type) {
      case 'command':
        return { ...base, color: theme === 'dark' ? '#9cdcfe' : '#0066cc' };
      case 'error':
        return { ...base, color: theme === 'dark' ? '#f85149' : '#d73a49' };
      case 'output':
        return { ...base, color: theme === 'dark' ? '#7ee787' : '#28a745' };
      default:
        return base;
    }
  };

  if (isLoading) {
    return (
      <div style={terminalStyle} className={className}>
        <div style={{ padding: '8px', textAlign: 'center' }}>
          Loading Web Console...
        </div>
      </div>
    );
  }

  return (
    <div style={terminalStyle} className={className} onClick={focusInput}>
      <div style={outputStyle} ref={outputRef}>
        {output.map((line) => (
          <div key={line.id} style={getLineStyle(line.type)}>
            {line.text}
          </div>
        ))}
      </div>
      <div style={inputLineStyle}>
        <span style={promptStyle}>{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          style={inputStyle}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          disabled={!console}
        />
      </div>
    </div>
  );
};

export default WebConsole;
