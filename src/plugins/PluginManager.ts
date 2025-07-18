/**
 * Plugin System for Web Console Commands
 */

import { CommandType, ExitCode } from "../enums/index.js";
import type { ICommandHandler } from "../interfaces/ICommandHandler.interface.js";
import type { CommandContext } from "../types/index.js";

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  commands: string[];
}

export interface IPlugin {
  metadata: PluginMetadata;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
  getCommands(): Map<string, ICommandHandler>;
}

export class PluginManager {
  private plugins = new Map<string, IPlugin>();
  private loadedCommands = new Map<
    string,
    { plugin: string; handler: ICommandHandler }
  >();

  /**
   * Plugin registrieren
   */
  async registerPlugin(plugin: IPlugin): Promise<void> {
    const { name } = plugin.metadata;

    if (this.plugins.has(name)) {
      throw new Error(`Plugin '${name}' is already registered`);
    }

    // Check dependencies
    for (const dep of plugin.metadata.dependencies || []) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Plugin '${name}' requires dependency '${dep}'`);
      }
    }

    // Registriere Plugin
    this.plugins.set(name, plugin);

    // Initialisiere Plugin
    await plugin.initialize();

    // Registriere Commands
    const commands = plugin.getCommands();
    for (const [commandName, handler] of commands) {
      if (this.loadedCommands.has(commandName)) {
        const existing = this.loadedCommands.get(commandName)!;
        console.warn(
          `Command '${commandName}' from plugin '${name}' overwrites command from plugin '${existing.plugin}'`,
        );
      }
      this.loadedCommands.set(commandName, { plugin: name, handler });
    }

    console.log(`Plugin '${name}' v${plugin.metadata.version} loaded`);
  }

  /**
   * Unregister plugin
   */
  async unregisterPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin '${name}' not found`);
    }

    // Cleanup Plugin
    await plugin.cleanup();

    // Remove commands
    for (const commandName of plugin.metadata.commands) {
      this.loadedCommands.delete(commandName);
    }

    this.plugins.delete(name);
    console.log(`Plugin '${name}' unloaded`);
  }

  /**
   * Get command handler
   */
  getCommandHandler(command: string): ICommandHandler | undefined {
    return this.loadedCommands.get(command)?.handler;
  }

  /**
   * List all available commands
   */
  getAvailableCommands(): string[] {
    return Array.from(this.loadedCommands.keys()).sort();
  }

  /**
   * Get plugin information
   */
  getPluginInfo(name: string): PluginMetadata | undefined {
    return this.plugins.get(name)?.metadata;
  }

  /**
   * List all loaded plugins
   */
  getLoadedPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((p) => p.metadata);
  }
}

/**
 * Helper function for stream output
 */
async function writeToStream(
  stream: WritableStream<Uint8Array>,
  data: string | Uint8Array,
): Promise<void> {
  const writer = stream.getWriter();
  try {
    const bytes =
      typeof data === "string" ? new TextEncoder().encode(data) : data;
    await writer.write(bytes);
  } finally {
    writer.releaseLock();
  }
}

/**
 * Example Plugin: Git Commands
 */
export class GitPlugin implements IPlugin {
  metadata: PluginMetadata = {
    name: "git",
    version: "1.0.0",
    description: "Git commands for Web Console",
    author: "WebConsole Team",
    commands: ["git", "status"],
  };

  private commands = new Map<string, ICommandHandler>();

  async initialize(): Promise<void> {
    // Git Command
    this.commands.set("git", {
      name: "git",
      type: CommandType.BUILTIN,
      description: "Git version control",
      usage: "git <subcommand> [options]",
      execute: async (context: CommandContext): Promise<ExitCode> => {
        const args = context.args;

        if (args.length === 0) {
          await writeToStream(
            context.stdout,
            `git version 2.34.1
usage: git [--version] [--help] [-C <path>] [--exec-path[=<path>]]

Available commands: status, add, commit, push, pull, clone
`,
          );
          return ExitCode.SUCCESS;
        }

        const subcommand = args[0];
        switch (subcommand) {
          case "status":
            await writeToStream(
              context.stdout,
              `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)

	modified:   src/console/Parser.ts
	modified:   src/core/VFS.ts

Untracked files:
	src/plugins/PluginManager.ts

no changes added to commit
`,
            );
            return ExitCode.SUCCESS;
          case "add": {
            const files = args.slice(1);
            if (files.length === 0) {
              await writeToStream(
                context.stderr,
                "Nothing specified, nothing added.\n",
              );
              return ExitCode.ERROR;
            }
            await writeToStream(
              context.stdout,
              `Added files: ${files.join(", ")}\n`,
            );
            return ExitCode.SUCCESS;
          }
          default:
            await writeToStream(
              context.stderr,
              `git: '${subcommand}' is not a git command. See 'git --help'.\n`,
            );
            return ExitCode.ERROR;
        }
      },
    });

    // Status Command (Alias)
    this.commands.set("status", {
      name: "status",
      type: CommandType.BUILTIN,
      description: "Show git status (alias for git status)",
      usage: "status",
      execute: async (context: CommandContext): Promise<ExitCode> => {
        // Rufe git status auf
        const gitHandler = this.commands.get("git")!;
        const newContext = {
          ...context,
          args: ["status"],
        };
        return gitHandler.execute(newContext);
      },
    });
  }

  async cleanup(): Promise<void> {
    this.commands.clear();
  }

  getCommands(): Map<string, ICommandHandler> {
    return this.commands;
  }
}

/**
 * System Monitoring Plugin
 */
export class SystemPlugin implements IPlugin {
  metadata: PluginMetadata = {
    name: "system",
    version: "1.0.0",
    description: "System monitoring and information commands",
    commands: ["ps", "memory", "date", "uptime"],
  };

  private commands = new Map<string, ICommandHandler>();

  async initialize(): Promise<void> {
    this.commands.set("ps", {
      name: "ps",
      type: CommandType.BUILTIN,
      description: "Show running processes",
      usage: "ps [options]",
      execute: async (context: CommandContext): Promise<ExitCode> => {
        await writeToStream(
          context.stdout,
          `  PID TTY          TIME CMD
    1 console  00:00:01 kernel
   42 console  00:00:00 web-console
  123 console  00:00:00 theme-manager
  456 console  00:00:00 vfs-provider
`,
        );
        return ExitCode.SUCCESS;
      },
    });

    this.commands.set("memory", {
      name: "memory",
      type: CommandType.BUILTIN,
      description: "Show memory usage",
      usage: "memory",
      execute: async (context: CommandContext): Promise<ExitCode> => {
        // Basic memory info (without performance.memory which might not be available)
        const memInfo = {
          used: Math.round(Math.random() * 100 + 50), // Simulated
          total: 512,
          available: Math.round(Math.random() * 200 + 200),
        };

        await writeToStream(
          context.stdout,
          `Memory Usage:
  Used: ${memInfo.used} MB
  Total: ${memInfo.total} MB
  Available: ${memInfo.available} MB
`,
        );
        return ExitCode.SUCCESS;
      },
    });

    this.commands.set("date", {
      name: "date",
      type: CommandType.BUILTIN,
      description: "Show current date and time",
      usage: "date [+format]",
      execute: async (context: CommandContext): Promise<ExitCode> => {
        const now = new Date();
        const format = context.args[0];

        let output: string;
        if (format && format.startsWith("+")) {
          // Simple format support
          output = format
            .replace(/%Y/g, now.getFullYear().toString())
            .replace(/%m/g, (now.getMonth() + 1).toString().padStart(2, "0"))
            .replace(/%d/g, now.getDate().toString().padStart(2, "0"))
            .replace(/%H/g, now.getHours().toString().padStart(2, "0"))
            .replace(/%M/g, now.getMinutes().toString().padStart(2, "0"))
            .replace(/%S/g, now.getSeconds().toString().padStart(2, "0"));
        } else {
          output = now.toString();
        }

        await writeToStream(context.stdout, output + "\n");
        return ExitCode.SUCCESS;
      },
    });

    this.commands.set("uptime", {
      name: "uptime",
      type: CommandType.BUILTIN,
      description: "Show system uptime",
      usage: "uptime",
      execute: async (context: CommandContext): Promise<ExitCode> => {
        const uptime = performance.now() / 1000;
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        await writeToStream(
          context.stdout,
          `up ${hours}h ${minutes}m, load average: 0.42, 0.35, 0.28\n`,
        );
        return ExitCode.SUCCESS;
      },
    });
  }

  async cleanup(): Promise<void> {
    this.commands.clear();
  }

  getCommands(): Map<string, ICommandHandler> {
    return this.commands;
  }
}
