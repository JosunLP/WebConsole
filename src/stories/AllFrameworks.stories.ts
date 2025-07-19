import type { Meta, StoryObj } from "@storybook/html";
import { WebConsoleElement } from "../components/WebConsoleElement.js";

// Make sure the custom element is registered
if (!customElements.get("web-console")) {
  customElements.define("web-console", WebConsoleElement);
}

const meta: Meta = {
  title: "Framework Components/All Frameworks",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "WebConsole components for all supported frameworks.",
      },
    },
  },
  argTypes: {
    prompt: {
      control: "text",
      description: "The command prompt character",
    },
    theme: {
      control: { type: "select" },
      options: [
        "default",
        "windows-terminal",
        "monokai",
        "solarized-dark",
        "light",
      ],
      description: "The theme to use",
    },
    width: {
      control: "text",
      description: "Width of the console",
    },
    height: {
      control: "number",
      description: "Height of the console",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NativeWebComponent: Story = {
  args: {
    prompt: "$ ",
    theme: "default",
    width: "600px",
    height: 400,
  },
  render: (args) => {
    const element = document.createElement("web-console");
    element.setAttribute("prompt", args.prompt || "$ ");
    element.setAttribute("theme", args.theme || "default");
    element.style.width = args.width || "600px";
    element.style.height = `${args.height || 400}px`;

    return element;
  },
};

export const ReactComponentExample: Story = {
  args: {
    prompt: "$ ",
    theme: "windows-terminal",
    width: "700px",
    height: 500,
  },
  render: (args) => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="padding: 16px; border: 2px dashed #ccc; border-radius: 8px;">
        <h3>React Component</h3>
        <p>Usage:</p>
        <pre><code>import { WebConsole } from 'web-console/react';

function App() {
  return (
    &lt;WebConsole
      prompt="${args.prompt}"
      theme="${args.theme}"
      width="${args.width}"
      height={${args.height}}
      onCommand={(cmd, result) => console.log(cmd, result)}
      onReady={(console) => console.log('Console ready')}
    /&gt;
  );
}</code></pre>
        <div style="margin-top: 16px;">
          <web-console
            prompt="${args.prompt}"
            theme="${args.theme}"
            style="width: ${args.width}; height: ${args.height}px;">
          </web-console>
        </div>
      </div>
    `;
    return container;
  },
};

export const AngularComponentExample: Story = {
  args: {
    prompt: "ng$ ",
    theme: "monokai",
    width: "600px",
    height: 450,
  },
  render: (args) => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="padding: 16px; border: 2px dashed #ccc; border-radius: 8px;">
        <h3>Angular Component</h3>
        <p>Usage:</p>
        <pre><code>// app.module.ts
import { WebConsoleModule } from 'web-console/angular';

@NgModule({
  imports: [WebConsoleModule],
  // ...
})
export class AppModule {}

// app.component.html
&lt;web-console
  prompt="${args.prompt}"
  theme="${args.theme}"
  [width]="'${args.width}'"
  [height]="${args.height}"
  (command)="onCommand($event)"
  (ready)="onReady($event)"&gt;
&lt;/web-console&gt;</code></pre>
        <div style="margin-top: 16px;">
          <web-console
            prompt="${args.prompt}"
            theme="${args.theme}"
            style="width: ${args.width}; height: ${args.height}px;">
          </web-console>
        </div>
      </div>
    `;
    return container;
  },
};

export const VueComponentExample: Story = {
  args: {
    prompt: "vue$ ",
    theme: "solarized-dark",
    width: "650px",
    height: 400,
  },
  render: (args) => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="padding: 16px; border: 2px dashed #ccc; border-radius: 8px;">
        <h3>Vue Component</h3>
        <p>Usage:</p>
        <pre><code>&lt;template&gt;
  &lt;WebConsole
    prompt="${args.prompt}"
    theme="${args.theme}"
    width="${args.width}"
    :height="${args.height}"
    @command="onCommand"
    @ready="onReady"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { WebConsole } from 'web-console/vue';

const onCommand = (event) => console.log(event);
const onReady = (console) => console.log('Console ready');
&lt;/script&gt;</code></pre>
        <div style="margin-top: 16px;">
          <web-console
            prompt="${args.prompt}"
            theme="${args.theme}"
            style="width: ${args.width}; height: ${args.height}px;">
          </web-console>
        </div>
      </div>
    `;
    return container;
  },
};

export const SvelteComponentExample: Story = {
  args: {
    prompt: "svelte$ ",
    theme: "light",
    width: "600px",
    height: 350,
  },
  render: (args) => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="padding: 16px; border: 2px dashed #ccc; border-radius: 8px;">
        <h3>Svelte Component</h3>
        <p>Usage:</p>
        <pre><code>&lt;script lang="ts"&gt;
  import { WebConsole } from 'web-console/svelte';

  const handleCommand = (event) => console.log(event.detail);
  const handleReady = (event) => console.log('Console ready');
&lt;/script&gt;

&lt;WebConsole
  prompt="${args.prompt}"
  theme="${args.theme}"
  width="${args.width}"
  height={${args.height}}
  on:command={handleCommand}
  on:ready={handleReady}
/&gt;</code></pre>
        <div style="margin-top: 16px;">
          <web-console
            prompt="${args.prompt}"
            theme="${args.theme}"
            style="width: ${args.width}; height: ${args.height}px;">
          </web-console>
        </div>
      </div>
    `;
    return container;
  },
};

export const AllThemes: Story = {
  args: {
    prompt: "$ ",
    width: "500px",
    height: 300,
  },
  render: (args) => {
    const container = document.createElement("div");
    const themes = [
      "default",
      "windows-terminal",
      "monokai",
      "solarized-dark",
      "light",
    ];

    container.style.display = "grid";
    container.style.gridTemplateColumns =
      "repeat(auto-fit, minmax(480px, 1fr))";
    container.style.gap = "16px";
    container.style.padding = "16px";

    themes.forEach((theme) => {
      const themeContainer = document.createElement("div");
      themeContainer.innerHTML = `
        <h4>${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</h4>
        <web-console
          prompt="${args.prompt}"
          theme="${theme}"
          style="width: ${args.width}; height: ${args.height}px;">
        </web-console>
      `;
      container.appendChild(themeContainer);
    });

    return container;
  },
};

export const InteractiveDemo: Story = {
  args: {
    prompt: "$ ",
    theme: "windows-terminal",
    width: "800px",
    height: 500,
  },
  render: (args) => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="padding: 16px;">
        <h3>Interactive Demo</h3>
        <p>Try these commands:</p>
        <ul>
          <li><code>help</code> - Show available commands</li>
          <li><code>echo "Hello World"</code> - Display text</li>
          <li><code>theme list</code> - Show available themes</li>
          <li><code>theme set monokai</code> - Change theme</li>
          <li><code>pwd</code> - Show current directory</li>
          <li><code>ls</code> - List directory contents</li>
          <li><code>clear</code> - Clear the console</li>
        </ul>
        <div style="margin-top: 16px;">
          <web-console
            prompt="${args.prompt}"
            theme="${args.theme}"
            style="width: ${args.width}; height: ${args.height}px;">
          </web-console>
        </div>
      </div>
    `;
    return container;
  },
};
