/**
 * Advanced WebConsole Features Storybook
 */

import type { Meta, StoryObj } from "@storybook/html";

interface AdvancedWebConsoleArgs {
  theme: string;
  prompt: string;
  width: string;
  height: number;
  commands: string[];
  vfsEnabled: boolean;
  multiInstance: boolean;
}

const meta: Meta<AdvancedWebConsoleArgs> = {
  title: "WebConsole/Advanced Features",
  tags: ["autodocs"],
  render: (args) => createAdvancedDemo(args),
  argTypes: {
    theme: {
      control: "select",
      options: [
        "default",
        "dark",
        "light",
        "windows-terminal",
        "monokai",
        "solarized-dark",
      ],
    },
    prompt: { control: "text" },
    width: { control: "text" },
    height: { control: "number" },
    commands: { control: "object" },
    vfsEnabled: { control: "boolean" },
    multiInstance: { control: "boolean" },
  },
  args: {
    theme: "windows-terminal",
    prompt: "$ ",
    width: "100%",
    height: 400,
    commands: ["help", "ls", "pwd", 'echo "Hello World"', "theme list"],
    vfsEnabled: true,
    multiInstance: false,
  },
};

export default meta;
type Story = StoryObj<AdvancedWebConsoleArgs>;

function createAdvancedDemo(args: AdvancedWebConsoleArgs): HTMLElement {
  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";

  // Header
  const header = document.createElement("h2");
  header.textContent = "🚀 Advanced WebConsole Features";
  header.style.marginBottom = "20px";
  header.style.color = "#333";
  container.appendChild(header);

  if (args.multiInstance) {
    // Multi-instance demo
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "1fr 1fr";
    grid.style.gap = "20px";
    grid.style.marginBottom = "20px";

    const themes = ["default", "windows-terminal", "monokai", "solarized-dark"];
    themes.forEach((theme, index) => {
      const instanceContainer = document.createElement("div");

      const label = document.createElement("h3");
      label.textContent = `Instance ${index + 1}: ${theme}`;
      label.style.margin = "0 0 10px 0";
      label.style.fontSize = "14px";
      instanceContainer.appendChild(label);

      const console = document.createElement("web-console");
      console.setAttribute("theme", theme);
      console.setAttribute("prompt", `${theme}$ `);
      console.style.height = "200px";
      console.style.width = "100%";

      instanceContainer.appendChild(console);
      grid.appendChild(instanceContainer);
    });

    container.appendChild(grid);
  } else {
    // Single instance with features
    const featuresContainer = document.createElement("div");
    featuresContainer.style.marginBottom = "20px";

    // Feature info
    const features = document.createElement("div");
    features.innerHTML = `
      <h3>Enabled Features:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>✅ Virtual File System (VFS)</li>
        <li>✅ Command History (↑/↓ arrows)</li>
        <li>✅ Tab Completion</li>
        <li>✅ Theme System</li>
        <li>✅ Built-in Commands: ${args.commands.join(", ")}</li>
        <li>✅ Event System</li>
        <li>✅ State Persistence</li>
      </ul>
    `;
    featuresContainer.appendChild(features);

    // Auto-run commands demo
    if (args.commands.length > 0) {
      const autoRunBtn = document.createElement("button");
      autoRunBtn.textContent = "🎮 Run Demo Commands";
      autoRunBtn.style.marginBottom = "10px";
      autoRunBtn.style.padding = "8px 16px";
      autoRunBtn.style.backgroundColor = "#007acc";
      autoRunBtn.style.color = "white";
      autoRunBtn.style.border = "none";
      autoRunBtn.style.borderRadius = "4px";
      autoRunBtn.style.cursor = "pointer";

      featuresContainer.appendChild(autoRunBtn);
    }

    container.appendChild(featuresContainer);

    // Main console
    const console = document.createElement("web-console");
    console.setAttribute("theme", args.theme);
    console.setAttribute("prompt", args.prompt);
    console.style.height = `${args.height}px`;
    console.style.width = args.width;
    console.style.marginBottom = "20px";

    container.appendChild(console);

    // Auto-run functionality
    if (args.commands.length > 0) {
      const autoRunBtn = featuresContainer.querySelector("button");
      if (autoRunBtn) {
        autoRunBtn.addEventListener("click", async () => {
          autoRunBtn.textContent = "⏳ Running commands...";
          autoRunBtn.disabled = true;

          // Wait for console to be ready
          await new Promise((resolve) => {
            const checkReady = () => {
              if (console.shadowRoot?.querySelector(".terminal")) {
                resolve(true);
              } else {
                setTimeout(checkReady, 100);
              }
            };
            checkReady();
          });

          // Run commands with delay
          for (let i = 0; i < args.commands.length; i++) {
            const command = args.commands[i];

            // Simulate typing
            const input = console.shadowRoot?.querySelector(
              ".input",
            ) as HTMLInputElement;
            if (input) {
              input.value = command;
              input.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Enter" }),
              );
            }

            // Wait between commands
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }

          autoRunBtn.textContent = "✅ Commands executed";
          setTimeout(() => {
            autoRunBtn.textContent = "🎮 Run Demo Commands";
            autoRunBtn.disabled = false;
          }, 2000);
        });
      }
    }

    // API demonstration
    const apiDemo = document.createElement("div");
    apiDemo.innerHTML = `
      <h3>API Integration Example:</h3>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;"><code>// JavaScript API Usage
import { kernel } from 'web-console';

// Start the kernel
await kernel.start();

// Create console instance
const console = await kernel.createConsole({
  prompt: '${args.prompt}',
  cwd: '/home/user'
});

// Execute command programmatically
const result = await console.execute('ls -la');
console.log(result.output);

// Listen to events
console.on('command', (cmd, result) => {
  console.log('Command executed:', cmd);
});

// Change theme
kernel.getThemeManager().setTheme('${args.theme}');</code></pre>
    `;
    container.appendChild(apiDemo);
  }

  // Performance metrics
  const metrics = document.createElement("div");
  metrics.innerHTML = `
    <h3>Performance Metrics:</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
      <div style="background: #e8f4f8; padding: 10px; border-radius: 4px; text-align: center;">
        <div style="font-weight: bold; color: #007acc;">Bundle Size</div>
        <div style="font-size: 18px; margin: 5px 0;">&lt; 50 KB</div>
        <div style="font-size: 12px; color: #666;">gzipped</div>
      </div>
      <div style="background: #f0f8e8; padding: 10px; border-radius: 4px; text-align: center;">
        <div style="font-weight: bold; color: #28a745;">Memory Usage</div>
        <div style="font-size: 18px; margin: 5px 0;">&lt; 10 MB</div>
        <div style="font-size: 12px; color: #666;">typical</div>
      </div>
      <div style="background: #f8f0e8; padding: 10px; border-radius: 4px; text-align: center;">
        <div style="font-weight: bold; color: #dc3545;">Init Time</div>
        <div style="font-size: 18px; margin: 5px 0;">&lt; 100ms</div>
        <div style="font-size: 12px; color: #666;">cold start</div>
      </div>
    </div>
  `;
  container.appendChild(metrics);

  return container;
}

// Feature Demos
export const VirtualFileSystem: Story = {
  name: "🗂️ Virtual File System",
  args: {
    theme: "default",
    commands: [
      "pwd",
      "ls",
      "mkdir test",
      "cd test",
      'echo "Hello VFS" > file.txt',
      "cat file.txt",
      "cd ..",
      "ls",
    ],
    vfsEnabled: true,
    multiInstance: false,
  },
};

export const ThemeSystem: Story = {
  name: "🎨 Theme System",
  args: {
    theme: "monokai",
    commands: [
      "theme list",
      "theme windows-terminal",
      "theme solarized-dark",
      "theme default",
    ],
    multiInstance: false,
  },
};

export const MultipleInstances: Story = {
  name: "🔄 Multiple Instances",
  args: {
    multiInstance: true,
    height: 250,
  },
};

export const BuiltInCommands: Story = {
  name: "⚡ Built-in Commands",
  args: {
    theme: "windows-terminal",
    commands: [
      "help",
      "ls -la",
      "pwd",
      "env",
      "history",
      "clear",
      'alias ll="ls -la"',
      "ll",
    ],
    multiInstance: false,
  },
};

export const PerformanceOptimized: Story = {
  name: "🚀 Performance Demo",
  args: {
    theme: "solarized-dark",
    commands: ["help", "time ls", "memory usage", "benchmark echo"],
    multiInstance: false,
  },
};
