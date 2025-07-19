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

  describe("globToRegex", () => {
    it("should convert simple patterns correctly", () => {
      const regex = PathUtils.globToRegex("*.txt");
      expect(regex.test("file.txt")).toBe(true);
      expect(regex.test("document.txt")).toBe(true);
      expect(regex.test("file.js")).toBe(false);
    });

    it("should handle question mark wildcards", () => {
      const regex = PathUtils.globToRegex("file?.txt");
      expect(regex.test("file1.txt")).toBe(true);
      expect(regex.test("fileA.txt")).toBe(true);
      expect(regex.test("file12.txt")).toBe(false);
      expect(regex.test("file.txt")).toBe(false);
    });

    it("should escape special regex characters", () => {
      const regex = PathUtils.globToRegex("file[1-9].txt");
      expect(regex.test("file[1-9].txt")).toBe(true);
      expect(regex.test("file1.txt")).toBe(false);
    });

    it("should handle simple patterns with multiple wildcards", () => {
      const regex = PathUtils.globToRegex("src/*.ts");
      expect(regex.test("src/index.ts")).toBe(true);
      expect(regex.test("src/Button.ts")).toBe(true);
      expect(regex.test("src/forms/Input.js")).toBe(false);
    });

    it("should prevent regex injection attacks", () => {
      // Test that malicious regex patterns are escaped
      const maliciousPattern = ".*+(evil|pattern)+.*";
      const regex = PathUtils.globToRegex(maliciousPattern);
      expect(regex.source).not.toContain("(evil|pattern)");
      expect(regex.test(".*+(evil|pattern)+.*")).toBe(true);
    });
  });
});
