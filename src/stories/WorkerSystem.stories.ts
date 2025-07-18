/**
 * Storybook demo for the worker multithreading system
 */

import { kernel } from "../core/Kernel.js";
import { WorkerTaskType } from "../interfaces/IWorkerTask.interface.js";

// Worker-Demo Interface
interface WorkerSystemArgs {
  enableWorkers: boolean;
  maxWorkers: number;
  showProgress: boolean;
  demoType: "computation" | "file-processing" | "batch" | "parallel";
}

// Meta-Konfiguration
const meta = {
  title: "System/Worker Multithreading",
  tags: ["autodocs"],
  render: (_args: WorkerSystemArgs) => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "#f8f9fa";
    container.style.fontFamily = "monospace";

    // Header
    const header = document.createElement("h3");
    header.textContent = "🔧 WebConsole Worker Multithreading Demo";
    header.style.margin = "0 0 20px 0";
    header.style.color = "#333";

    // Console-Container
    const consoleContainer = document.createElement("div");
    consoleContainer.style.background = "#000";
    consoleContainer.style.color = "#0f0";
    consoleContainer.style.padding = "15px";
    consoleContainer.style.borderRadius = "6px";
    consoleContainer.style.fontFamily = "monospace";
    consoleContainer.style.fontSize = "14px";
    consoleContainer.style.minHeight = "400px";
    consoleContainer.style.overflow = "auto";

    // Status-Display
    const statusContainer = document.createElement("div");
    statusContainer.style.background = "#e9ecef";
    statusContainer.style.padding = "15px";
    statusContainer.style.borderRadius = "6px";
    statusContainer.style.marginTop = "10px";

    // Controls
    const controlsContainer = document.createElement("div");
    controlsContainer.style.marginBottom = "15px";
    controlsContainer.style.display = "flex";
    controlsContainer.style.gap = "10px";

    container.appendChild(header);
    container.appendChild(controlsContainer);
    container.appendChild(consoleContainer);
    container.appendChild(statusContainer);

    // Logger
    function log(
      message: string,
      type: "info" | "success" | "error" | "worker" = "info",
    ) {
      const line = document.createElement("div");
      line.style.marginBottom = "5px";

      const timestamp = new Date().toLocaleTimeString();
      const prefix =
        type === "worker"
          ? "🔧"
          : type === "success"
            ? "✅"
            : type === "error"
              ? "❌"
              : "ℹ️";

      line.innerHTML = `<span style="color: #666">[${timestamp}]</span> ${prefix} ${message}`;

      if (type === "success") line.style.color = "#0f0";
      if (type === "error") line.style.color = "#f00";
      if (type === "worker") line.style.color = "#ff0";

      consoleContainer.appendChild(line);
      consoleContainer.scrollTop = consoleContainer.scrollHeight;
    }

    // Status updater
    function updateStatus(workerManager: unknown) {
      if (!workerManager || typeof workerManager !== "object") return;

      const manager = workerManager as {
        getWorkerStatus?: () => unknown;
        getActiveWorkerCount?: () => number;
        listActiveTasks?: () => unknown[];
      };

      const status = manager.getWorkerStatus?.();
      const activeCount = manager.getActiveWorkerCount?.() || 0;
      const activeTasks = manager.listActiveTasks?.() || [];

      const statusArray = Array.isArray(status) ? status : [];
      const statusLength = statusArray.length;

      statusContainer.innerHTML = `
        <h4>Worker Status</h4>
        <p><strong>Active Workers:</strong> ${activeCount}</p>
        <p><strong>Worker Pools:</strong> ${statusLength}</p>
        <p><strong>Active Tasks:</strong> ${activeTasks.length}</p>

        <h5>Pool Details:</h5>
        ${statusArray
          .map((pool: unknown) => {
            const p = pool as {
              id?: string;
              activeWorkers?: number;
              maxWorkers?: number;
              queuedTasks?: number;
              completedTasks?: number;
              status?: string;
            };
            return `
          <div style="margin: 5px 0; padding: 5px; background: white; border-radius: 3px;">
            <strong>${p.id || "Unknown"}:</strong>
            ${p.activeWorkers || 0}/${p.maxWorkers || 0} workers,
            ${p.queuedTasks || 0} queued,
            ${p.completedTasks || 0} completed,
            Status: ${p.status || "Unknown"}
          </div>
        `;
          })
          .join("")}
      `;
    }

    // Demo functions
    async function runComputationDemo() {
      log("Starting computation demo...", "info");

      try {
        const workerManager = kernel.getWorkerManager();

        // Use secure predefined function
        const result = await workerManager.runTask("heavyComputation", {
          args: [500000], // Number of iterations
          timeout: 10000,
          type: WorkerTaskType.COMPUTATION,
        });

        log(`Computation completed: ${JSON.stringify(result)}`, "success");
        updateStatus(workerManager);
      } catch (error) {
        log(`Computation failed: ${error}`, "error");
      }
    }

    async function runBatchDemo() {
      log("Starting batch processing demo...", "info");

      try {
        const workerManager = kernel.getWorkerManager();

        // Use predefined batch processing function
        const result = await workerManager.runTask("batchProcess", {
          args: [[1, 2, 3, 4, 5], "square"], // Numbers and operation
          timeout: 5000,
          type: WorkerTaskType.COMPUTATION,
        });

        log(
          `Batch completed: processed ${Array.isArray(result) ? result.length : 1} items`,
          "success",
        );
        log(`  Result: ${JSON.stringify(result)}`, "worker");

        updateStatus(workerManager);
      } catch (error) {
        log(`Batch processing failed: ${error}`, "error");
      }
    }

    async function runFileProcessingDemo() {
      log("Starting file processing demo...", "info");

      try {
        const workerManager = kernel.getWorkerManager();

        const result = await workerManager.executeTask({
          id: "file-processing-demo",
          payload: {
            files: ["document1.txt", "document2.txt", "document3.txt"],
            operation: "analyze",
          },
          type: WorkerTaskType.FILE_PROCESSING,
          priority: 5,
          timeout: 8000,
        });

        log(`File processing completed: ${JSON.stringify(result)}`, "success");
        updateStatus(workerManager);
      } catch (error) {
        log(`File processing failed: ${error}`, "error");
      }
    }

    async function showWorkerStatus() {
      try {
        const workerManager = kernel.getWorkerManager();
        const status = workerManager.getWorkerStatus();
        const activeTasks = workerManager.listActiveTasks();

        log(`Worker Status:`, "info");
        log(
          `  Active Workers: ${workerManager.getActiveWorkerCount()}`,
          "worker",
        );
        log(`  Worker Pools: ${status.length}`, "worker");
        log(`  Active Tasks: ${activeTasks.length}`, "worker");

        status.forEach((pool) => {
          log(
            `  Pool ${pool.id}: ${pool.activeWorkers}/${pool.maxWorkers} workers`,
            "worker",
          );
        });

        updateStatus(workerManager);
      } catch (error) {
        log(`Failed to get worker status: ${error}`, "error");
      }
    }

    // Control-Buttons
    const computationBtn = document.createElement("button");
    computationBtn.textContent = "Run Computation";
    computationBtn.onclick = runComputationDemo;
    computationBtn.style.cssText =
      "padding: 8px 15px; margin-right: 5px; border: none; border-radius: 4px; background: #007bff; color: white; cursor: pointer;";

    const batchBtn = document.createElement("button");
    batchBtn.textContent = "Run Batch";
    batchBtn.onclick = runBatchDemo;
    batchBtn.style.cssText =
      "padding: 8px 15px; margin-right: 5px; border: none; border-radius: 4px; background: #28a745; color: white; cursor: pointer;";

    const fileBtn = document.createElement("button");
    fileBtn.textContent = "File Processing";
    fileBtn.onclick = runFileProcessingDemo;
    fileBtn.style.cssText =
      "padding: 8px 15px; margin-right: 5px; border: none; border-radius: 4px; background: #17a2b8; color: white; cursor: pointer;";

    const statusBtn = document.createElement("button");
    statusBtn.textContent = "Show Status";
    statusBtn.onclick = showWorkerStatus;
    statusBtn.style.cssText =
      "padding: 8px 15px; margin-right: 5px; border: none; border-radius: 4px; background: #6c757d; color: white; cursor: pointer;";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear Log";
    clearBtn.onclick = () => (consoleContainer.innerHTML = "");
    clearBtn.style.cssText =
      "padding: 8px 15px; border: none; border-radius: 4px; background: #dc3545; color: white; cursor: pointer;";

    controlsContainer.appendChild(computationBtn);
    controlsContainer.appendChild(batchBtn);
    controlsContainer.appendChild(fileBtn);
    controlsContainer.appendChild(statusBtn);
    controlsContainer.appendChild(clearBtn);

    // Auto-Start
    (async () => {
      try {
        log("Initializing WebConsole kernel...", "info");

        if (!kernel.isStarted) {
          await kernel.start();
        }

        log("Kernel started successfully", "success");
        log("Worker manager ready", "worker");

        const workerManager = kernel.getWorkerManager();
        updateStatus(workerManager);

        log("Ready for worker demonstrations", "info");
        log("Use the buttons above to test different worker scenarios", "info");
      } catch (error) {
        log(`Initialization failed: ${error}`, "error");
      }
    })();

    return container;
  },
  argTypes: {
    enableWorkers: {
      control: { type: "boolean" },
      description: "Enable/disable worker system",
    },
    maxWorkers: {
      control: { type: "range", min: 1, max: 8 },
      description: "Maximum number of workers",
    },
    showProgress: {
      control: { type: "boolean" },
      description: "Show progress updates",
    },
    demoType: {
      control: { type: "select" },
      options: ["computation", "file-processing", "batch", "parallel"],
      description: "Type of worker demo",
    },
  },
};

// Stories
export const WorkerSystemDemo = {
  args: {
    enableWorkers: true,
    maxWorkers: 4,
    showProgress: true,
    demoType: "computation",
  },
};

export const BatchProcessingDemo = {
  args: {
    enableWorkers: true,
    maxWorkers: 6,
    showProgress: true,
    demoType: "batch",
  },
};

export const FileProcessingDemo = {
  args: {
    enableWorkers: true,
    maxWorkers: 4,
    showProgress: true,
    demoType: "file-processing",
  },
};

export default meta;
