import type { Meta, StoryObj } from "@storybook/html";

// Simple HTML-based stories ohne TypeScript-Parsing-Probleme
const meta: Meta = {
  title: "WebConsole/Complete System",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["default", "dark", "light", "monokai", "solarized-dark"],
    },
    prompt: {
      control: { type: "text" },
    },
    width: {
      control: { type: "text" },
    },
    height: {
      control: { type: "number" },
    },
  },
};

export default meta;
type Story = StoryObj;

export const CompleteWebConsole: Story = {
  args: {
    theme: "dark",
    prompt: "$ ",
    width: "800px",
    height: 500,
  },
  render: (args) => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "monospace";

    // Header
    const header = document.createElement("h2");
    header.textContent = "WebConsole - Complete Terminal System";
    header.style.marginBottom = "20px";
    header.style.color = "#333";
    container.appendChild(header);

    // Info Panel
    const info = document.createElement("div");
    info.style.marginBottom = "20px";
    info.style.padding = "10px";
    info.style.backgroundColor = "#f5f5f5";
    info.style.borderRadius = "4px";
    info.innerHTML = `
      <h3>Features Implemented:</h3>
      <ul>
        <li>✓ Core VFS with advanced file operations</li>
        <li>✓ Theme System (${args.theme} theme active)</li>
        <li>✓ Plugin Architecture with Git & System commands</li>
        <li>✓ Advanced Parser with variables, glob patterns</li>
        <li>✓ Framework Components (React, Angular, Vue, Svelte)</li>
        <li>✓ Command Registry with extensible handlers</li>
        <li>✓ localStorage-based persistence</li>
      </ul>
    `;
    container.appendChild(info);

    // Console wrapper
    const consoleWrapper = document.createElement("div");
    consoleWrapper.style.border = "1px solid #ccc";
    consoleWrapper.style.borderRadius = "4px";
    consoleWrapper.style.overflow = "hidden";

    // Simulated console output
    const output = document.createElement("div");
    output.style.backgroundColor =
      args.theme === "dark" ? "#1a1a1a" : "#ffffff";
    output.style.color = args.theme === "dark" ? "#ffffff" : "#000000";
    output.style.padding = "15px";
    output.style.fontFamily = "Courier New, monospace";
    output.style.fontSize = "14px";
    output.style.height = args.height + "px";
    output.style.width = args.width;
    output.style.overflowY = "auto";
    output.style.lineHeight = "1.4";

    // Demo commands and output
    output.innerHTML = `
<div style="color: #888;">WebConsole v0.1.0 - Browser-based Terminal</div>
<div style="color: #888;">Type 'help' for available commands</div>
<br>
<div>
  <span style="color: #4CAF50;">${args.prompt}</span>
  <span>help</span>
</div>
<div style="margin-left: 20px; color: #888;">
Available commands:
  help     - Show this help message
  ls       - List directory contents
  cd       - Change directory
  mkdir    - Create directory
  cat      - Display file contents
  echo     - Print text
  pwd      - Show current directory
  clear    - Clear console
  git      - Git version control
  ps       - Show processes
  memory   - Show memory usage
  date     - Show current date/time
  theme    - Change console theme
</div>
<br>
<div>
  <span style="color: #4CAF50;">${args.prompt}</span>
  <span>ls -la</span>
</div>
<div style="margin-left: 20px;">
drwxr-xr-x  1 user  staff   512 Jan 15 14:30 .
drwxr-xr-x  1 user  staff   512 Jan 15 14:25 ..
-rw-r--r--  1 user  staff  1024 Jan 15 14:30 package.json
-rw-r--r--  1 user  staff  2048 Jan 15 14:29 README.md
drwxr-xr-x  1 user  staff   512 Jan 15 14:30 src
drwxr-xr-x  1 user  staff   256 Jan 15 14:25 docs
</div>
<br>
<div>
  <span style="color: #4CAF50;">${args.prompt}</span>
  <span>git status</span>
</div>
<div style="margin-left: 20px;">
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add &lt;file&gt;..." to update what will be committed)

	<span style="color: #ff6b6b;">modified:   src/core/VFS.ts</span>
	<span style="color: #ff6b6b;">modified:   src/console/Parser.ts</span>

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)

	<span style="color: #ff6b6b;">src/plugins/PluginManager.ts</span>

no changes added to commit (use "git add" and/or "git commit -a")
</div>
<br>
<div>
  <span style="color: #4CAF50;">${args.prompt}</span>
  <span>echo "Hello from $USER in $(pwd)"</span>
</div>
<div style="margin-left: 20px;">Hello from user in /home/user/WebConsole</div>
<br>
<div>
  <span style="color: #4CAF50;">${args.prompt}</span>
  <span>memory</span>
</div>
<div style="margin-left: 20px;">
Memory Usage:
  Used: 78 MB
  Total: 512 MB
  Available: 434 MB
</div>
<br>
<div>
  <span style="color: #4CAF50;">${args.prompt}</span>
  <span style="animation: blink 1s infinite;">█</span>
</div>

<style>
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
    `;

    consoleWrapper.appendChild(output);
    container.appendChild(consoleWrapper);

    // Technical details
    const technical = document.createElement("div");
    technical.style.marginTop = "20px";
    technical.style.padding = "15px";
    technical.style.backgroundColor = "#f9f9f9";
    technical.style.borderRadius = "4px";
    technical.style.fontSize = "12px";
    technical.innerHTML = `
      <h4>Technical Implementation:</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <strong>Core Architecture:</strong>
          <ul>
            <li>Kernel-based architecture with event system</li>
            <li>VFS with POSIX-like operations</li>
            <li>Plugin system for extensible commands</li>
            <li>Advanced parser with shell features</li>
            <li>Theme manager with CSS custom properties</li>
          </ul>
        </div>
        <div>
          <strong>Framework Support:</strong>
          <ul>
            <li>Native Web Components</li>
            <li>React hooks & components</li>
            <li>Angular directives & services</li>
            <li>Vue 3 composition API</li>
            <li>Svelte reactive components</li>
          </ul>
        </div>
      </div>

      <strong>Integration Examples:</strong>
      <pre style="background: #fff; padding: 10px; border-radius: 4px; margin-top: 10px;">
// React
&lt;WebConsole theme="${args.theme}" prompt="${args.prompt}" onCommand={handleCommand} /&gt;

// Angular
&lt;web-console [theme]="'${args.theme}'" [prompt]="'${args.prompt}'" (command)="handleCommand($event)"&gt;&lt;/web-console&gt;

// Vue
&lt;WebConsole theme="${args.theme}" prompt="${args.prompt}" @command="handleCommand" /&gt;

// Native Web Component
&lt;web-console-element theme="${args.theme}" prompt="${args.prompt}"&gt;&lt;/web-console-element&gt;
      </pre>
    `;
    container.appendChild(technical);

    return container;
  },
};

export const FrameworkComparison: Story = {
  render: () => {
    const container = document.createElement("div");
    container.style.padding = "20px";

    const title = document.createElement("h2");
    title.textContent = "Framework Integration Comparison";
    container.appendChild(title);

    const frameworks = [
      {
        name: "React",
        code: `import { WebConsole } from '@webconsole/react';

function App() {
  const handleCommand = (cmd, result) => {
    console.log('Command executed:', cmd, result);
  };

  return (
    <WebConsole
      theme="dark"
      prompt="react$ "
      onCommand={handleCommand}
      onReady={(console) => {
        console.executeCommand('echo "React WebConsole ready!"');
      }}
    />
  );
}`,
        features: [
          "TypeScript hooks",
          "Event callbacks",
          "Ref forwarding",
          "Suspense support",
        ],
      },
      {
        name: "Angular",
        code: `import { WebConsoleModule } from '@webconsole/angular';

@Component({
  selector: 'app-root',
  template: \`
    <web-console
      [theme]="'dark'"
      [prompt]="'ng$ '"
      (command)="onCommand($event)"
      (ready)="onReady($event)">
    </web-console>
  \`
})
export class AppComponent {
  onCommand(event: Event) {
    console.log('Command:', event);
  }

  onReady(console: unknown) {
    if (console && typeof console === 'object' && 'executeCommand' in console) {
      (console as { executeCommand: (cmd: string) => void }).executeCommand('echo "Angular WebConsole ready!"');
    }
  }
}`,
        features: [
          "Injectable services",
          "Template bindings",
          "Angular CLI integration",
          "RxJS streams",
        ],
      },
      {
        name: "Vue",
        code: `<template>
  <WebConsole
    theme="dark"
    prompt="vue$ "
    @command="onCommand"
    @ready="onReady"
  />
</template>

<script setup>
import { WebConsole } from '@webconsole/vue';

const onCommand = (cmd, result) => {
  console.log('Command executed:', cmd, result);
};

const onReady = (console) => {
  console.executeCommand('echo "Vue WebConsole ready!"');
};
</script>`,
        features: [
          "Composition API",
          "Reactive props",
          "Template directives",
          "Vite integration",
        ],
      },
      {
        name: "Svelte",
        code: `<script>
  import { WebConsole } from '@webconsole/svelte';

  function handleCommand(event) {
    console.log('Command:', event.detail);
  }

  function handleReady(event) {
    const console = event.detail;
    console.executeCommand('echo "Svelte WebConsole ready!"');
  }
</script>

<WebConsole
  theme="dark"
  prompt="svelte$ "
  on:command={handleCommand}
  on:ready={handleReady}
/>`,
        features: [
          "Reactive assignments",
          "Custom events",
          "Stores integration",
          "SvelteKit support",
        ],
      },
    ];

    frameworks.forEach((framework) => {
      const section = document.createElement("div");
      section.style.marginBottom = "30px";
      section.style.border = "1px solid #e0e0e0";
      section.style.borderRadius = "8px";
      section.style.overflow = "hidden";

      const header = document.createElement("div");
      header.style.backgroundColor = "#f5f5f5";
      header.style.padding = "15px";
      header.style.fontWeight = "bold";
      header.style.fontSize = "18px";
      header.textContent = framework.name;
      section.appendChild(header);

      const content = document.createElement("div");
      content.style.padding = "20px";

      const code = document.createElement("pre");
      code.style.backgroundColor = "#1e1e1e";
      code.style.color = "#ffffff";
      code.style.padding = "15px";
      code.style.borderRadius = "4px";
      code.style.overflow = "auto";
      code.style.fontSize = "13px";
      code.textContent = framework.code;
      content.appendChild(code);

      const features = document.createElement("div");
      features.style.marginTop = "15px";
      features.innerHTML = `
        <strong>Key Features:</strong>
        <ul>
          ${framework.features.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
      `;
      content.appendChild(features);

      section.appendChild(content);
      container.appendChild(section);
    });

    return container;
  },
};

export const PluginSystem: Story = {
  render: () => {
    const container = document.createElement("div");
    container.style.padding = "20px";

    const title = document.createElement("h2");
    title.textContent = "Plugin System Architecture";
    container.appendChild(title);

    const overview = document.createElement("div");
    overview.style.marginBottom = "30px";
    overview.innerHTML = `
      <p>WebConsole features a powerful plugin system that allows developers to extend functionality with custom commands and features.</p>

      <h3>Core Components:</h3>
      <ul>
        <li><strong>PluginManager:</strong> Handles plugin registration, dependency management, and lifecycle</li>
        <li><strong>IPlugin Interface:</strong> Standardized plugin contract with metadata and commands</li>
        <li><strong>Command Handlers:</strong> Extensible command execution with proper context</li>
        <li><strong>Event System:</strong> Plugin communication via kernel events</li>
      </ul>
    `;
    container.appendChild(overview);

    // Example plugin code
    const codeExample = document.createElement("div");
    codeExample.innerHTML = `
      <h3>Example Plugin Implementation:</h3>
      <pre style="background: #1e1e1e; color: #ffffff; padding: 20px; border-radius: 4px; overflow: auto;">
export class CustomPlugin implements IPlugin {
  metadata: PluginMetadata = {
    name: 'custom',
    version: '1.0.0',
    description: 'Custom commands for WebConsole',
    commands: ['weather', 'joke', 'calc']
  };

  private commands = new Map&lt;string, ICommandHandler&gt;();

  async initialize(): Promise&lt;void&gt; {
    this.commands.set('weather', {
      name: 'weather',
      type: CommandType.BUILTIN,
      description: 'Get weather information',
      usage: 'weather [city]',
      execute: async (context) =&gt; {
        const city = context.args[0] || 'Berlin';
        await writeToStream(context.stdout,
          \`Weather in \${city}: 22°C, Sunny\n\`);
        return ExitCode.SUCCESS;
      }
    });

    this.commands.set('calc', {
      name: 'calc',
      type: CommandType.BUILTIN,
      description: 'Simple calculator',
      usage: 'calc &lt;expression&gt;',
      execute: async (context) =&gt; {
        try {
          const expr = context.args.join(' ');
          const result = eval(expr); // Note: Use safe-eval in production
          await writeToStream(context.stdout, \`\${result}\n\`);
          return ExitCode.SUCCESS;
        } catch (error) {
          await writeToStream(context.stderr, \`Error: \${error.message}\n\`);
          return ExitCode.ERROR;
        }
      }
    });
  }

  async cleanup(): Promise&lt;void&gt; {
    this.commands.clear();
  }

  getCommands(): Map&lt;string, ICommandHandler&gt; {
    return this.commands;
  }
}

// Usage
const pluginManager = new PluginManager();
await pluginManager.registerPlugin(new CustomPlugin());
await pluginManager.registerPlugin(new GitPlugin());
await pluginManager.registerPlugin(new SystemPlugin());
      </pre>
    `;
    container.appendChild(codeExample);

    // Built-in plugins
    const plugins = document.createElement("div");
    plugins.innerHTML = `
      <h3>Built-in Plugins:</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px;">
          <h4>Git Plugin</h4>
          <p>Provides git-like version control commands:</p>
          <ul>
            <li><code>git status</code> - Show repository status</li>
            <li><code>git add &lt;files&gt;</code> - Add files to staging</li>
            <li><code>git commit -m "msg"</code> - Commit changes</li>
            <li><code>status</code> - Alias for git status</li>
          </ul>
        </div>
        <div style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px;">
          <h4>System Plugin</h4>
          <p>System monitoring and information:</p>
          <ul>
            <li><code>ps</code> - Show running processes</li>
            <li><code>memory</code> - Display memory usage</li>
            <li><code>date [+format]</code> - Show current date/time</li>
            <li><code>uptime</code> - System uptime information</li>
          </ul>
        </div>
      </div>
    `;
    container.appendChild(plugins);

    return container;
  },
};
