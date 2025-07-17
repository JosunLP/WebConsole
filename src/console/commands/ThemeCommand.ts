/**
 * theme - Change console theme
 */

import { ConsoleEvent, ExitCode, ThemeMode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class ThemeCommand extends BaseCommand {
  private static readonly AVAILABLE_THEMES = [
    "default",
    "dark",
    "light",
    "windows-terminal",
    "monokai",
    "solarized-dark",
    "matrix",
    "dracula",
    "nord",
    "github",
    "catppuccin",
    "tokyo-night",
  ];

  constructor() {
    super("theme", "Change console theme", "theme [THEME_NAME] | list | reset");
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { positional } = this.parseArgs(context);

    // No arguments - show current theme
    if (positional.length === 0) {
      await this.showCurrentTheme(context);
      return ExitCode.SUCCESS;
    }

    const action = positional[0];

    switch (action) {
      case "list":
        await this.listAvailableThemes(context);
        return ExitCode.SUCCESS;

      case "reset":
        await this.resetTheme(context);
        return ExitCode.SUCCESS;

      default:
        // Try to set the theme
        if (action) {
          return await this.setTheme(context, action);
        } else {
          await this.writeToStderr(context, "theme: invalid argument\n");
          return ExitCode.FAILURE;
        }
    }
  }

  private async showCurrentTheme(context: CommandContext): Promise<void> {
    // Try to get current theme from state
    const currentTheme = this.getCurrentTheme(context);
    const mode = this.getCurrentThemeMode(context);

    await this.writeToStdout(
      context,
      `Current theme: ${this.colorize(currentTheme, "cyan")}\n`,
    );
    await this.writeToStdout(
      context,
      `Theme mode: ${this.colorize(mode, "yellow")}\n`,
    );

    // Show theme preview
    await this.showThemePreview(context);
  }

  private async listAvailableThemes(context: CommandContext): Promise<void> {
    await this.writeToStdout(context, "Available themes:\n\n");

    const currentTheme = this.getCurrentTheme(context);

    for (const theme of ThemeCommand.AVAILABLE_THEMES) {
      const indicator =
        theme === currentTheme ? this.colorize("●", "green") : " ";
      const themeName =
        theme === currentTheme ? this.colorize(theme, "green") : theme;

      await this.writeToStdout(context, `  ${indicator} ${themeName}\n`);
    }

    await this.writeToStdout(context, "\nUsage: theme <theme-name>\n");
  }

  private async setTheme(
    context: CommandContext,
    themeName: string,
  ): Promise<ExitCode> {
    // Validate theme name
    if (!ThemeCommand.AVAILABLE_THEMES.includes(themeName)) {
      await this.writeToStderr(
        context,
        `theme: '${themeName}' is not a valid theme name\n` +
          `Available themes: ${ThemeCommand.AVAILABLE_THEMES.join(", ")}\n`,
      );
      return ExitCode.FAILURE;
    }

    try {
      // Set theme in state manager
      await this.applyTheme(context, themeName);

      await this.writeToStdout(
        context,
        `Theme changed to ${this.colorize(themeName, "green")}\n`,
      );

      // Emit theme change event
      this.emitThemeChangeEvent(context, themeName);

      return ExitCode.SUCCESS;
    } catch (error: any) {
      await this.writeToStderr(
        context,
        `theme: failed to set theme '${themeName}': ${error.message}\n`,
      );
      return ExitCode.FAILURE;
    }
  }

  private async resetTheme(context: CommandContext): Promise<ExitCode> {
    try {
      const defaultTheme = "default";
      await this.applyTheme(context, defaultTheme);

      await this.writeToStdout(
        context,
        `Theme reset to ${this.colorize(defaultTheme, "green")}\n`,
      );

      this.emitThemeChangeEvent(context, defaultTheme);

      return ExitCode.SUCCESS;
    } catch (error: any) {
      await this.writeToStderr(
        context,
        `theme: failed to reset theme: ${error.message}\n`,
      );
      return ExitCode.FAILURE;
    }
  }

  private async showThemePreview(context: CommandContext): Promise<void> {
    await this.writeToStdout(context, "\nTheme preview:\n");

    // Show color palette
    const colors = [
      { name: "black", ansi: "30" },
      { name: "red", ansi: "31" },
      { name: "green", ansi: "32" },
      { name: "yellow", ansi: "33" },
      { name: "blue", ansi: "34" },
      { name: "magenta", ansi: "35" },
      { name: "cyan", ansi: "36" },
      { name: "white", ansi: "37" },
    ];

    for (const color of colors) {
      const coloredText = `\x1b[${color.ansi}m${color.name}\x1b[0m`;
      const brightColoredText = `\x1b[1;${color.ansi}m${color.name}\x1b[0m`;
      await this.writeToStdout(
        context,
        `  ${coloredText.padEnd(20)} ${brightColoredText}\n`,
      );
    }

    await this.writeToStdout(context, "\n");
  }

  private getCurrentTheme(context: CommandContext): string {
    try {
      // Try to get from state manager
      if (context.state && typeof context.state.get === "function") {
        return context.state.get("console.theme", "default");
      }
      return "default";
    } catch {
      return "default";
    }
  }

  private getCurrentThemeMode(context: CommandContext): string {
    try {
      // Try to get from state manager
      if (context.state && typeof context.state.get === "function") {
        return context.state.get("console.themeMode", ThemeMode.AUTO);
      }
      return ThemeMode.AUTO;
    } catch {
      return ThemeMode.AUTO;
    }
  }

  private async applyTheme(
    context: CommandContext,
    themeName: string,
  ): Promise<void> {
    // Set theme in state manager
    if (context.state && typeof context.state.set === "function") {
      context.state.set("console.theme", themeName);
    }

    // Apply theme CSS variables
    await this.applyThemeStyles(themeName);
  }

  private async applyThemeStyles(themeName: string): Promise<void> {
    // Theme definitions (simplified)
    const themes = {
      default: {
        "--console-bg": "#000000",
        "--console-fg": "#ffffff",
        "--console-prompt": "#00ff00",
        "--console-error": "#ff0000",
        "--console-warning": "#ffff00",
      },
      dark: {
        "--console-bg": "#1e1e1e",
        "--console-fg": "#d4d4d4",
        "--console-prompt": "#4ec9b0",
        "--console-error": "#f44747",
        "--console-warning": "#ffcc02",
      },
      light: {
        "--console-bg": "#ffffff",
        "--console-fg": "#000000",
        "--console-prompt": "#008000",
        "--console-error": "#cd3131",
        "--console-warning": "#bf8803",
      },
      matrix: {
        "--console-bg": "#000000",
        "--console-fg": "#00ff00",
        "--console-prompt": "#00ff00",
        "--console-error": "#ff0000",
        "--console-warning": "#ffff00",
      },
      "solarized-dark": {
        "--console-bg": "#002b36",
        "--console-fg": "#839496",
        "--console-prompt": "#2aa198",
        "--console-error": "#dc322f",
        "--console-warning": "#b58900",
      },
      "solarized-light": {
        "--console-bg": "#fdf6e3",
        "--console-fg": "#657b83",
        "--console-prompt": "#2aa198",
        "--console-error": "#dc322f",
        "--console-warning": "#b58900",
      },
    };

    const themeVars =
      themes[themeName as keyof typeof themes] || themes.default;

    // Apply CSS custom properties
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      Object.entries(themeVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }

  private emitThemeChangeEvent(
    context: CommandContext,
    themeName: string,
  ): void {
    // Emit theme change event if possible
    try {
      if (context.state && typeof context.state.emit === "function") {
        context.state.emit(ConsoleEvent.THEME_CHANGED, {
          theme: themeName,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Ignore if we can't emit events
    }
  }

  /**
   * Get list of available themes
   */
  static getAvailableThemes(): string[] {
    return [...ThemeCommand.AVAILABLE_THEMES];
  }

  /**
   * Check if a theme name is valid
   */
  static isValidTheme(themeName: string): boolean {
    return ThemeCommand.AVAILABLE_THEMES.includes(themeName);
  }

  /**
   * Utility method to apply a theme programmatically
   */
  static async applyTheme(
    context: CommandContext,
    themeName: string,
  ): Promise<boolean> {
    if (!ThemeCommand.isValidTheme(themeName)) {
      return false;
    }

    const command = new ThemeCommand();
    try {
      await command.applyTheme(context, themeName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get theme color variables for a specific theme
   */
  static getThemeColors(themeName: string): Record<string, string> {
    const themes = {
      default: {
        bg: "#000000",
        fg: "#ffffff",
        prompt: "#00ff00",
        error: "#ff0000",
        warning: "#ffff00",
      },
      dark: {
        bg: "#1e1e1e",
        fg: "#d4d4d4",
        prompt: "#4ec9b0",
        error: "#f44747",
        warning: "#ffcc02",
      },
      light: {
        bg: "#ffffff",
        fg: "#000000",
        prompt: "#008000",
        error: "#cd3131",
        warning: "#bf8803",
      },
    };

    return themes[themeName as keyof typeof themes] || themes.default;
  }
}
