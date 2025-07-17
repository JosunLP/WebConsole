/**
 * Component Registry Interface
 */

export interface IComponentRegistry {
  register(name: string, loader: () => Promise<unknown>): void;
  load(name: string): Promise<unknown>;
  unregister(name: string): void;
  isRegistered(name: string): boolean;
  list(): string[];
}
