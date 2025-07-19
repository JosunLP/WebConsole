import { describe, expect, it } from "vitest";
import { PathUtils } from "./pathUtils.js";

describe("PathUtils", () => {
  it("should sanitize filenames correctly", () => {
    expect(PathUtils.sanitizeFilename("valid-file.txt")).toBe("valid-file.txt");
    expect(PathUtils.sanitizeFilename('file<>:"/\\|?*.txt')).toBe(
      "file_________.txt",
    );
    expect(PathUtils.sanitizeFilename("...")).toBe("_");
  });
});
