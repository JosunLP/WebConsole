/**
 * Hauptexport für die Web-Console-Bibliothek
 */

// Core-Exports
export * from './core/index.js';
export * from './enums/index.js';
export * from './interfaces/index.js';
export * from './types/index.js';

// Utils
export * from './utils/index.js';

// Console
export * from './console/index.js';

// Components (Native Web Components)
export * from './components/index.js';

// Kernel Singleton für einfachen Zugriff
export { kernel } from './core/Kernel.js';
