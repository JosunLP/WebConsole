// Einfacher Build-Test ohne Framework-spezifische Teile
import { WebConsoleElement } from "./components/WebConsoleElement.js";
import { Kernel } from "./core/Kernel.js";

// Core-Exports für grundlegende Funktionalität
export { Kernel, WebConsoleElement };

// Core-Klassen
export { CommandRegistry } from "./core/CommandRegistry.js";
export { ComponentRegistry } from "./core/ComponentRegistry.js";
export { StateManager } from "./core/StateManager.js";
export { ThemeManager } from "./core/ThemeManager.js";
export { VFS } from "./core/VFS.js";

// Console-Komponenten
export { ConsoleInstance } from "./console/ConsoleInstance.js";
export { Lexer } from "./console/Lexer.js";
export { Parser } from "./console/Parser.js";

// Base-Classes für Extension
export { BaseCommand } from "./console/BaseCommand.js";

// Themes
export * as Themes from "./themes/index.js";

// Types & Interfaces für API
export type * from "./enums/index.js";
export type * from "./interfaces/index.js";
export type * from "./types/index.js";

console.log("✅ WebConsole Core loaded successfully!");

// Auto-Register Web Component
if (typeof window !== "undefined" && !customElements.get("web-console")) {
  customElements.define("web-console", WebConsoleElement);
}
