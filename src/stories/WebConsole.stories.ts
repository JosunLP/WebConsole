import "../components/WebConsoleElement.js";

// Story arguments interface
interface WebConsoleArgs {
  prompt: string;
  height: string;
  width: string;
}

// Meta configuration
const meta = {
  title: "Components/WebConsole",
  tags: ["autodocs"],
  render: (args: WebConsoleArgs) => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "#f8f9fa";
    container.style.fontFamily = "Arial, sans-serif";

    const console = document.createElement("web-console") as any;
    console.setAttribute("prompt", args.prompt);
    console.style.height = args.height;
    console.style.width = args.width;
    console.style.display = "block";
    console.style.border = "1px solid #ddd";
    console.style.borderRadius = "6px";
    console.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

    container.appendChild(console);

    return container;
  },
  argTypes: {
    prompt: {
      control: "text",
      description: "The prompt string of the console",
    },
    height: {
      control: "text",
      description: "Height of the console",
    },
    width: {
      control: "text",
      description: "Width of the console",
    },
  },
  args: {
    prompt: "$ ",
    height: "300px",
    width: "100%",
  },
};

export default meta;

// Standard story
export const Default = {
  name: "🖥️ Standard Console",
};

// Custom Prompt
export const CustomPrompt = {
  name: "⚡ Custom Prompt",
  args: {
    prompt: "user@storybook:~$ ",
  },
};

// Large console
export const LargeConsole = {
  name: "📺 Large Console",
  args: {
    height: "500px",
    width: "800px",
  },
};

// Small console
export const SmallConsole = {
  name: "📱 Compact Console",
  args: {
    height: "200px",
    width: "400px",
  },
};

// Interactive demo with test buttons
export const InteractiveDemo = {
  name: "🎮 Interactive Demo",
  render: (args: WebConsoleArgs) => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "#f8f9fa";
    container.style.fontFamily = "Arial, sans-serif";

    // Info box
    const infoBox = document.createElement("div");
    infoBox.style.marginBottom = "20px";
    infoBox.style.padding = "15px";
    infoBox.style.background = "#e3f2fd";
    infoBox.style.border = "1px solid #2196f3";
    infoBox.style.borderRadius = "6px";
    infoBox.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #1976d2;">🎯 Test Commands</h4>
      <div style="font-size: 14px; line-height: 1.5;">
        <code style="background: #fff; padding: 2px 4px; border-radius: 3px;">echo [text]</code> - Output text<br>
        <code style="background: #fff; padding: 2px 4px; border-radius: 3px;">help</code> - Show help<br>
        <code style="background: #fff; padding: 2px 4px; border-radius: 3px;">clear</code> - Clear console<br>
        <code style="background: #fff; padding: 2px 4px; border-radius: 3px;">test</code> - System test
      </div>
    `;

    // Console
    const console = document.createElement("web-console") as any;
    console.setAttribute("prompt", args.prompt);
    console.style.height = args.height;
    console.style.width = args.width;
    console.style.display = "block";
    console.style.border = "1px solid #ddd";
    console.style.borderRadius = "6px";
    console.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

    // Test buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "20px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "12px";
    buttonContainer.style.flexWrap = "wrap";

    const buttons = [
      {
        label: "💬 Echo Test",
        command: "echo Hello from Storybook!",
        color: "#4caf50",
      },
      { label: "❓ Help", command: "help", color: "#2196f3" },
      { label: "🧹 Clear", command: "clear", color: "#ff9800" },
      { label: "🔧 System Test", command: "test", color: "#9c27b0" },
    ];

    buttons.forEach(({ label, command, color }) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.style.padding = "10px 16px";
      button.style.background = color;
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "6px";
      button.style.cursor = "pointer";
      button.style.fontSize = "14px";
      button.style.fontWeight = "500";
      button.style.transition = "all 0.2s";

      button.addEventListener("mouseenter", () => {
        button.style.filter = "brightness(1.1)";
        button.style.transform = "translateY(-1px)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.filter = "brightness(1)";
        button.style.transform = "translateY(0)";
      });

      button.addEventListener("click", async () => {
        if (console.executeCommand) {
          try {
            await console.executeCommand(command);
          } catch (error) {
            console.error("Command failed:", error);
          }
        }
      });

      buttonContainer.appendChild(button);
    });

    container.appendChild(infoBox);
    container.appendChild(console);
    container.appendChild(buttonContainer);

    return container;
  },
  args: {
    prompt: "storybook:~$ ",
    height: "400px",
  },
};

// Pre-filled commands demo
export const PrefilledDemo = {
  name: "🚀 Auto Commands",
  render: (args: WebConsoleArgs) => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "#f8f9fa";

    const console = document.createElement("web-console") as any;
    console.setAttribute("prompt", args.prompt);
    console.style.height = args.height;
    console.style.width = args.width;
    console.style.display = "block";
    console.style.border = "1px solid #ddd";
    console.style.borderRadius = "6px";
    console.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

    container.appendChild(console);

    // Demo commands after short delay
    setTimeout(async () => {
      if (console.executeCommand) {
        try {
          await console.executeCommand(
            "echo 🎉 Welcome to WebConsole Storybook Demo!",
          );
          await new Promise((resolve) => setTimeout(resolve, 800));
          await console.executeCommand("help");
          await new Promise((resolve) => setTimeout(resolve, 800));
          await console.executeCommand(
            "echo 💡 Try typing commands manually...",
          );
        } catch (error) {
          console.error("Demo commands failed:", error);
        }
      }
    }, 1000);

    return container;
  },
  args: {
    prompt: "demo:~$ ",
    height: "350px",
  },
};

// React Story
export const ReactComponent = {
  name: "⚛️ React WebConsole",
  render: (args: WebConsoleArgs) => {
    // Dynamic import to avoid JSX problems
    const container = document.createElement("div");
    container.id = "react-root";
    import("../components/react/WebConsole").then(({ WebConsole }) => {
      const React = require("react");
      const ReactDOM = require("react-dom");
      ReactDOM.render(React.createElement(WebConsole, args), container);
    });
    return container;
  },
  args: {
    prompt: "$ ",
    height: "300px",
    width: "100%",
  },
};

// Angular story (shows web component since Angular integration in Storybook is not trivial)
export const AngularComponent = {
  name: "🅰️ Angular WebConsole",
  render: (args: WebConsoleArgs) => {
    const container = document.createElement("div");
    const console = document.createElement("web-console");
    console.setAttribute("prompt", args.prompt);
    console.style.height = args.height;
    console.style.width = args.width;
    container.appendChild(console);
    return container;
  },
  args: {
    prompt: "$ ",
    height: "300px",
    width: "100%",
  },
};

// Vue Story (shows Web Component since Vue integration in Storybook is not trivial)
export const VueComponent = {
  name: "🟦 Vue WebConsole",
  render: (args: WebConsoleArgs) => {
    const container = document.createElement("div");
    const console = document.createElement("web-console");
    console.setAttribute("prompt", args.prompt);
    console.style.height = args.height;
    console.style.width = args.width;
    container.appendChild(console);
    return container;
  },
  args: {
    prompt: "$ ",
    height: "300px",
    width: "100%",
  },
};

// Svelte Story (shows Web Component since Svelte integration in Storybook is not trivial)
export const SvelteComponent = {
  name: "🟩 Svelte WebConsole",
  render: (args: WebConsoleArgs) => {
    const container = document.createElement("div");
    const console = document.createElement("web-console");
    console.setAttribute("prompt", args.prompt);
    console.style.height = args.height;
    console.style.width = args.width;
    container.appendChild(console);
    return container;
  },
  args: {
    prompt: "$ ",
    height: "300px",
    width: "100%",
  },
};
