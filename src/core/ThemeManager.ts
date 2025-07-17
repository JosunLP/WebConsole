/**
 * ThemeManager - Zentrale Theme-Verwaltung
 */

import { ThemeMode } from '../enums/ThemeMode.enum.js';
import type { ITheme } from '../interfaces/ITheme.interface.js';
import type { IThemeManager } from '../interfaces/IThemeManager.interface.js';
import type { ThemeTokens } from '../types/theme.type.js';
import { EventEmitter } from './EventEmitter.js';

export class ThemeManager extends EventEmitter implements IThemeManager {
  private themes = new Map<string, ITheme>();
  private currentTheme: ITheme;
  private cssElement: HTMLStyleElement | null = null;

  constructor() {
    super();

    // Lade Standard-Theme
    this.currentTheme = this.createDefaultTheme();
    this.registerTheme(this.currentTheme);

    // Registriere weitere Standard-Themes
    this.registerBuiltInThemes();
  }

  public getCurrentTheme(): ITheme {
    return this.currentTheme;
  }

  public async setTheme(name: string): Promise<void> {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Theme '${name}' not found`);
    }

    const oldTheme = this.currentTheme.name;
    this.currentTheme = theme;

    // CSS aktualisieren
    this.injectCSS();

    this.emit('theme-changed', { oldTheme, newTheme: name });
  }

  public registerTheme(theme: ITheme): void {
    this.themes.set(theme.name, theme);
    this.emit('theme-registered', { theme: theme.name });
  }

  public unregisterTheme(name: string): void {
    if (name === this.currentTheme.name) {
      throw new Error('Cannot unregister active theme');
    }

    this.themes.delete(name);
    this.emit('theme-unregistered', { theme: name });
  }

  public getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  public injectCSS(): void {
    // Entferne vorhandenes CSS
    this.removeCSS();

    // Erstelle neue Style-Element
    this.cssElement = document.createElement('style');
    this.cssElement.id = 'web-console-theme';

    const css = this.generateCSS();
    this.cssElement.textContent = css;

    document.head.appendChild(this.cssElement);
  }

  public removeCSS(): void {
    if (this.cssElement) {
      this.cssElement.remove();
      this.cssElement = null;
    }
  }

  public getToken(name: string): string | undefined {
    return this.currentTheme.tokens[name];
  }

  public setToken(name: string, value: string): void {
    // Temporäre Token-Überschreibung
    const newTokens = { ...this.currentTheme.tokens, [name]: value };
    this.currentTheme = { ...this.currentTheme, tokens: newTokens };
    this.injectCSS();
  }

  private generateCSS(): string {
    const tokens = this.currentTheme.tokens;
    const variables = Object.entries(tokens)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    const baseCSS = `
:root {
${variables}
}

web-console {
  --terminal-bg: var(--color-bg-primary);
  --terminal-color: var(--color-text-primary);
  --terminal-border: var(--color-border);
  --prompt-color: var(--color-accent);
  --command-color: var(--color-text-secondary);
  --error-color: var(--color-error);
  --success-color: var(--color-success);
  --warning-color: var(--color-warning);
}
`;

    return baseCSS + (this.currentTheme.css || '');
  }

  private createDefaultTheme(): ITheme {
    const tokens: ThemeTokens = {
      'color-bg-primary': '#1e1e1e',
      'color-bg-secondary': '#252526',
      'color-text-primary': '#cccccc',
      'color-text-secondary': '#9cdcfe',
      'color-accent': '#569cd6',
      'color-border': '#3e3e42',
      'color-error': '#f85149',
      'color-success': '#7ee787',
      'color-warning': '#f9c74f',
      'font-family': "'Consolas', 'Monaco', 'Courier New', monospace",
      'font-size': '14px',
      'line-height': '1.4',
      'border-radius': '4px',
      'spacing-sm': '4px',
      'spacing-md': '8px',
      'spacing-lg': '16px',
    };

    return {
      name: 'default',
      mode: ThemeMode.DARK,
      tokens,
    };
  }

  private async registerBuiltInThemes(): Promise<void> {
    try {
      // Dynamisches Laden der Theme-Module
      const { DefaultTheme } = await import('../themes/DefaultTheme.js');
      const { DarkTheme } = await import('../themes/DarkTheme.js');
      const { LightTheme } = await import('../themes/LightTheme.js');
      const { MonokaiTheme } = await import('../themes/MonokaiTheme.js');
      const { SolarizedDarkTheme } = await import(
        '../themes/SolarizedDarkTheme.js'
      );
      const { WindowsTerminalTheme } = await import(
        '../themes/WindowsTerminalTheme.js'
      );

      this.registerTheme(DefaultTheme);
      this.registerTheme(DarkTheme);
      this.registerTheme(LightTheme);
      this.registerTheme(MonokaiTheme);
      this.registerTheme(SolarizedDarkTheme);
      this.registerTheme(WindowsTerminalTheme);
    } catch (error) {
      console.warn('Failed to load some themes:', error);
      // Fallback: Registriere inline-definierte Themes
      this.registerLegacyThemes();
    }
  }

  private registerLegacyThemes(): void {
    // Windows Terminal Theme
    const windowsTerminal: ITheme = {
      name: 'windows-terminal',
      mode: ThemeMode.DARK,
      tokens: {
        'color-bg-primary': '#0c0c0c',
        'color-bg-secondary': '#1e1e1e',
        'color-text-primary': '#cccccc',
        'color-text-secondary': '#b5cea8',
        'color-accent': '#569cd6',
        'color-border': '#404040',
        'color-error': '#f14c4c',
        'color-success': '#6a9955',
        'color-warning': '#dcdcaa',
        'font-family': "'Cascadia Code', 'Consolas', monospace",
        'font-size': '14px',
        'line-height': '1.3',
        'border-radius': '0px',
        'spacing-sm': '4px',
        'spacing-md': '8px',
        'spacing-lg': '16px',
      },
    };

    // Monokai Theme
    const monokai: ITheme = {
      name: 'monokai',
      mode: ThemeMode.DARK,
      tokens: {
        'color-bg-primary': '#272822',
        'color-bg-secondary': '#3e3d32',
        'color-text-primary': '#f8f8f2',
        'color-text-secondary': '#a6e22e',
        'color-accent': '#f92672',
        'color-border': '#49483e',
        'color-error': '#f92672',
        'color-success': '#a6e22e',
        'color-warning': '#fd971f',
        'font-family': "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        'font-size': '14px',
        'line-height': '1.4',
        'border-radius': '6px',
        'spacing-sm': '4px',
        'spacing-md': '8px',
        'spacing-lg': '16px',
      },
    };

    // Solarized Dark Theme
    const solarizedDark: ITheme = {
      name: 'solarized-dark',
      mode: ThemeMode.DARK,
      tokens: {
        'color-bg-primary': '#002b36',
        'color-bg-secondary': '#073642',
        'color-text-primary': '#839496',
        'color-text-secondary': '#2aa198',
        'color-accent': '#268bd2',
        'color-border': '#586e75',
        'color-error': '#dc322f',
        'color-success': '#859900',
        'color-warning': '#b58900',
        'font-family': "'Source Code Pro', 'Menlo', monospace",
        'font-size': '14px',
        'line-height': '1.4',
        'border-radius': '4px',
        'spacing-sm': '4px',
        'spacing-md': '8px',
        'spacing-lg': '16px',
      },
    };

    // Light Theme
    const light: ITheme = {
      name: 'light',
      mode: ThemeMode.LIGHT,
      tokens: {
        'color-bg-primary': '#ffffff',
        'color-bg-secondary': '#f8f8f8',
        'color-text-primary': '#333333',
        'color-text-secondary': '#0066cc',
        'color-accent': '#0066cc',
        'color-border': '#e1e1e1',
        'color-error': '#d73a49',
        'color-success': '#28a745',
        'color-warning': '#ffc107',
        'font-family': "'Consolas', 'Monaco', 'Courier New', monospace",
        'font-size': '14px',
        'line-height': '1.4',
        'border-radius': '4px',
        'spacing-sm': '4px',
        'spacing-md': '8px',
        'spacing-lg': '16px',
      },
    };

    this.registerTheme(windowsTerminal);
    this.registerTheme(monokai);
    this.registerTheme(solarizedDark);
    this.registerTheme(light);
  }

  override dispose(): void {
    this.removeCSS();
    super.dispose();
  }
}
