// Einfacher Build-Test ohne Framework-spezifische Teile
import { Kernel } from "./core/Kernel.js";

// Core-Exports für grundlegende Funktionalität
export { Kernel };

// Core-Klassen
export { CommandRegistry } from "./core/CommandRegistry.js";
export { ComponentRegistry } from "./core/ComponentRegistry.js";
export { StateManager } from "./core/StateManager.js";
export { VFS } from "./core/VFS.js";

// Console-Komponenten
export { ConsoleInstance } from "./console/ConsoleInstance.js";
export { Lexer } from "./console/Lexer.js";
export { Parser } from "./console/Parser.js";

// Base-Classes für Extension
export { BaseCommand } from "./console/BaseCommand.js";

// Lazy loading exports for modules that are also dynamically imported
export const loadWebConsoleElement = () =>
  import("./components/WebConsoleElement.js").then((m) => m.WebConsoleElement);
export const loadThemeManager = () =>
  import("./core/ThemeManager.js").then((m) => m.ThemeManager);

// Lazy loading für Themes
export const loadThemes = () => import("./themes/index.js");

// Types & Interfaces für API
export type * from "./enums/index.js";
export type * from "./interfaces/index.js";
export type * from "./types/index.js";

// Auto-Register Web Component
if (typeof window !== "undefined" && !customElements.get("web-console")) {
  loadWebConsoleElement().then((WebConsoleElement) => {
    customElements.define("web-console", WebConsoleElement);
  });
}
