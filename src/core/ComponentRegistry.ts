/**
 * Component Registry - Verwaltung von Framework-Komponenten
 */

import type { IComponentRegistry } from "../interfaces/IComponentRegistry.interface.js";
import { EventEmitter } from "./EventEmitter.js";

export const ComponentRegistryEvents = {
  COMPONENT_REGISTERED: "component:registered",
  COMPONENT_LOADED: "component:loaded",
  COMPONENT_UNREGISTERED: "component:unregistered",
} as const;

export class ComponentRegistry
  extends EventEmitter
  implements IComponentRegistry
{
  private components = new Map<string, () => Promise<unknown>>();
  private loaded = new Map<string, unknown>();
  private initializing = new Map<string, Promise<unknown>>();

  public register(name: string, loader: () => Promise<unknown>): void {
    this.components.set(name, loader);
    this.emit(ComponentRegistryEvents.COMPONENT_REGISTERED, { name });
  }

  public async load(name: string): Promise<unknown> {
    // Bereits geladen?
    if (this.loaded.has(name)) {
      return this.loaded.get(name)!;
    }

    // Bereits am Laden?
    if (this.initializing.has(name)) {
      return this.initializing.get(name)!;
    }

    // Loader vorhanden?
    const loader = this.components.get(name);
    if (!loader) {
      throw new Error(`Component '${name}' not registered`);
    }

    try {
      const loadPromise = loader();
      this.initializing.set(name, loadPromise);

      const component = await loadPromise;
      this.loaded.set(name, component);
      this.initializing.delete(name);

      this.emit(ComponentRegistryEvents.COMPONENT_LOADED, { name, component });
      return component;
    } catch (error) {
      this.initializing.delete(name);
      throw new Error(`Failed to load component '${name}': ${error}`);
    }
  }

  public unregister(name: string): void {
    this.components.delete(name);
    this.loaded.delete(name);
    this.initializing.delete(name);
    this.emit(ComponentRegistryEvents.COMPONENT_UNREGISTERED, { name });
  }

  public isRegistered(name: string): boolean {
    return this.components.has(name);
  }

  public isLoaded(name: string): boolean {
    return this.loaded.has(name);
  }

  public list(): string[] {
    return Array.from(this.components.keys());
  }

  public getLoaded(): string[] {
    return Array.from(this.loaded.keys());
  }

  /**
   * Alle registrierten Framework-Komponenten automatisch registrieren
   */
  public async registerBuiltInComponents(): Promise<void> {
    // React Component
    this.register("react", async () => {
      const { WebConsole } = await import("../components/react/WebConsole.js");
      return WebConsole;
    });

    // Native Web Component
    this.register("web-component", async () => {
      const { WebConsoleElement } = await import(
        "../components/WebConsoleElement.js"
      );
      return WebConsoleElement;
    });

    // Framework components are registered dynamically if available
    // This avoids compile-time dependencies on optional peer dependencies
  }

  /**
   * Alle Framework-Komponenten vorladen
   */
  public async preloadAllComponents(): Promise<void> {
    const components = this.list();
    const loadPromises = components.map((name) =>
      this.load(name).catch((error) => {
        console.warn(`Failed to preload component '${name}':`, error);
      }),
    );

    await Promise.all(loadPromises);
  }

  /**
   * Framework-spezifischen Loader abrufen
   */
  public getFrameworkLoader(
    framework: string,
  ): (() => Promise<unknown>) | undefined {
    return this.components.get(framework);
  }

  /**
   * Debug-Informationen
   */
  public debug(): object {
    return {
      registered: this.list(),
      loaded: this.getLoaded(),
      initializing: Array.from(this.initializing.keys()),
    };
  }

  /**
   * Ressourcen freigeben
   */
  public override dispose(): void {
    this.components.clear();
    this.loaded.clear();
    this.initializing.clear();
    super.dispose();
  }
}

// Globale Instanz
export const componentRegistry = new ComponentRegistry();
