import { kernel } from "../core/Kernel.js";

// Core-System Test Interface
interface CoreSystemArgs {
  autoStart: boolean;
  showLogs: boolean;
}

// Meta configuration
const meta = {
  title: "Core/System Tests",
  tags: ["autodocs"],
  render: (args: CoreSystemArgs) => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "#f8f9fa";
    container.style.fontFamily = "monospace";

    // Header
    const header = document.createElement("h3");
    header.textContent = "🔧 WebConsole Core System Tests";
    header.style.margin = "0 0 20px 0";
    header.style.color = "#333";

    // Log-Container
    const logContainer = document.createElement("div");
    logContainer.style.background = "#000";
    logContainer.style.color = "#0f0";
    logContainer.style.padding = "15px";
    logContainer.style.borderRadius = "6px";
    logContainer.style.fontFamily = "monospace";
    logContainer.style.fontSize = "14px";
    logContainer.style.height = "300px";
    logContainer.style.overflowY = "auto";
    logContainer.style.marginBottom = "20px";

    // Button-Container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "12px";
    buttonContainer.style.flexWrap = "wrap";

    const log = (message: string, color = "#0f0") => {
      const timestamp = new Date().toLocaleTimeString();
      const logLine = document.createElement("div");
      logLine.style.color = color;
      logLine.innerHTML = `[${timestamp}] ${message}`;
      logContainer.appendChild(logLine);
      logContainer.scrollTop = logContainer.scrollHeight;
    };

    const createButton = (
      label: string,
      onClick: () => Promise<void>,
      color = "#007bff",
    ) => {
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

      button.addEventListener("click", async () => {
        button.disabled = true;
        button.style.opacity = "0.6";
        try {
          await onClick();
        } catch (error) {
          log(`❌ Error: ${error}`, "#ff4444");
        } finally {
          button.disabled = false;
          button.style.opacity = "1";
        }
      });

      return button;
    };

    // Test functions
    const testKernelStart = async () => {
      log("🚀 Starting Kernel...");
      await kernel.start();
      log("✅ Kernel started successfully");
    };

    const testKernelStop = async () => {
      log("🛑 Stopping Kernel...");
      await kernel.shutdown();
      log("✅ Kernel stopped successfully");
    };

    const testCreateConsole = async () => {
      log("📱 Creating console instance...");
      await kernel.createConsole({ prompt: "test:~$ " });
      log(`✅ Console created successfully`);
    };

    const testVFS = async () => {
      log("💾 Testing VFS operations...");
      const vfs = kernel.getVFS();
      log("📁 Testing path operations...");
      const testPath = vfs.resolve("/test/hello.txt");
      log(`📄 Resolved path: ${testPath}`);
      log("✅ VFS basic tests completed");
    };

    const testCommands = async () => {
      log("⚡ Testing command execution...");
      const console = await kernel.createConsole({ prompt: "cmd:~$ " });

      const commands = ["echo Hello World!", "help", "test"];
      for (const cmd of commands) {
        log(`> ${cmd}`);
        const result = await console.execute(cmd);
        log(`  Exit Code: ${result.exitCode}`, "#ffff00");
      }
      log("✅ Command tests completed");
    };

    const runAllTests = async () => {
      log("🧪 Running full test suite...", "#00ffff");
      await testKernelStart();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await testVFS();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await testCreateConsole();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await testCommands();
      log("🎉 All tests completed successfully!", "#00ff00");
    };

    // Create buttons
    const buttons = [
      { label: "🚀 Start Kernel", action: testKernelStart, color: "#4caf50" },
      { label: "🛑 Stop Kernel", action: testKernelStop, color: "#f44336" },
      {
        label: "📱 Create Console",
        action: testCreateConsole,
        color: "#2196f3",
      },
      { label: "💾 Test VFS", action: testVFS, color: "#ff9800" },
      { label: "⚡ Test Commands", action: testCommands, color: "#9c27b0" },
      { label: "🧪 Run All Tests", action: runAllTests, color: "#00bcd4" },
    ];

    buttons.forEach(({ label, action, color }) => {
      const button = createButton(label, action, color);
      buttonContainer.appendChild(button);
    });

    // Clear-Button
    const clearButton = createButton(
      "🧹 Clear Log",
      async () => {
        logContainer.innerHTML = "";
        log("Log cleared");
      },
      "#666",
    );
    buttonContainer.appendChild(clearButton);

    container.appendChild(header);
    container.appendChild(logContainer);
    container.appendChild(buttonContainer);

    // Auto-start if desired
    if (args.autoStart) {
      setTimeout(runAllTests, 1000);
    } else {
      log("🎯 WebConsole Core System ready for testing");
      log("👆 Click buttons above to test individual components");
    }

    return container;
  },
  argTypes: {
    autoStart: {
      control: "boolean",
      description: "Automatically start all tests",
    },
    showLogs: {
      control: "boolean",
      description: "Show detailed logs",
    },
  },
  args: {
    autoStart: false,
    showLogs: true,
  },
};

export default meta;

// Standard core tests
export const CoreSystemTests = {
  name: "🔧 Manual Tests",
};

// Auto-Tests
export const AutoTests = {
  name: "🤖 Automated Tests",
  args: {
    autoStart: true,
  },
};

// Kernel Tests
export const KernelOnly = {
  name: "🚀 Kernel Tests",
  render: () => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "#f8f9fa";

    const status = document.createElement("div");
    status.style.padding = "15px";
    status.style.background = "#e3f2fd";
    status.style.border = "1px solid #2196f3";
    status.style.borderRadius = "6px";
    status.style.fontFamily = "monospace";

    const updateStatus = (message: string) => {
      status.innerHTML = `
        <h4>🚀 Kernel Status</h4>
        <div>${message}</div>
        <div style="margin-top: 10px; font-size: 12px;">
          Version: ${kernel.version}<br>
          Type: Singleton Instance
        </div>
      `;
    };

    updateStatus("Kernel ready for testing");

    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "15px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start";
    startBtn.style.padding = "8px 16px";
    startBtn.style.background = "#4caf50";
    startBtn.style.color = "white";
    startBtn.style.border = "none";
    startBtn.style.borderRadius = "4px";
    startBtn.style.cursor = "pointer";

    const stopBtn = document.createElement("button");
    stopBtn.textContent = "Stop";
    stopBtn.style.padding = "8px 16px";
    stopBtn.style.background = "#f44336";
    stopBtn.style.color = "white";
    stopBtn.style.border = "none";
    stopBtn.style.borderRadius = "4px";
    stopBtn.style.cursor = "pointer";

    startBtn.addEventListener("click", async () => {
      updateStatus("Starting kernel...");
      try {
        await kernel.start();
        updateStatus("✅ Kernel started successfully");
      } catch (error) {
        updateStatus(`❌ Failed to start: ${error}`);
      }
    });

    stopBtn.addEventListener("click", async () => {
      updateStatus("Stopping kernel...");
      try {
        await kernel.shutdown();
        updateStatus("❌ Kernel stopped");
      } catch (error) {
        updateStatus(`❌ Failed to stop: ${error}`);
      }
    });

    buttonContainer.appendChild(startBtn);
    buttonContainer.appendChild(stopBtn);

    container.appendChild(status);
    container.appendChild(buttonContainer);

    return container;
  },
};
