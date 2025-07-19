/**
 * State Manager for hierarchical state management
 */

import { PersistenceMode } from "../enums/index.js";
import { IStateManager } from "../interfaces/index.js";
import { StateConfig } from "../types/index.js";
import { EventEmitter } from "./EventEmitter.js";
import { Logger } from "./Logger.js";

/**
 * Internal state entry structure
 */
interface StateEntry {
  value: unknown;
  config: StateConfig<unknown>;
  lastModified: number;
}

/**
 * State events
 */
export const StateEvents = {
  CHANGED: "state:changed",
  PERSISTED: "state:persisted",
  RESTORED: "state:restored",
} as const;

/**
 * State Manager implementation
 */
export class StateManager extends EventEmitter implements IStateManager {
  private readonly entries = new Map<string, StateEntry>();
  private readonly namespaceName: string;
  private readonly parent: StateManager | undefined;
  private readonly children = new Map<string, StateManager>();
  private readonly stateLogger = new Logger("StateManager");

  constructor(namespaceName = "root", parent?: StateManager) {
    super();
    this.namespaceName = namespaceName;
    this.parent = parent;
  }

  /**
   * Get value from state
   */
  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    return entry?.value as T | undefined;
  }

  /**
   * Set value in state
   */
  set<T>(key: string, value: T): void {
    const entry = this.entries.get(key);
    const config = entry?.config;

    if (!config) {
      // Fallback configuration without explicit config
      this.entries.set(key, {
        value,
        config: {
          key,
          defaultValue: value,
          persistence: PersistenceMode.VOLATILE,
        } as StateConfig<unknown>,
        lastModified: Date.now(),
      });
    } else {
      // Update existing entry
      this.entries.set(key, {
        value,
        config,
        lastModified: Date.now(),
      });
    }

    // Emit event
    this.emit(StateEvents.CHANGED, {
      key,
      value,
      namespace: this.namespaceName,
    });

    // Auto-persist for persistent/session modes
    if (
      config?.persistence === PersistenceMode.PERSISTENT ||
      config?.persistence === PersistenceMode.SESSION
    ) {
      this.persistKey(key).catch((error) => {
        this.stateLogger.error(
          `Failed to persist state key "${key}"`,
          error instanceof Error ? error.message : String(error),
        );
      });
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.entries.has(key);
  }

  /**
   * Remove key from state
   */
  delete(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    this.entries.delete(key);

    // Remove from persistence
    if (entry.config.persistence !== PersistenceMode.VOLATILE) {
      this.removeFromStorage(key, entry.config.persistence);
    }

    this.emit(StateEvents.CHANGED, {
      key,
      value: undefined,
      namespace: this.namespaceName,
    });
    return true;
  }

  /**
   * Clear entire state
   */
  clear(): void {
    const keys = Array.from(this.entries.keys());

    for (const key of keys) {
      this.delete(key);
    }
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Define state configuration for a key
   */
  configure<T>(config: StateConfig<T>): void {
    const existingEntry = this.entries.get(config.key);
    const value = existingEntry?.value ?? config.defaultValue;

    this.entries.set(config.key, {
      value,
      config: config as StateConfig<unknown>,
      lastModified: existingEntry?.lastModified ?? Date.now(),
    });
  }

  /**
   * Create/get namespace
   */
  namespace(name: string): IStateManager {
    let child = this.children.get(name);
    if (!child) {
      child = new StateManager(`${this.namespaceName}:${name}`, this);
      this.children.set(name, child);
    }
    return child;
  }

  /**
   * Persist entire state
   */
  async persist(): Promise<void> {
    const persistPromises: Promise<void>[] = [];

    for (const [key, entry] of this.entries) {
      if (entry.config.persistence !== PersistenceMode.VOLATILE) {
        persistPromises.push(this.persistKey(key));
      }
    }

    // Also persist child namespaces
    for (const child of this.children.values()) {
      persistPromises.push(child.persist());
    }

    await Promise.all(persistPromises);
    this.emit(StateEvents.PERSISTED, { namespace: this.namespaceName });
  }

  /**
   * Restore state from persistence
   */
  async restore(): Promise<void> {
    const restorePromises: Promise<void>[] = [];

    for (const [key, entry] of this.entries) {
      if (entry.config.persistence !== PersistenceMode.VOLATILE) {
        restorePromises.push(this.restoreKey(key));
      }
    }

    // Also restore child namespaces
    for (const child of this.children.values()) {
      restorePromises.push(child.restore());
    }

    await Promise.all(restorePromises);
    this.emit(StateEvents.RESTORED, { namespace: this.namespaceName });
  }

  /**
   * Persist a single key
   */
  private async persistKey(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;

    const storageKey = this.getStorageKey(key);
    const serializedValue = entry.config.serializer
      ? entry.config.serializer.serialize(entry.value)
      : JSON.stringify(entry.value);

    try {
      switch (entry.config.persistence) {
        case PersistenceMode.PERSISTENT:
          localStorage.setItem(storageKey, serializedValue);
          break;
        case PersistenceMode.SESSION:
          sessionStorage.setItem(storageKey, serializedValue);
          break;
      }
    } catch (error) {
      throw new Error(
        `Failed to persist key "${key}" to ${entry.config.persistence}: ${error}`,
      );
    }
  }

  /**
   * Restore a single key
   */
  private async restoreKey(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;

    const storageKey = this.getStorageKey(key);
    let serializedValue: string | null = null;

    try {
      switch (entry.config.persistence) {
        case PersistenceMode.PERSISTENT:
          serializedValue = localStorage.getItem(storageKey);
          break;
        case PersistenceMode.SESSION:
          serializedValue = sessionStorage.getItem(storageKey);
          break;
      }

      if (serializedValue !== null) {
        const value = entry.config.serializer
          ? entry.config.serializer.deserialize(serializedValue)
          : JSON.parse(serializedValue);

        // Set value directly without triggering event
        this.entries.set(key, {
          ...entry,
          value,
        });
      }
    } catch (error) {
      this.stateLogger.error(
        `Failed to restore key "${key}" from ${entry.config.persistence}`,
        error instanceof Error ? error.message : String(error),
      );
      // Use default value on error
    }
  }

  /**
   * Remove key from storage
   */
  private removeFromStorage(key: string, persistence: PersistenceMode): void {
    const storageKey = this.getStorageKey(key);

    try {
      switch (persistence) {
        case PersistenceMode.PERSISTENT:
          localStorage.removeItem(storageKey);
          break;
        case PersistenceMode.SESSION:
          sessionStorage.removeItem(storageKey);
          break;
      }
    } catch (error) {
      this.stateLogger.error(
        `Failed to remove key "${key}" from ${persistence}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Generate storage key with namespace
   */
  private getStorageKey(key: string): string {
    return `webconsole:${this.namespaceName}:${key}`;
  }

  /**
   * Get debug information
   */
  debug(): object {
    return {
      namespace: this.namespaceName,
      entries: Object.fromEntries(
        Array.from(this.entries.entries()).map(([key, entry]) => [
          key,
          {
            value: entry.value,
            config: entry.config,
            lastModified: new Date(entry.lastModified).toISOString(),
          },
        ]),
      ),
      children: Array.from(this.children.keys()),
    };
  }

  /**
   * Load state (alias for restore)
   */
  async load(): Promise<void> {
    return this.restore();
  }

  /**
   * Save state (alias for persist)
   */
  async save(): Promise<void> {
    return this.persist();
  }

  /**
   * Release resources
   */
  override dispose(): void {
    this.clear();

    // Also release child namespaces
    for (const child of this.children.values()) {
      child.dispose();
    }
    this.children.clear();

    super.dispose();
  }
}
