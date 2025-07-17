/**
 * Theme System Exports - Lazy Loading
 */

// Lazy loading exports for themes that are also dynamically imported
export const loadDarkTheme = () =>
  import("./DarkTheme.js").then((m) => m.DarkTheme);
export const loadDefaultTheme = () =>
  import("./DefaultTheme.js").then((m) => m.DefaultTheme);
export const loadLightTheme = () =>
  import("./LightTheme.js").then((m) => m.LightTheme);
export const loadMonokaiTheme = () =>
  import("./MonokaiTheme.js").then((m) => m.MonokaiTheme);
export const loadSolarizedDarkTheme = () =>
  import("./SolarizedDarkTheme.js").then((m) => m.SolarizedDarkTheme);
export const loadWindowsTerminalTheme = () =>
  import("./WindowsTerminalTheme.js").then((m) => m.WindowsTerminalTheme);

export type { ITheme } from "../interfaces/ITheme.interface.js";
