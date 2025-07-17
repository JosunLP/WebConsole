// WebConsole System Demonstration - Complete Implementation

const meta = {
  title: 'WebConsole/Complete System Demo',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['default', 'dark', 'light', 'monokai', 'solarized-dark'],
    },
    prompt: {
      control: { type: 'text' },
    },
    width: {
      control: { type: 'text' },
    },
    height: {
      control: { type: 'number' },
    },
  },
};

export default meta;

export const CompleteWebConsole = {
  args: {
    theme: 'dark',
    prompt: '$ ',
    width: '800px',
    height: 500,
  },
  render: (args) => {
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'system-ui, sans-serif';

    // Header
    const header = document.createElement('h1');
    header.textContent = 'WebConsole - Browser-Based Terminal System';
    header.style.marginBottom = '20px';
    header.style.color = '#1a1a1a';
    header.style.borderBottom = '2px solid #4CAF50';
    header.style.paddingBottom = '10px';
    container.appendChild(header);

    // Feature Overview
    const features = document.createElement('div');
    features.style.marginBottom = '30px';
    features.style.padding = '20px';
    features.style.backgroundColor = '#f8f9fa';
    features.style.borderRadius = '8px';
    features.style.border = '1px solid #e9ecef';
    features.innerHTML = `
      <h2 style="margin-top: 0; color: #2c3e50;">✅ Implemented Features</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div>
          <h3 style="color: #27ae60; margin-bottom: 10px;">🏗️ Core Architecture</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Kernel-based event system</li>
            <li>VFS with POSIX-like operations</li>
            <li>Advanced command parser</li>
            <li>Plugin management system</li>
            <li>State management & persistence</li>
          </ul>
        </div>
        <div>
          <h3 style="color: #3498db; margin-bottom: 10px;">🎨 UI & Theming</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Multiple built-in themes</li>
            <li>CSS custom properties</li>
            <li>Responsive design</li>
            <li>Dark/Light mode support</li>
            <li>Terminal-like animations</li>
          </ul>
        </div>
        <div>
          <h3 style="color: #e74c3c; margin-bottom: 10px;">🧩 Framework Support</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Native Web Components</li>
            <li>React Hooks & Components</li>
            <li>Angular Directives</li>
            <li>Vue 3 Composition API</li>
            <li>Svelte Reactive Components</li>
          </ul>
        </div>
        <div>
          <h3 style="color: #9b59b6; margin-bottom: 10px;">⚡ Advanced Features</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Variable substitution ($VAR)</li>
            <li>Command substitution $(cmd)</li>
            <li>Glob pattern expansion</li>
            <li>Pipe & redirection support</li>
            <li>Environment variables</li>
          </ul>
        </div>
      </div>
    `;
    container.appendChild(features);

    // Interactive Console Demo
    const consoleSection = document.createElement('div');
    consoleSection.style.marginBottom = '30px';

    const consoleTitle = document.createElement('h2');
    consoleTitle.textContent = '🖥️ Interactive Console Demo';
    consoleTitle.style.color = '#2c3e50';
    consoleSection.appendChild(consoleTitle);

    const consoleWrapper = document.createElement('div');
    consoleWrapper.style.border = '2px solid #34495e';
    consoleWrapper.style.borderRadius = '8px';
    consoleWrapper.style.overflow = 'hidden';
    consoleWrapper.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

    // Console output simulation
    const output = document.createElement('div');
    output.style.backgroundColor =
      args.theme === 'dark' ? '#1a1a1a' : '#ffffff';
    output.style.color = args.theme === 'dark' ? '#ffffff' : '#000000';
    output.style.padding = '20px';
    output.style.fontFamily = "Consolas, 'Courier New', monospace";
    output.style.fontSize = '14px';
    output.style.height = args.height + 'px';
    output.style.width = args.width;
    output.style.overflowY = 'auto';
    output.style.lineHeight = '1.5';

    output.innerHTML = `
<div style="color: #4CAF50; font-weight: bold; border-bottom: 1px solid #555; padding-bottom: 10px; margin-bottom: 15px;">
WebConsole v0.1.0 - Browser Terminal Implementation
Type 'help' for available commands or try the examples below
</div>

<div style="margin-bottom: 15px;">
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="color: #61dafb;">help</span>
</div>
<div style="margin-left: 20px; color: #888; margin-bottom: 15px;">
<strong>📋 Available Commands:</strong>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
  <div>
    <strong style="color: #4CAF50;">File Operations:</strong><br>
    • ls, cat, mkdir, cp, mv<br>
    • pwd, cd, touch, rm<br>

    <strong style="color: #2196F3;">System Info:</strong><br>
    • ps, memory, date, uptime<br>
    • whoami, uname, env
  </div>
  <div>
    <strong style="color: #FF9800;">Development:</strong><br>
    • git status, git add, git commit<br>
    • npm, node, python<br>

    <strong style="color: #9C27B0;">Utilities:</strong><br>
    • echo, clear, history<br>
    • alias, export, which
  </div>
</div>
</div>

<div style="margin-bottom: 15px;">
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="color: #61dafb;">ls -la</span>
</div>
<div style="margin-left: 20px; margin-bottom: 15px; font-family: monospace;">
<span style="color: #888;">total 24</span>
<div>drwxr-xr-x  5 user staff  160 Jan 15 14:30 <span style="color: #2196F3; font-weight: bold;">.</span></div>
<div>drwxr-xr-x  3 user staff   96 Jan 15 14:25 <span style="color: #2196F3; font-weight: bold;">..</span></div>
<div>-rw-r--r--  1 user staff 1024 Jan 15 14:30 <span style="color: #4CAF50;">package.json</span></div>
<div>-rw-r--r--  1 user staff 2048 Jan 15 14:29 <span style="color: #4CAF50;">README.md</span></div>
<div>drwxr-xr-x  8 user staff  256 Jan 15 14:30 <span style="color: #2196F3; font-weight: bold;">src/</span></div>
<div>drwxr-xr-x  3 user staff  128 Jan 15 14:25 <span style="color: #2196F3; font-weight: bold;">docs/</span></div>
</div>

<div style="margin-bottom: 15px;">
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="color: #61dafb;">git status</span>
</div>
<div style="margin-left: 20px; margin-bottom: 15px;">
<div style="color: #4CAF50;">On branch main</div>
<div>Your branch is up to date with 'origin/main'.</div>
<br>
<div>Changes not staged for commit:</div>
<div style="color: #888;">  (use "git add &lt;file&gt;..." to update what will be committed)</div>
<br>
<div style="margin-left: 10px;">
  <span style="color: #FF5722;">modified:</span>   <span style="color: #FF9800;">src/core/VFS.ts</span><br>
  <span style="color: #FF5722;">modified:</span>   <span style="color: #FF9800;">src/console/Parser.ts</span><br>
</div>
<br>
<div>Untracked files:</div>
<div style="color: #888;">  (use "git add &lt;file&gt;..." to include in what will be committed)</div>
<br>
<div style="margin-left: 10px;">
  <span style="color: #F44336;">src/plugins/PluginManager.ts</span>
</div>
</div>

<div style="margin-bottom: 15px;">
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="color: #61dafb;">echo "Hello from \\$USER in \\$(pwd)"</span>
</div>
<div style="margin-left: 20px; margin-bottom: 15px; color: #FFC107;">
Hello from user in /home/user/WebConsole
</div>

<div style="margin-bottom: 15px;">
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="color: #61dafb;">memory</span>
</div>
<div style="margin-left: 20px; margin-bottom: 15px;">
<div style="color: #2196F3; font-weight: bold;">📊 Memory Usage:</div>
<div>  Used: <span style="color: #FF9800;">78 MB</span></div>
<div>  Total: <span style="color: #4CAF50;">512 MB</span></div>
<div>  Available: <span style="color: #4CAF50;">434 MB</span></div>
<div>  Usage: <span style="background: linear-gradient(90deg, #4CAF50 0%, #4CAF50 15%, #333 15%, #333 100%); color: white; padding: 2px 5px; border-radius: 3px;">████░░░░░░░░░░░░░░░░</span> 15.2%</div>
</div>

<div style="margin-bottom: 15px;">
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="color: #61dafb;">theme ${args.theme === 'dark' ? 'light' : 'dark'}</span>
</div>
<div style="margin-left: 20px; margin-bottom: 15px; color: #4CAF50;">
✓ Theme switched to ${args.theme === 'dark' ? 'light' : 'dark'} mode
</div>

<div>
  <span style="color: #4CAF50; font-weight: bold;">${args.prompt}</span>
  <span style="animation: blink 1s infinite; background: #4CAF50; color: black; padding: 0 2px;">█</span>
</div>

<style>
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
    `;

    consoleWrapper.appendChild(output);
    consoleSection.appendChild(consoleWrapper);
    container.appendChild(consoleSection);

    // Framework Integration Examples
    const integrationSection = document.createElement('div');
    integrationSection.innerHTML = `
      <h2 style="color: #2c3e50; margin-bottom: 20px;">🔧 Framework Integration Examples</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">

        <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #61dafb; color: white; padding: 15px; font-weight: bold;">
            ⚛️ React Integration
          </div>
          <div style="padding: 20px;">
            <pre style="background: #1e1e1e; color: #ffffff; padding: 15px; border-radius: 4px; overflow: auto; margin: 0; font-size: 12px;">import { WebConsole } from '@webconsole/react';

function App() {
  const handleCommand = (cmd, result) => {
    console.log('Command executed:', cmd);
  };

  return (
    &lt;WebConsole
      theme="${args.theme}"
      prompt="${args.prompt}"
      onCommand={handleCommand}
      onReady={(console) => {
        console.executeCommand('echo "Ready!"');
      }}
    /&gt;
  );
}</pre>
          </div>
        </div>

        <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #dd1b16; color: white; padding: 15px; font-weight: bold;">
            🅰️ Angular Integration
          </div>
          <div style="padding: 20px;">
            <pre style="background: #1e1e1e; color: #ffffff; padding: 15px; border-radius: 4px; overflow: auto; margin: 0; font-size: 12px;">import { WebConsoleModule } from '@webconsole/angular';

@Component({
  template: \`
    &lt;web-console
      [theme]="'${args.theme}'"
      [prompt]="'${args.prompt}'"
      (command)="onCommand($event)"&gt;
    &lt;/web-console&gt;
  \`
})
export class AppComponent {
  onCommand(event: any) {
    console.log('Command:', event);
  }
}</pre>
          </div>
        </div>

        <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #4fc08d; color: white; padding: 15px; font-weight: bold;">
            💚 Vue Integration
          </div>
          <div style="padding: 20px;">
            <pre style="background: #1e1e1e; color: #ffffff; padding: 15px; border-radius: 4px; overflow: auto; margin: 0; font-size: 12px;">&lt;template&gt;
  &lt;WebConsole
    theme="${args.theme}"
    prompt="${args.prompt}"
    @command="onCommand"
    @ready="onReady"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { WebConsole } from '@webconsole/vue';

const onCommand = (cmd, result) => {
  console.log('Command:', cmd);
};
&lt;/script&gt;</pre>
          </div>
        </div>

        <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #ff3e00; color: white; padding: 15px; font-weight: bold;">
            🔥 Svelte Integration
          </div>
          <div style="padding: 20px;">
            <pre style="background: #1e1e1e; color: #ffffff; padding: 15px; border-radius: 4px; overflow: auto; margin: 0; font-size: 12px;">&lt;script&gt;
  import { WebConsole } from '@webconsole/svelte';

  function handleCommand(event) {
    console.log('Command:', event.detail);
  }
&lt;/script&gt;

&lt;WebConsole
  theme="${args.theme}"
  prompt="${args.prompt}"
  on:command={handleCommand}
/&gt;</pre>
          </div>
        </div>

      </div>
    `;
    container.appendChild(integrationSection);

    // Plugin Architecture
    const pluginSection = document.createElement('div');
    pluginSection.style.marginTop = '40px';
    pluginSection.innerHTML = `
      <h2 style="color: #2c3e50; margin-bottom: 20px;">🧩 Plugin Architecture</h2>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          WebConsole features a sophisticated plugin system that allows developers to extend functionality
          with custom commands, themes, and integrations.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px;">
          <div style="text-align: center; padding: 15px;">
            <div style="font-size: 2em; margin-bottom: 10px;">📦</div>
            <h4 style="margin: 0 0 10px 0;">Plugin Manager</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">Handles registration, dependencies, and lifecycle</p>
          </div>
          <div style="text-align: center; padding: 15px;">
            <div style="font-size: 2em; margin-bottom: 10px;">⚡</div>
            <h4 style="margin: 0 0 10px 0;">Command Handlers</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">Extensible command execution with context</p>
          </div>
          <div style="text-align: center; padding: 15px;">
            <div style="font-size: 2em; margin-bottom: 10px;">🔄</div>
            <h4 style="margin: 0 0 10px 0;">Event System</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">Plugin communication via kernel events</p>
          </div>
          <div style="text-align: center; padding: 15px;">
            <div style="font-size: 2em; margin-bottom: 10px;">🎨</div>
            <h4 style="margin: 0 0 10px 0;">Theme Integration</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">Custom themes and visual enhancements</p>
          </div>
        </div>

        <h3 style="color: #27ae60; margin-bottom: 15px;">Built-in Plugins:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
            <h4 style="color: #e74c3c; margin: 0 0 10px 0;">🔧 Git Plugin</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              <li>git status, add, commit</li>
              <li>Branch management</li>
              <li>Repository information</li>
              <li>Git aliases and shortcuts</li>
            </ul>
          </div>
          <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
            <h4 style="color: #3498db; margin: 0 0 10px 0;">⚙️ System Plugin</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Process monitoring (ps)</li>
              <li>Memory usage tracking</li>
              <li>Date/time utilities</li>
              <li>System information</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    container.appendChild(pluginSection);

    return container;
  },
};

export const ArchitectureOverview = {
  render: () => {
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'system-ui, sans-serif';

    const title = document.createElement('h1');
    title.textContent = 'WebConsole Architecture Overview';
    title.style.color = '#2c3e50';
    title.style.borderBottom = '3px solid #3498db';
    title.style.paddingBottom = '10px';
    container.appendChild(title);

    // Architecture diagram
    const diagram = document.createElement('div');
    diagram.innerHTML = `
      <h2 style="color: #34495e;">🏗️ System Architecture</h2>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #dee2e6; margin: 20px 0;">
        <div style="text-align: center; font-family: monospace; font-size: 12px; line-height: 1.6;">
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #1976d2; font-size: 14px;">🌐 Framework Layer</strong><br>
            <div style="display: flex; justify-content: space-around; margin-top: 10px;">
              <span style="background: #61dafb; color: white; padding: 5px 10px; border-radius: 4px;">React</span>
              <span style="background: #dd1b16; color: white; padding: 5px 10px; border-radius: 4px;">Angular</span>
              <span style="background: #4fc08d; color: white; padding: 5px 10px; border-radius: 4px;">Vue</span>
              <span style="background: #ff3e00; color: white; padding: 5px 10px; border-radius: 4px;">Svelte</span>
              <span style="background: #663399; color: white; padding: 5px 10px; border-radius: 4px;">Web Components</span>
            </div>
          </div>

          <div style="margin: 20px 0; color: #666;">⬇️ Component Interface ⬇️</div>

          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #f57c00; font-size: 14px;">🖥️ Console Interface Layer</strong><br>
            <div style="margin-top: 10px;">
              WebConsoleElement | ConsoleInstance | Event Handling
            </div>
          </div>

          <div style="margin: 20px 0; color: #666;">⬇️ Core API ⬇️</div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #388e3c; font-size: 14px;">⚙️ Kernel & Core Services</strong><br>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 10px;">
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #c8e6c9;">Kernel</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #c8e6c9;">VFS</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #c8e6c9;">Parser</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #c8e6c9;">Themes</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #c8e6c9;">State</div>
            </div>
          </div>

          <div style="margin: 20px 0; color: #666;">⬇️ Plugin Interface ⬇️</div>

          <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #7b1fa2; font-size: 14px;">🧩 Plugin System</strong><br>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-top: 10px;">
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #e1bee7;">Git Plugin</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #e1bee7;">System Plugin</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #e1bee7;">Custom Plugins</div>
            </div>
          </div>

          <div style="margin: 20px 0; color: #666;">⬇️ Storage Interface ⬇️</div>

          <div style="background: #fce4ec; padding: 15px; border-radius: 8px;">
            <strong style="color: #c2185b; font-size: 14px;">💾 Storage & Persistence</strong><br>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 10px;">
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #f8bbd9;">LocalStorage</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #f8bbd9;">Memory</div>
              <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #f8bbd9;">IndexedDB</div>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(diagram);

    // Technical details
    const technical = document.createElement('div');
    technical.innerHTML = `
      <h2 style="color: #34495e;">📋 Technical Implementation Details</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-top: 20px;">

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2980b9; margin-top: 0;">🔧 Core Technologies</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ TypeScript for type safety</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ ES2022 modules with tree-shaking</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Web Streams API for I/O</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ CSS Custom Properties for theming</li>
            <li style="padding: 8px 0;">✓ Event-driven architecture</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #27ae60; margin-top: 0;">📁 File System Features</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ POSIX-compliant operations</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Path resolution & mounting</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Symbolic links support</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Permission system</li>
            <li style="padding: 8px 0;">✓ Multiple storage providers</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #e74c3c; margin-top: 0;">⚡ Parser Capabilities</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Variable substitution ($VAR)</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Command substitution $(cmd)</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Glob pattern expansion</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Pipes & redirections</li>
            <li style="padding: 8px 0;">✓ Tilde expansion (~)</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #9b59b6; margin-top: 0;">🎨 Theme System</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Hot-swappable themes</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ CSS custom properties</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Dark/Light mode detection</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Terminal color palette</li>
            <li style="padding: 8px 0;">✓ Animation & transitions</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #f39c12; margin-top: 0;">🔌 Plugin Architecture</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Dependency management</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Lifecycle hooks</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Command registration</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Event system integration</li>
            <li style="padding: 8px 0;">✓ Hot-loading support</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #34495e; margin-top: 0;">🚀 Performance</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Lazy loading modules</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Virtual scrolling for output</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Efficient DOM updates</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">✓ Memory management</li>
            <li style="padding: 8px 0;">✓ Web Workers for heavy tasks</li>
          </ul>
        </div>

      </div>
    `;
    container.appendChild(technical);

    // Usage examples
    const usage = document.createElement('div');
    usage.style.marginTop = '40px';
    usage.innerHTML = `
      <h2 style="color: #34495e;">📖 Integration Guide</h2>

      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border: 1px solid #e9ecef;">
        <h3 style="color: #2c3e50; margin-top: 0;">Quick Start</h3>

        <div style="background: #1e1e1e; color: #ffffff; padding: 20px; border-radius: 6px; margin: 15px 0; font-family: monospace; font-size: 14px;">
<span style="color: #6a9955;">// Install the package</span>
<span style="color: #4fc1ff;">npm</span> install @webconsole/core

<span style="color: #6a9955;">// Basic usage with Web Components</span>
<span style="color: #4fc1ff;">import</span> <span style="color: #9cdcfe;">'@webconsole/core'</span>;

<span style="color: #6a9955;">// In your HTML</span>
&lt;<span style="color: #4fc1ff;">web-console-element</span>
  <span style="color: #9cdcfe;">theme</span>=<span style="color: #ce9178;">"dark"</span>
  <span style="color: #9cdcfe;">prompt</span>=<span style="color: #ce9178;">"$ "</span>&gt;
&lt;/<span style="color: #4fc1ff;">web-console-element</span>&gt;

<span style="color: #6a9955;">// Programmatic usage</span>
<span style="color: #4fc1ff;">const</span> <span style="color: #9cdcfe;">kernel</span> = <span style="color: #4fc1ff;">await</span> <span style="color: #dcdcaa;">Kernel</span>.<span style="color: #dcdcaa;">getInstance</span>();
<span style="color: #4fc1ff;">await</span> <span style="color: #9cdcfe;">kernel</span>.<span style="color: #dcdcaa;">start</span>();

<span style="color: #4fc1ff;">const</span> <span style="color: #9cdcfe;">console</span> = <span style="color: #4fc1ff;">await</span> <span style="color: #9cdcfe;">kernel</span>.<span style="color: #dcdcaa;">createConsole</span>({
  <span style="color: #9cdcfe;">theme</span>: <span style="color: #ce9178;">'dark'</span>,
  <span style="color: #9cdcfe;">prompt</span>: <span style="color: #ce9178;">'$ '</span>
});
        </div>

        <h3 style="color: #2c3e50;">Advanced Configuration</h3>

        <div style="background: #1e1e1e; color: #ffffff; padding: 20px; border-radius: 6px; margin: 15px 0; font-family: monospace; font-size: 14px;">
<span style="color: #6a9955;">// Custom plugin registration</span>
<span style="color: #4fc1ff;">import</span> { <span style="color: #9cdcfe;">PluginManager</span>, <span style="color: #9cdcfe;">GitPlugin</span>, <span style="color: #9cdcfe;">SystemPlugin</span> } <span style="color: #4fc1ff;">from</span> <span style="color: #ce9178;">'@webconsole/plugins'</span>;

<span style="color: #4fc1ff;">const</span> <span style="color: #9cdcfe;">pluginManager</span> = <span style="color: #4fc1ff;">new</span> <span style="color: #dcdcaa;">PluginManager</span>();
<span style="color: #4fc1ff;">await</span> <span style="color: #9cdcfe;">pluginManager</span>.<span style="color: #dcdcaa;">registerPlugin</span>(<span style="color: #4fc1ff;">new</span> <span style="color: #dcdcaa;">GitPlugin</span>());
<span style="color: #4fc1ff;">await</span> <span style="color: #9cdcfe;">pluginManager</span>.<span style="color: #dcdcaa;">registerPlugin</span>(<span style="color: #4fc1ff;">new</span> <span style="color: #dcdcaa;">SystemPlugin</span>());

<span style="color: #6a9955;">// Custom theme registration</span>
<span style="color: #4fc1ff;">const</span> <span style="color: #9cdcfe;">themeManager</span> = <span style="color: #9cdcfe;">kernel</span>.<span style="color: #dcdcaa;">getThemeManager</span>();
<span style="color: #9cdcfe;">themeManager</span>.<span style="color: #dcdcaa;">registerTheme</span>(<span style="color: #ce9178;">'custom'</span>, {
  <span style="color: #9cdcfe;">name</span>: <span style="color: #ce9178;">'Custom Theme'</span>,
  <span style="color: #9cdcfe;">colors</span>: {
    <span style="color: #9cdcfe;">primary</span>: <span style="color: #ce9178;">'#007acc'</span>,
    <span style="color: #9cdcfe;">background</span>: <span style="color: #ce9178;">'#1e1e1e'</span>,
    <span style="color: #9cdcfe;">text</span>: <span style="color: #ce9178;">'#ffffff'</span>
  }
});
        </div>
      </div>
    `;
    container.appendChild(usage);

    return container;
  },
};
