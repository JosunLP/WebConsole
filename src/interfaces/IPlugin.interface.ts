/**
 * Plugin Interface
 */

import { IKernel } from "./IKernel.interface.js";

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];

  install(kernel: IKernel): Promise<void>;
  uninstall(kernel: IKernel): Promise<void>;

  // Optionale Lifecycle-Hooks
  beforeInstall?(kernel: IKernel): Promise<void>;
  afterInstall?(kernel: IKernel): Promise<void>;
  beforeUninstall?(kernel: IKernel): Promise<void>;
  afterUninstall?(kernel: IKernel): Promise<void>;
}
