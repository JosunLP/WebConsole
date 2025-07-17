/**
 * Component Registry - Verwaltung von Framework-Komponenten
 */

import type { IComponentRegistry } from "../interfaces/IComponentRegistry.interface.js";

export class ComponentRegistry implements IComponentRegistry {
  private components = new Map<string, () => Promise<unknown>>();
  private loaded = new Map<string, unknown>();

  public register(name: string, loader: () => Promise<unknown>): void {
    this.components.set(name, loader);
  }

  public async load(name: string): Promise<unknown> {
    // Bereits geladen?
    if (this.loaded.has(name)) {
      return this.loaded.get(name)!;
    }

    // Loader vorhanden?
    const loader = this.components.get(name);
    if (!loader) {
      throw new Error(`Component '${name}' not registered`);
    }

    try {
      const component = await loader();
      this.loaded.set(name, component);
      return component;
    } catch (error) {
      throw new Error(`Failed to load component '${name}': ${error}`);
    }
  }

  public unregister(name: string): void {
    this.components.delete(name);
    this.loaded.delete(name);
  }

  public isRegistered(name: string): boolean {
    return this.components.has(name);
  }

  public list(): string[] {
    return Array.from(this.components.keys());
  }
}

// Globale Instanz
export const componentRegistry = new ComponentRegistry();
