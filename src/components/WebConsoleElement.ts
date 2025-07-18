/**
 * Native Web Component for Web Console
 */

import { kernel } from "../core/Kernel.js";
import type { IConsole } from "../interfaces/IConsole.interface.js";
import type { IConsoleOptions } from "../interfaces/IConsoleOptions.interface.js";
import stylesCss from "./styles/WebConsoleElement.scss?inline";

export class WebConsoleElement extends HTMLElement {
  private _console: IConsole | null = null;
  private _terminal: HTMLDivElement | null = null;
  private _input: HTMLInputElement | null = null;
  private _output: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["theme", "prompt", "width", "height", "cwd", "mode"];
  }

  connectedCallback() {
    this.render();
    this.initialize();
  }

  disconnectedCallback() {
    if (this._console) {
      this._console.destroy();
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateAttribute(name, newValue);
    }
  }

  private render() {
    const template = `
      <style>${stylesCss}</style>
      <div class="terminal">
        <div class="output" id="output"></div>
        <div class="input-line">
          <span class="prompt" id="prompt">$ </span>
          <input type="text" class="input" id="input" autocomplete="off" spellcheck="false">
        </div>
      </div>
    `;

    this.shadowRoot!.innerHTML = template;

    this._terminal = this.shadowRoot!.querySelector(".terminal");
    this._output = this.shadowRoot!.querySelector("#output");
    this._input = this.shadowRoot!.querySelector("#input");

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (this._input) {
      this._input.addEventListener("keydown", this.handleKeyDown.bind(this));
    }
  }

  private async handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const input = (event.target as HTMLInputElement).value.trim();
      if (input && this._console) {
        this.addToOutput(`$ ${input}`, "command");

        try {
          const result = await this._console.execute(input);

          if (result.stdout.length > 0) {
            const output = new TextDecoder().decode(result.stdout);
            this.addToOutput(output, "success");
          }

          if (result.stderr.length > 0) {
            const error = new TextDecoder().decode(result.stderr);
            this.addToOutput(error, "error");
          }
        } catch (error) {
          this.addToOutput(`Error: ${error}`, "error");
        }

        (event.target as HTMLInputElement).value = "";
      }
    }
  }

  private addToOutput(text: string, className: string = "") {
    if (this._output) {
      const line = document.createElement("div");
      line.className = `line ${className}`;
      line.textContent = text;
      this._output.appendChild(line);
      this._output.scrollTop = this._output.scrollHeight;
    }
  }

  private async initialize() {
    try {
      // Start kernel if not already started
      if (!kernel.isStarted) {
        await kernel.start();
      }

      // Erstelle Console-Instanz
      const options: Partial<IConsoleOptions> = {
        prompt: this.getAttribute("prompt") || "$ ",
        cwd: "/home/user",
        env: new Map([
          ["PATH", "/usr/bin:/bin"],
          ["HOME", "/home/user"],
          ["USER", "user"],
        ]),
      };

      this._console = await kernel.createConsole(options);

      // Willkommensnachricht
      this.addToOutput("Welcome to Web Console!", "success");
      this.addToOutput('Type "help" for available commands.', "");
    } catch (error) {
      console.error("Failed to initialize Web Console:", error);
      this.addToOutput(`Initialization failed: ${error}`, "error");
    }
  }

  private updateAttribute(name: string, value: string) {
    switch (name) {
      case "prompt": {
        const promptElement = this.shadowRoot!.querySelector("#prompt");
        if (promptElement) {
          promptElement.textContent = value || "$ ";
        }
        break;
      }
      case "width":
        this.style.width = value;
        break;
      case "height":
        this.style.height = value;
        break;
      case "theme":
        this.applyTheme(value);
        break;
    }
  }

  private async applyTheme(themeName: string) {
    try {
      const themeManager = kernel.getThemeManager();
      if (themeManager) {
        await themeManager.setTheme(themeName);
        themeManager.injectCSS();
      }
    } catch (error) {
      console.warn(`Failed to apply theme '${themeName}':`, error);
    }
  }

  // Public API
  public async executeCommand(command: string) {
    if (this._console) {
      return await this._console.execute(command);
    }
    throw new Error("Console not initialized");
  }

  public clear() {
    if (this._output) {
      this._output.innerHTML = "";
    }
  }

  public setPrompt(prompt: string) {
    this.setAttribute("prompt", prompt);
  }

  public getCurrentWorkingDirectory(): string {
    // Fallback to root directory if console not available
    return "/home/user";
  }

  public getConsoleState(): unknown {
    return this._console?.getState() || {};
  }

  public override focus() {
    if (this._input) {
      this._input.focus();
    }
  }
}

// Registriere Custom Element
if (!customElements.get("web-console")) {
  customElements.define("web-console", WebConsoleElement);
}
