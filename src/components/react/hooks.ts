/**
 * React Hooks for Web Console
 */

import { useCallback, useEffect, useState } from "react";
import { kernel } from "../../core/Kernel.js";
import type { IConsole } from "../../interfaces/IConsole.interface.js";
import type { IConsoleOptions } from "../../interfaces/IConsoleOptions.interface.js";
import type { ITheme } from "../../interfaces/ITheme.interface.js";
import type { IThemeManager } from "../../interfaces/IThemeManager.interface.js";
import type { IVFS } from "../../interfaces/IVFS.interface.js";
import type { CommandResult } from "../../types/index.js";

/**
 * Hook for console instance management
 */
export function useConsole(options: Partial<IConsoleOptions> = {}) {
  const [console, setConsole] = useState<IConsole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        if (!kernel.isStarted) {
          await kernel.start();
        }

        const consoleInstance = await kernel.createConsole(options);

        if (mounted) {
          setConsole(consoleInstance);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (console) {
        kernel.destroyConsole(console.id);
      }
    };
  }, []);

  const executeCommand = useCallback(
    async (command: string): Promise<CommandResult | null> => {
      if (!console) return null;

      try {
        return await console.execute(command);
      } catch (err) {
        setError(err as Error);
        return null;
      }
    },
    [console],
  );

  return {
    console,
    isLoading,
    error,
    executeCommand,
  };
}

/**
 * Hook für VFS-Zugriff
 */
export function useVFS() {
  const [vfs, setVFS] = useState<IVFS | null>(null);

  useEffect(() => {
    const initVFS = async () => {
      if (!kernel.isStarted) {
        await kernel.start();
      }
      setVFS(kernel.getVFS());
    };

    initVFS();
  }, []);

  const readFile = useCallback(
    async (path: string): Promise<Uint8Array | null> => {
      if (!vfs) return null;
      try {
        return await vfs.readFile(path);
      } catch {
        return null;
      }
    },
    [vfs],
  );

  const writeFile = useCallback(
    async (path: string, data: Uint8Array): Promise<boolean> => {
      if (!vfs) return false;
      try {
        await vfs.writeFile(path, data);
        return true;
      } catch {
        return false;
      }
    },
    [vfs],
  );

  const exists = useCallback(
    async (path: string): Promise<boolean> => {
      if (!vfs) return false;
      return vfs.exists(path);
    },
    [vfs],
  );

  const mkdir = useCallback(
    async (path: string): Promise<boolean> => {
      if (!vfs) return false;
      try {
        await vfs.createDir(path);
        return true;
      } catch {
        return false;
      }
    },
    [vfs],
  );

  const rm = useCallback(
    async (path: string): Promise<boolean> => {
      if (!vfs) return false;
      try {
        await vfs.deleteFile(path);
        return true;
      } catch {
        return false;
      }
    },
    [vfs],
  );

  return {
    vfs,
    readFile,
    writeFile,
    exists,
    mkdir,
    rm,
  };
}

/**
 * Hook für Theme-Management
 */
export function useTheme() {
  const [themeManager, setThemeManager] = useState<IThemeManager | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ITheme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);

  useEffect(() => {
    const initTheme = async () => {
      if (!kernel.isStarted) {
        await kernel.start();
      }

      const tm = kernel.getThemeManager();
      setThemeManager(tm);
      setCurrentTheme(tm.getCurrentTheme());
      setAvailableThemes(tm.getAvailableThemes());

      // Listen to theme changes
      const handleThemeChange = () => {
        setCurrentTheme(tm.getCurrentTheme());
        setAvailableThemes(tm.getAvailableThemes());
      };

      tm.on("theme-changed", handleThemeChange);
      tm.on("theme-registered", handleThemeChange);
      tm.on("theme-unregistered", handleThemeChange);

      return () => {
        tm.off("theme-changed", handleThemeChange);
        tm.off("theme-registered", handleThemeChange);
        tm.off("theme-unregistered", handleThemeChange);
      };
    };

    initTheme();
  }, []);

  const setTheme = useCallback(
    async (themeName: string): Promise<boolean> => {
      if (!themeManager) return false;
      try {
        await themeManager.setTheme(themeName);
        return true;
      } catch {
        return false;
      }
    },
    [themeManager],
  );

  const getToken = useCallback(
    (tokenName: string): string | undefined => {
      return themeManager?.getToken(tokenName);
    },
    [themeManager],
  );

  const setToken = useCallback(
    (tokenName: string, value: string): void => {
      themeManager?.setToken(tokenName, value);
    },
    [themeManager],
  );

  return {
    themeManager,
    currentTheme,
    availableThemes,
    setTheme,
    getToken,
    setToken,
  };
}

/**
 * Hook für Command History
 */
export function useCommandHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addCommand = useCallback(
    (command: string) => {
      if (command.trim() && history[history.length - 1] !== command) {
        setHistory((prev) => [...prev, command]);
      }
      setHistoryIndex(-1);
    },
    [history],
  );

  const getPreviousCommand = useCallback((): string => {
    if (history.length === 0) return "";

    const newIndex =
      historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
    setHistoryIndex(newIndex);
    return history[newIndex] || "";
  }, [history, historyIndex]);

  const getNextCommand = useCallback((): string => {
    if (history.length === 0 || historyIndex === -1) return "";

    const newIndex = Math.min(history.length - 1, historyIndex + 1);
    setHistoryIndex(newIndex);
    return history[newIndex] || "";
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    addCommand,
    getPreviousCommand,
    getNextCommand,
    clearHistory,
  };
}
