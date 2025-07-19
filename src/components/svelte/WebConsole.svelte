<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { kernel } from "../../core/Kernel.js";
  import type { IConsole } from "../../interfaces/IConsole.interface.js";
  import type { CommandResult } from "../../types/index.js";

  // Props
  export let prompt: string = "$ ";
  export let width: string | number = "100%";
  export let height: string | number = 400;
  export let theme: string = "default";
  export let workingDirectory: string = "/home/user";

  // Events
  const dispatch = createEventDispatcher<{
    command: { command: string; result: CommandResult };
    ready: IConsole;
    error: Error;
  }>();

  // Local state
  let container: HTMLDivElement;
  let webConsoleElement: HTMLElement | null = null;
  let consoleInstance: IConsole | null = null;

  // Reactive statements
  $: if (webConsoleElement && theme) {
    webConsoleElement.setAttribute("theme", theme);
  }

  $: if (webConsoleElement && prompt) {
    webConsoleElement.setAttribute("prompt", prompt);
  }

  async function initializeConsole() {
    try {
      if (!kernel.isStarted) {
        await kernel.start();
      }

      webConsoleElement = document.createElement("web-console");
      webConsoleElement.setAttribute("prompt", prompt);
      webConsoleElement.setAttribute("theme", theme);
      webConsoleElement.style.width =
        typeof width === "number" ? `${width}px` : width;
      webConsoleElement.style.height =
        typeof height === "number" ? `${height}px` : height;

      // Event-Listener
      webConsoleElement.addEventListener("command", (event: Event) => {
        const customEvent = event as CustomEvent;
        dispatch("command", customEvent.detail);
      });

      webConsoleElement.addEventListener("ready", (event: Event) => {
        const customEvent = event as CustomEvent;
        consoleInstance = customEvent.detail;
        dispatch("ready", customEvent.detail);
      });

      webConsoleElement.addEventListener("error", (event: Event) => {
        const customEvent = event as CustomEvent;
        dispatch("error", customEvent.detail);
      });

      container.appendChild(webConsoleElement);
    } catch (error) {
      dispatch("error", error as Error);
    }
  }

  // Public API functions
  export async function executeCommand(
    command: string,
  ): Promise<CommandResult | null> {
    if (consoleInstance) {
      return await consoleInstance.execute(command);
    }
    return null;
  }

  export function clear(): void {
    if (webConsoleElement && "clear" in webConsoleElement) {
      (webConsoleElement as any).clear();
    }
  }

  export function setPrompt(newPrompt: string): void {
    prompt = newPrompt;
  }

  export function setTheme(newTheme: string): void {
    theme = newTheme;
  }

  onMount(() => {
    initializeConsole();
  });

  onDestroy(() => {
    if (webConsoleElement && webConsoleElement.parentNode) {
      webConsoleElement.parentNode.removeChild(webConsoleElement);
    }
    if (consoleInstance) {
      kernel.destroyConsole(consoleInstance.id);
    }
  });
</script>

<div bind:this={container} class="svelte-web-console-container"></div>

<style>
  .svelte-web-console-container {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
