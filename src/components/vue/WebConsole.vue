<template>
  <div ref="container" class="vue-web-console-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { kernel } from "../../core/Kernel.js";
import type { IConsole } from "../../interfaces/IConsole.interface.js";

export default defineComponent({
  name: "WebConsole",
  props: {
    prompt: { type: String, default: "$ " },
    width: { type: [String, Number], default: "100%" },
    height: { type: [String, Number], default: 400 },
    theme: { type: String, default: "default" },
    workingDirectory: { type: String, default: "/home/user" },
  },
  emits: ["command", "ready", "error"],
  setup(props, { emit }) {
    const container = ref<HTMLElement | null>(null);
    let webConsoleElement: HTMLElement | null = null;
    let consoleInstance: IConsole | null = null;

    const initializeConsole = async () => {
      try {
        if (!kernel.isStarted) {
          await kernel.start();
        }

        // Erstelle WebConsole Element
        webConsoleElement = document.createElement("web-console");
        webConsoleElement.setAttribute("prompt", props.prompt);
        webConsoleElement.setAttribute("theme", props.theme);
        webConsoleElement.style.width =
          typeof props.width === "number" ? `${props.width}px` : props.width;
        webConsoleElement.style.height =
          typeof props.height === "number" ? `${props.height}px` : props.height;

        // Add event listener
        webConsoleElement.addEventListener("command", (event: Event) => {
          const customEvent = event as CustomEvent;
          emit("command", customEvent.detail);
        });

        webConsoleElement.addEventListener("ready", (event: Event) => {
          const customEvent = event as CustomEvent;
          consoleInstance = customEvent.detail;
          emit("ready", customEvent.detail);
        });

        webConsoleElement.addEventListener("error", (event: Event) => {
          const customEvent = event as CustomEvent;
          emit("error", customEvent.detail);
        });

        // Add to DOM
        if (container.value) {
          container.value.appendChild(webConsoleElement);
        }
      } catch (error) {
        emit("error", error);
      }
    };

    // Watch for theme changes
    watch(
      () => props.theme,
      (newTheme) => {
        if (webConsoleElement) {
          webConsoleElement.setAttribute("theme", newTheme);
        }
      },
    );

    // Watch for prompt changes
    watch(
      () => props.prompt,
      (newPrompt) => {
        if (webConsoleElement) {
          webConsoleElement.setAttribute("prompt", newPrompt);
        }
      },
    );

    onMounted(() => {
      initializeConsole();
    });

    onUnmounted(() => {
      if (webConsoleElement && webConsoleElement.parentNode) {
        webConsoleElement.parentNode.removeChild(webConsoleElement);
      }
      if (consoleInstance) {
        kernel.destroyConsole(consoleInstance.id);
      }
    });

    // Public API
    const executeCommand = async (command: string) => {
      if (consoleInstance) {
        return await consoleInstance.execute(command);
      }
      return null;
    };

    const clear = () => {
      if (webConsoleElement && "clear" in webConsoleElement) {
        (webConsoleElement as any).clear();
      }
    };

    const setPrompt = (newPrompt: string) => {
      if (webConsoleElement) {
        webConsoleElement.setAttribute("prompt", newPrompt);
      }
    };

    return {
      container,
      executeCommand,
      clear,
      setPrompt,
    };
  },
});
</script>

<style scoped>
.vue-web-console-container {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
