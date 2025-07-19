/**
 * CommandWorker Integration Tests
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  IWorkerTask,
  WorkerTaskPriority,
  WorkerTaskType,
} from "../interfaces/IWorkerTask.interface.js";
import { TaskResult } from "../types/worker.type.js";
import {
  CommandWorker,
  CommandWorkerPayload,
  VFSWorkerProxy,
} from "./CommandWorker.js";

// Mock Web Worker APIs for testing environment
beforeEach(() => {
  // Mock global self object
  globalThis.self = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    postMessage: vi.fn(),
  } as never;
});

// Mock VFS proxy for testing
class MockVFSProxy implements VFSWorkerProxy {
  private files: Map<string, string> = new Map();

  constructor() {
    // Add test files matching the test expectations
    this.files.set(
      "/test.txt",
      "Hello World\nThis is a test file\nWith multiple lines",
    );
    this.files.set(
      "/sample.log",
      "Error: Something went wrong\nInfo: Processing data\nError: Another issue",
    );
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async readdir(path: string): Promise<string[]> {
    if (path === "/") {
      return Array.from(this.files.keys()).map((p) => p.substring(1));
    }
    return [];
  }
}

// Test helper function to inject VFS proxy into CommandWorker
function setVfsProxyForTesting(
  worker: CommandWorker,
  proxy: VFSWorkerProxy,
): void {
  // Use reflection to access the private setVfsProxyForTesting method
  const setVfsProxyMethod = (worker as never)["setVfsProxyForTesting"] as (
    proxy: VFSWorkerProxy,
  ) => void;

  if (setVfsProxyMethod) {
    setVfsProxyMethod.call(worker, proxy);
  } else {
    // Fallback: directly set the vfs property if the method doesn't exist
    (worker as unknown as { vfs: VFSWorkerProxy })["vfs"] = proxy;
  }
}

// Test helper function to call private processTask method
async function testProcessTask(
  worker: CommandWorker,
  task: IWorkerTask<CommandWorkerPayload>,
  signal: AbortSignal,
): Promise<TaskResult> {
  // Use reflection to access the private processTask method
  const processTaskMethod = (worker as never)["processTask"] as (
    task: IWorkerTask<CommandWorkerPayload>,
    signal: AbortSignal,
  ) => Promise<TaskResult>;

  return processTaskMethod.call(worker, task, signal);
}

// Helper function to create properly typed worker tasks
function createWorkerTask(
  id: string,
  command: string,
  args: string[],
  cwd = "/",
  env: Record<string, string> = {},
): IWorkerTask<CommandWorkerPayload> {
  return {
    id,
    type: WorkerTaskType.COMMAND,
    priority: WorkerTaskPriority.NORMAL,
    payload: {
      command,
      args,
      cwd,
      env,
    },
  };
}

// TODO: Fix worker testing infrastructure - tests currently timeout due to async worker communication issues
describe.skip("CommandWorker Security Tests", () => {
  let worker: CommandWorker;
  let mockVFS: MockVFSProxy;

  beforeEach(() => {
    worker = new CommandWorker();
    mockVFS = new MockVFSProxy();

    // Inject mock VFS using the helper function
    setVfsProxyForTesting(worker, mockVFS);
  });

  describe("grep command security", () => {
    it("should handle safe regex patterns", async () => {
      const task = createWorkerTask("test-1", "grep", ["Hello", "/test.txt"]);

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(["1: Hello World"]);
      }
    });

    it("should handle potentially dangerous regex patterns safely", async () => {
      const task = createWorkerTask("test-2", "grep", ["(a*)*", "/test.txt"]); // Potentially dangerous pattern

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      // Should not crash and should handle the pattern safely
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it("should handle special regex characters literally when needed", async () => {
      const task = createWorkerTask("test-3", "grep", [
        "-F",
        "Error:",
        "/sample.log",
      ]); // Literal search

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([
          "1: Error: Something went wrong",
          "3: Error: Another issue",
        ]);
      }
    });

    it("should handle case-insensitive search", async () => {
      const task = createWorkerTask("test-4", "grep", [
        "-i",
        "hello",
        "/test.txt",
      ]);

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(["1: Hello World"]);
      }
    });

    it("should handle invalid regex gracefully", async () => {
      const task = createWorkerTask("test-5", "grep", [
        "[unclosed",
        "/test.txt",
      ]); // Invalid regex

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      // Should fallback to literal search and not crash
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe("find command security", () => {
    it("should handle safe glob patterns", async () => {
      const task = createWorkerTask("test-6", "find", ["/", "-name", "*.txt"]);

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain("test.txt");
      }
    });

    it("should handle complex glob patterns safely", async () => {
      const task = createWorkerTask("test-7", "find", [
        "/",
        "-name",
        "test?.txt",
      ]);

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });

    it("should handle potentially dangerous patterns in filenames", async () => {
      const task = createWorkerTask("test-8", "find", [
        "/",
        "-name",
        "(evil*)*",
      ]); // Potentially dangerous pattern

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      // Should not crash and should handle the pattern safely
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe("performance and reliability", () => {
    it("should complete regex operations within reasonable time", async () => {
      const start = Date.now();

      const task = createWorkerTask("test-9", "grep", ["(a+)+b", "/test.txt"]); // Pattern that could cause ReDoS

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle long patterns gracefully", async () => {
      const longPattern = "a".repeat(2000); // Very long pattern

      const task = createWorkerTask("test-10", "grep", [
        longPattern,
        "/test.txt",
      ]);

      const result = await testProcessTask(
        worker,
        task,
        new AbortController().signal,
      );

      // Should not crash even with very long patterns
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });
});
