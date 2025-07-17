/**
 * State Manager für hierarchische State-Verwaltung
 */

import { PersistenceMode } from '../enums/index.js';
import { IStateManager } from '../interfaces/index.js';
import { StateConfig } from '../types/index.js';
import { EventEmitter } from './EventEmitter.js';

/**
 * Interne State-Entry Struktur
 */
interface StateEntry {
  value: unknown;
  config: StateConfig<unknown>;
  lastModified: number;
}

/**
 * State-Events
 */
export const StateEvents = {
  CHANGED: 'state:changed',
  PERSISTED: 'state:persisted',
  RESTORED: 'state:restored'
} as const;

/**
 * State Manager Implementierung
 */
export class StateManager extends EventEmitter implements IStateManager {
  private readonly entries = new Map<string, StateEntry>();
  private readonly namespaceName: string;
  private readonly parent: StateManager | undefined;
  private readonly children = new Map<string, StateManager>();

  constructor(namespaceName = 'root', parent?: StateManager) {
    super();
    this.namespaceName = namespaceName;
    this.parent = parent;
  }

  /**
   * Wert aus dem State abrufen
   */
  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    return entry?.value as T | undefined;
  }

  /**
   * Wert im State setzen
   */
  set<T>(key: string, value: T): void {
    const entry = this.entries.get(key);
    const config = entry?.config;

    if (!config) {
      // Fallback-Konfiguration ohne explizite Konfiguration
      this.entries.set(key, {
        value,
        config: {
          key,
          defaultValue: value,
          persistence: PersistenceMode.VOLATILE
        } as StateConfig<unknown>,
        lastModified: Date.now()
      });
    } else {
      // Existierenden Eintrag aktualisieren
      this.entries.set(key, {
        value,
        config,
        lastModified: Date.now()
      });
    }

    // Event emittieren
    this.emit(StateEvents.CHANGED, { key, value, namespace: this.namespaceName });

    // Auto-Persist bei persistent/session Modes
    if (config?.persistence === PersistenceMode.PERSISTENT ||
        config?.persistence === PersistenceMode.SESSION) {
      this.persistKey(key).catch(error => {
        console.error(`Failed to persist state key "${key}":`, error);
      });
    }
  }

  /**
   * Prüfen ob Key existiert
   */
  has(key: string): boolean {
    return this.entries.has(key);
  }

  /**
   * Key aus State entfernen
   */
  delete(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) return false;

    this.entries.delete(key);

    // Aus Persistierung entfernen
    if (entry.config.persistence !== PersistenceMode.VOLATILE) {
      this.removeFromStorage(key, entry.config.persistence);
    }

    this.emit(StateEvents.CHANGED, { key, value: undefined, namespace: this.namespaceName });
    return true;
  }

  /**
   * Kompletten State leeren
   */
  clear(): void {
    const keys = Array.from(this.entries.keys());

    for (const key of keys) {
      this.delete(key);
    }
  }

  /**
   * Alle Keys abrufen
   */
  keys(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * State-Konfiguration für einen Key definieren
   */
  configure<T>(config: StateConfig<T>): void {
    const existingEntry = this.entries.get(config.key);
    const value = existingEntry?.value ?? config.defaultValue;

    this.entries.set(config.key, {
      value,
      config: config as StateConfig<unknown>,
      lastModified: existingEntry?.lastModified ?? Date.now()
    });
  }

  /**
   * Namespace erstellen/abrufen
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
   * Gesamten State persistieren
   */
  async persist(): Promise<void> {
    const persistPromises: Promise<void>[] = [];

    for (const [key, entry] of this.entries) {
      if (entry.config.persistence !== PersistenceMode.VOLATILE) {
        persistPromises.push(this.persistKey(key));
      }
    }

    // Child-Namespaces auch persistieren
    for (const child of this.children.values()) {
      persistPromises.push(child.persist());
    }

    await Promise.all(persistPromises);
    this.emit(StateEvents.PERSISTED, { namespace: this.namespaceName });
  }

  /**
   * State aus Persistierung wiederherstellen
   */
  async restore(): Promise<void> {
    const restorePromises: Promise<void>[] = [];

    for (const [key, entry] of this.entries) {
      if (entry.config.persistence !== PersistenceMode.VOLATILE) {
        restorePromises.push(this.restoreKey(key));
      }
    }

    // Child-Namespaces auch wiederherstellen
    for (const child of this.children.values()) {
      restorePromises.push(child.restore());
    }

    await Promise.all(restorePromises);
    this.emit(StateEvents.RESTORED, { namespace: this.namespaceName });
  }

  /**
   * Einzelnen Key persistieren
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
      throw new Error(`Failed to persist key "${key}" to ${entry.config.persistence}: ${error}`);
    }
  }

  /**
   * Einzelnen Key wiederherstellen
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

        // Direkt den Wert setzen ohne Event zu triggern
        this.entries.set(key, {
          ...entry,
          value
        });
      }
    } catch (error) {
      console.error(`Failed to restore key "${key}" from ${entry.config.persistence}:`, error);
      // Bei Fehler Default-Wert verwenden
    }
  }

  /**
   * Key aus Storage entfernen
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
      console.error(`Failed to remove key "${key}" from ${persistence}:`, error);
    }
  }

  /**
   * Storage-Key mit Namespace generieren
   */
  private getStorageKey(key: string): string {
    return `webconsole:${this.namespaceName}:${key}`;
  }

  /**
   * Debug-Informationen abrufen
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
            lastModified: new Date(entry.lastModified).toISOString()
          }
        ])
      ),
      children: Array.from(this.children.keys())
    };
  }

  /**
   * Ressourcen freigeben
   */
  override dispose(): void {
    this.clear();

    // Child-Namespaces auch freigeben
    for (const child of this.children.values()) {
      child.dispose();
    }
    this.children.clear();

    super.dispose();
  }
}
