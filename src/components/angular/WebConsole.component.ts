import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { kernel } from "../../core/Kernel.js";
import type { IConsole } from "../../interfaces/IConsole.interface.js";
import type { CommandResult } from "../../types/index.js";

@Component({
  selector: "web-console",
  template: `<div #container class="angular-web-console-container"></div>`,
  styles: [
    `
      .angular-web-console-container {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class WebConsoleComponent implements OnInit, OnDestroy {
  @Input() prompt: string = "$ ";
  @Input() width: string | number = "100%";
  @Input() height: string | number = 400;
  @Input() theme: string = "default";
  @Input() workingDirectory: string = "/home/user";

  @Output() command = new EventEmitter<{
    command: string;
    result: CommandResult;
  }>();
  @Output() ready = new EventEmitter<IConsole>();
  @Output() error = new EventEmitter<Error>();

  @ViewChild("container", { static: true }) containerRef!: ElementRef;

  private element: HTMLElement | null = null;
  private consoleInstance: IConsole | null = null;

  async ngOnInit() {
    try {
      await this.initializeConsole();
    } catch (err) {
      this.error.emit(err as Error);
    }
  }

  ngOnDestroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.consoleInstance) {
      kernel.destroyConsole(this.consoleInstance.id);
    }
  }

  private async initializeConsole() {
    if (!kernel.isStarted) {
      await kernel.start();
    }

    this.element = document.createElement("web-console");
    this.element.setAttribute("prompt", this.prompt);
    this.element.setAttribute("theme", this.theme);
    this.element.style.width =
      typeof this.width === "number" ? `${this.width}px` : this.width;
    this.element.style.height =
      typeof this.height === "number" ? `${this.height}px` : this.height;

    // Event-Listener
    this.element.addEventListener("command", (event: any) => {
      this.command.emit(event.detail);
    });

    this.element.addEventListener("ready", (event: any) => {
      this.consoleInstance = event.detail;
      this.ready.emit(event.detail);
    });

    this.element.addEventListener("error", (event: any) => {
      this.error.emit(event.detail);
    });

    this.containerRef.nativeElement.appendChild(this.element);
  }

  // Public API
  public async executeCommand(command: string): Promise<CommandResult | null> {
    if (this.consoleInstance) {
      return await this.consoleInstance.execute(command);
    }
    return null;
  }

  public clear(): void {
    if (this.element && "clear" in this.element) {
      (this.element as any).clear();
    }
  }

  public setPrompt(newPrompt: string): void {
    this.prompt = newPrompt;
    if (this.element) {
      this.element.setAttribute("prompt", newPrompt);
    }
  }

  public setTheme(newTheme: string): void {
    this.theme = newTheme;
    if (this.element) {
      this.element.setAttribute("theme", newTheme);
    }
  }
}
