/**
 * Command Handler Interface
 */

import { CommandContext, CommandResult } from "../types/index.js";

import { CommandType, ExitCode } from "../enums/index.js";

export interface ICommandHandler {
  readonly name: string;
  readonly type: CommandType;
  readonly description?: string;
  readonly usage?: string;

  execute(context: CommandContext): Promise<ExitCode>;

  // Optionale Lifecycle-Hooks
  beforeExecute?(context: CommandContext): Promise<void>;
  afterExecute?(context: CommandContext, result: CommandResult): Promise<void>;
  onError?(context: CommandContext, error: Error): Promise<void>;
}
