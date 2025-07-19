import type { Meta, StoryObj } from "@storybook/react";
import { WebConsole } from "../components/react/WebConsoleNew.js";

const meta: Meta<typeof WebConsole> = {
  title: "Components/React WebConsole",
  component: WebConsole,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A complete React WebConsole component with theme support.",
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

export const Default: Story = {
  args: {
    prompt: "$ ",
    theme: "default",
    width: "600px",
    height: 400,
  },
};

export const WindowsTerminal: Story = {
  args: {
    prompt: "PS C:\\> ",
    theme: "windows-terminal",
    width: "700px",
    height: 500,
  },
};

export const Monokai: Story = {
  args: {
    prompt: "➜ ",
    theme: "monokai",
    width: "600px",
    height: 400,
  },
};

export const SolarizedDark: Story = {
  args: {
    prompt: "$ ",
    theme: "solarized-dark",
    width: "600px",
    height: 400,
  },
};

export const Light: Story = {
  args: {
    prompt: "$ ",
    theme: "light",
    width: "600px",
    height: 400,
  },
};

export const Compact: Story = {
  args: {
    prompt: "> ",
    theme: "default",
    width: "400px",
    height: 250,
  },
};

export const Interactive: Story = {
  args: {
    prompt: "$ ",
    theme: "windows-terminal",
    width: "800px",
    height: 600,
    onCommand: (command, result) => {
      console.log("Command executed:", command, result);
    },
    onReady: (console) => {
      console.log("Console ready:", console);
    },
  },
};
