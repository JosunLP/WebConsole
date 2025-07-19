/**
 * Component Registry - Management of framework components
 */

import type { IComponentRegistry } from "../interfaces/IComponentRegistry.interface.js";
import { EventEmitter } from "./EventEmitter.js";
import { Logger } from "./Logger.js";

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
  private readonly componentLogger = new Logger("ComponentRegistry");

  public register(name: string, loader: () => Promise<unknown>): void {
    this.components.set(name, loader);
    this.emit(ComponentRegistryEvents.COMPONENT_REGISTERED, { name });
  }

  public async load(name: string): Promise<unknown> {
    // Already loaded?
    if (this.loaded.has(name)) {
      return this.loaded.get(name)!;
    }

    // Already loading?
    if (this.initializing.has(name)) {
      return this.initializing.get(name)!;
    }

    // Loader available?
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
   * Automatically register all registered framework components
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
   * Preload all framework components
   */
  public async preloadAllComponents(): Promise<void> {
    const components = this.list();
    const loadPromises = components.map((name) =>
      this.load(name).catch((error) => {
        this.componentLogger.warn(
          `Failed to preload component '${name}'`,
          error instanceof Error ? error.message : String(error),
        );
      }),
    );

    await Promise.all(loadPromises);
  }

  /**
   * Get framework-specific loader
   */
  public getFrameworkLoader(
    framework: string,
  ): (() => Promise<unknown>) | undefined {
    return this.components.get(framework);
  }

  /**
   * Debug information
   */
  public debug(): object {
    return {
      registered: this.list(),
      loaded: this.getLoaded(),
      initializing: Array.from(this.initializing.keys()),
    };
  }

  /**
   * Release resources
   */
  public override dispose(): void {
    this.components.clear();
    this.loaded.clear();
    this.initializing.clear();
    super.dispose();
  }
}

// Global instance
export const componentRegistry = new ComponentRegistry();
