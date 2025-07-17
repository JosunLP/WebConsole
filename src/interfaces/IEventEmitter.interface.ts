/**
 * Event-Emitter Interface
 */

import { EventHandler, EventUnsubscriber } from '../types/index.js';

export interface IEventEmitter {
  on<T = unknown>(event: string, handler: EventHandler<T>): EventUnsubscriber;
  off(event: string, handler: EventHandler): void;
  emit<T = unknown>(event: string, data: T): void;
  once<T = unknown>(event: string, handler: EventHandler<T>): EventUnsubscriber;
  removeAllListeners(event?: string): void;
}
