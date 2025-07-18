/**
 * Configuration-related type definitions
 */

import { PersistenceMode } from "../enums/index.js";
import { Path } from "./primitive.type.js";

/**
 * Mount point configuration
 */
export interface MountConfig {
  readonly path: Path;
  readonly provider: string;
  readonly options: Record<string, unknown>;
  readonly readOnly: boolean;
}

/**
 * State configuration
 */
export interface StateConfig<T = unknown> {
  readonly key: string;
  readonly defaultValue: T;
  readonly persistence: PersistenceMode;
  readonly serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
}
