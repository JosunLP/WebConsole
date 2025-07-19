/**
 * RegexUtils Tests
 */

import { describe, expect, it } from "vitest";
import { RegexUtils } from "./regexUtils.js";

describe("RegexUtils", () => {
  describe("validatePattern", () => {
    it("should validate safe patterns", () => {
      const result = RegexUtils.validatePattern("hello");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject empty patterns", () => {
      const result = RegexUtils.validatePattern("");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("empty");
      expect(result.suggestedPattern).toBe(".*");
    });

    it("should reject patterns that are too long", () => {
      const longPattern = "a".repeat(1001);
      const result = RegexUtils.validatePattern(longPattern);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("too long");
    });

    it("should reject dangerous patterns with multiple quantifiers", () => {
      const result = RegexUtils.validatePattern("(a*)*");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("dangerous");
    });

    it("should reject invalid regex syntax", () => {
      const result = RegexUtils.validatePattern("[unclosed");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid regex syntax");
    });
  });

  describe("escapeRegexChars", () => {
    it("should escape special regex characters", () => {
      const input = "hello.world*test?[abc]";
      const result = RegexUtils.escapeRegexChars(input);
      expect(result).toBe("hello\\.world\\*test\\?\\[abc\\]");
    });

    it("should handle empty string", () => {
      const result = RegexUtils.escapeRegexChars("");
      expect(result).toBe("");
    });

    it("should not escape regular characters", () => {
      const input = "abcdef123";
      const result = RegexUtils.escapeRegexChars(input);
      expect(result).toBe(input);
    });
  });

  describe("globToRegex", () => {
    it("should convert glob patterns correctly", () => {
      const result = RegexUtils.globToRegex("*.txt");
      expect(result).toBe("^.*\\.txt$");
    });

    it("should handle question marks", () => {
      const result = RegexUtils.globToRegex("test?.txt");
      expect(result).toBe("^test.\\.txt$");
    });

    it("should escape other special characters", () => {
      const result = RegexUtils.globToRegex("test[abc].txt");
      expect(result).toBe("^test\\[abc\\]\\.txt$");
    });
  });

  describe("createSafeRegex", () => {
    it("should create regex with default options", () => {
      const regex = RegexUtils.createSafeRegex("test");
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.source).toBe("test");
    });

    it("should apply flags correctly", () => {
      const regex = RegexUtils.createSafeRegex("test", { flags: "gi" });
      expect(regex.flags).toContain("g");
      expect(regex.flags).toContain("i");
    });

    it("should escape in literal mode", () => {
      const regex = RegexUtils.createSafeRegex("test.*", {
        escapeMode: "literal",
      });
      expect(regex.source).toBe("test\\.\\*");
    });

    it("should convert glob patterns", () => {
      const regex = RegexUtils.createSafeRegex("*.txt", { escapeMode: "glob" });
      expect(regex.source).toBe("^.*\\.txt$");
    });

    it("should fallback to literal for unsafe patterns when not allowing complex patterns", () => {
      const regex = RegexUtils.createSafeRegex("(a*)*", {
        allowComplexPatterns: false,
      });
      // Should fallback to escaped literal version
      expect(regex.source).toBe("\\(a\\*\\)\\*");
    });

    it("should truncate long patterns", () => {
      const longPattern = "a".repeat(500);
      const regex = RegexUtils.createSafeRegex(longPattern, { maxLength: 100 });
      expect(regex.source.length).toBeLessThanOrEqual(100);
    });
  });

  describe("createSearchRegex", () => {
    it("should create case-insensitive regex by default", () => {
      const regex = RegexUtils.createSearchRegex("test");
      expect(regex.flags).toContain("i");
      expect(regex.flags).toContain("g");
    });

    it("should create case-sensitive regex when requested", () => {
      const regex = RegexUtils.createSearchRegex("test", true);
      expect(regex.flags).toContain("g");
      expect(regex.flags).not.toContain("i");
    });

    it("should escape pattern in literal mode", () => {
      const regex = RegexUtils.createSearchRegex("test.*", false, true);
      expect(regex.source).toBe("test\\.\\*");
    });

    it("should handle special characters safely", () => {
      const regex = RegexUtils.createSearchRegex("(dangerous*)*", false, false);
      // Should not throw and should be safe
      expect(regex).toBeInstanceOf(RegExp);
      expect(() => "test".match(regex)).not.toThrow();
    });
  });

  describe("createFilenameRegex", () => {
    it("should create case-insensitive regex for filenames", () => {
      const regex = RegexUtils.createFilenameRegex("*.txt");
      expect(regex.flags).toContain("i");
      expect(regex.source).toBe("^.*\\.txt$");
    });

    it("should handle multiple wildcards", () => {
      const regex = RegexUtils.createFilenameRegex("test*.log.*");
      expect(regex.source).toBe("^test.*\\.log\\..*$");
    });

    it("should handle question marks", () => {
      const regex = RegexUtils.createFilenameRegex("test?.txt");
      expect(regex.source).toBe("^test.\\.txt$");
    });
  });

  describe("regex execution safety", () => {
    it("should not cause ReDoS with complex patterns", () => {
      const start = Date.now();
      const regex = RegexUtils.createSearchRegex("(a+)+b");
      const testString = "a".repeat(30) + "c"; // This would cause ReDoS with unsafe pattern

      try {
        regex.test(testString);
      } catch (e) {
        // Should not throw
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });

    it("should handle malformed patterns gracefully", () => {
      expect(() => RegexUtils.createSearchRegex("[unclosed")).not.toThrow();
      expect(() => RegexUtils.createSearchRegex("(incomplete")).not.toThrow();
      expect(() => RegexUtils.createSearchRegex("*invalid")).not.toThrow();
    });
  });
});
