import { describe, expect, it } from "vitest";
import { EventEmitter } from "./EventEmitter.js";

describe("EventEmitter", () => {
  it("should create an instance", () => {
    const emitter = new EventEmitter();
    expect(emitter).toBeDefined();
  });

  it("should register and emit events", () => {
    const emitter = new EventEmitter();
    let called = false;

    emitter.on("test", () => {
      called = true;
    });

    emitter.emit("test");
    expect(called).toBe(true);
  });

  it("should pass data to event handlers", () => {
    const emitter = new EventEmitter();
    let receivedData: string | null = null;

    emitter.on("test", (data: string) => {
      receivedData = data;
    });

    emitter.emit("test", "hello world");
    expect(receivedData).toBe("hello world");
  });

  it("should remove event listeners", () => {
    const emitter = new EventEmitter();
    let callCount = 0;

    const handler = () => {
      callCount++;
    };

    emitter.on("test", handler);
    emitter.emit("test");
    expect(callCount).toBe(1);

    emitter.off("test", handler);
    emitter.emit("test");
    expect(callCount).toBe(1); // Should not increase
  });
});
