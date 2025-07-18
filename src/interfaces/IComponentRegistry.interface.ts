/**
 * Component Registry Interface
 */

export interface IComponentRegistry {
  register(name: string, loader: () => Promise<unknown>): void;
  load(name: string): Promise<unknown>;
  unregister(name: string): void;
  isRegistered(name: string): boolean;
  isLoaded(name: string): boolean;
  list(): string[];
  getLoaded(): string[];

  // Built-in Components
  registerBuiltInComponents(): Promise<void>;
  preloadAllComponents(): Promise<void>;

  // Framework-specific
  getFrameworkLoader(framework: string): (() => Promise<unknown>) | undefined;

  // Debug
  debug(): object;
}

/**
 * Component Interface - Base for all components
 */
export interface IComponent {
  readonly name: string;
  readonly version: string;

  initialize?(): Promise<void>;
  destroy?(): Promise<void>;

  // Framework-specific properties
  element?: HTMLElement;
  instance?: unknown;
}
