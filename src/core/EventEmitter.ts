/**
 * Event-Emitter implementation for the Web-Console system
 */

import { IEventEmitter } from "../interfaces/index.js";
import { EventHandler, EventUnsubscriber } from "../types/index.js";

/**
 * Internal event listener structure
 */
interface EventListener {
  handler: EventHandler<unknown>;
  once: boolean;
}

/**
 * Type-safe Event Emitter implementation
 */
export class EventEmitter implements IEventEmitter {
  private readonly listeners = new Map<string, Set<EventListener>>();

  /**
   * Register event listener
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): EventUnsubscriber {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listener: EventListener = {
      handler: handler as EventHandler<unknown>,
      once: false,
    };
    this.listeners.get(event)!.add(listener);

    // Return unsubscriber
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Register event listener for one-time execution
   */
  once<T = unknown>(
    event: string,
    handler: EventHandler<T>,
  ): EventUnsubscriber {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listener: EventListener = {
      handler: handler as EventHandler<unknown>,
      once: true,
    };
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: EventHandler): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    for (const listener of eventListeners) {
      if (listener.handler === handler) {
        eventListeners.delete(listener);
        break;
      }
    }
  }

  /**
   * Event emittieren
   */
  emit<T = unknown>(event: string, data?: T): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    // Create copy to avoid modifications during iteration
    const listenersToCall = Array.from(eventListeners);

    for (const listener of listenersToCall) {
      try {
        listener.handler(data);

        // Remove once-listener after execution
        if (listener.once) {
          eventListeners.delete(listener);
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Check if listeners exist for an event
   */
  hasListeners(event: string): boolean {
    const eventListeners = this.listeners.get(event);
    return eventListeners !== undefined && eventListeners.size > 0;
  }

  /**
   * Number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * All registered events
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * All listeners for an event (for debugging)
   */
  getListeners(event: string): EventHandler[] {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return [];

    return Array.from(eventListeners).map((listener) => listener.handler);
  }

  /**
   * Ressourcen freigeben
   */
  dispose(): void {
    this.listeners.clear();
  }
}
