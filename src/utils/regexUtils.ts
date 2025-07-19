/**
 * Regular Expression Utilities
 * Provides safe and validated regex handling to prevent ReDoS attacks and invalid patterns
 */

export interface RegexValidationResult {
  isValid: boolean;
  error?: string;
  suggestedPattern?: string;
}

export interface SafeRegexOptions {
  flags?: string;
  maxLength?: number;
  allowComplexPatterns?: boolean;
  escapeMode?: "literal" | "glob" | "none";
}

/**
 * Regular Expression Utilities Class
 */
export class RegexUtils {
  // Maximum allowed pattern length to prevent excessive memory usage
  private static readonly MAX_PATTERN_LENGTH = 1000;

  // Patterns that are known to be potentially dangerous (ReDoS)
  private static readonly DANGEROUS_PATTERNS = [
    /(\*+){2,}/, // Multiple consecutive * quantifiers
    /(\++){2,}/, // Multiple consecutive + quantifiers
    /(\?+){2,}/, // Multiple consecutive ? quantifiers
    /\([^)]*\*[^)]*\)\*/, // Nested quantifiers
    /\([^)]*\+[^)]*\)\+/, // Nested quantifiers
    /(\([^)]*){5,}/, // Too much nesting
  ];

  // Characters that need escaping in regex
  private static readonly REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

  /**
   * Validates a regex pattern for potential security issues
   */
  static validatePattern(pattern: string): RegexValidationResult {
    if (!pattern) {
      return {
        isValid: false,
        error: "Pattern cannot be empty",
        suggestedPattern: ".*",
      };
    }

    if (pattern.length > this.MAX_PATTERN_LENGTH) {
      return {
        isValid: false,
        error: `Pattern too long (max ${this.MAX_PATTERN_LENGTH} characters)`,
        suggestedPattern: pattern.substring(0, this.MAX_PATTERN_LENGTH),
      };
    }

    // Check for dangerous patterns
    for (const dangerousPattern of this.DANGEROUS_PATTERNS) {
      if (dangerousPattern.test(pattern)) {
        return {
          isValid: false,
          error: "Pattern contains potentially dangerous constructs",
          suggestedPattern: this.escapeRegexChars(pattern),
        };
      }
    }

    // Try to create the regex to check for syntax errors
    try {
      new RegExp(pattern);
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid regex syntax: ${error instanceof Error ? error.message : "Unknown error"}`,
        suggestedPattern: this.escapeRegexChars(pattern),
      };
    }

    return { isValid: true };
  }

  /**
   * Escapes special regex characters to create a literal match pattern
   */
  static escapeRegexChars(str: string): string {
    return str.replace(this.REGEX_SPECIAL_CHARS, "\\$&");
  }

  /**
   * Converts a glob pattern to a safe regex pattern
   */
  static globToRegex(pattern: string): string {
    const escaped = this.escapeRegexChars(pattern)
      .replace(/\\\*/g, ".*") // Convert escaped * back to .*
      .replace(/\\\?/g, "."); // Convert escaped ? back to .

    return `^${escaped}$`;
  }

  /**
   * Creates a safe regex with validation and optional fallback
   */
  static createSafeRegex(
    pattern: string,
    options: SafeRegexOptions = {},
  ): RegExp {
    const {
      flags = "",
      maxLength = this.MAX_PATTERN_LENGTH,
      allowComplexPatterns = false,
      escapeMode = "none",
    } = options;

    let processedPattern = pattern;

    // Apply length limit
    if (processedPattern.length > maxLength) {
      processedPattern = processedPattern.substring(0, maxLength);
    }

    // Apply escape mode
    switch (escapeMode) {
      case "literal":
        processedPattern = this.escapeRegexChars(processedPattern);
        break;
      case "glob":
        processedPattern = this.globToRegex(processedPattern);
        break;
      case "none":
      default:
        // No escaping, but still validate
        break;
    }

    // Validate pattern if complex patterns are not allowed
    if (!allowComplexPatterns) {
      const validation = this.validatePattern(processedPattern);
      if (!validation.isValid) {
        // Fall back to literal match if pattern is unsafe
        processedPattern = this.escapeRegexChars(pattern);
      }
    }

    try {
      return new RegExp(processedPattern, flags);
    } catch (error) {
      // Ultimate fallback: create a literal match regex
      console.warn(
        `Failed to create regex from pattern '${pattern}': ${error}`,
      );
      return new RegExp(this.escapeRegexChars(pattern), flags);
    }
  }

  /**
   * Creates a safe search regex specifically for grep-like operations
   */
  static createSearchRegex(
    pattern: string,
    caseSensitive: boolean = false,
    literal: boolean = false,
  ): RegExp {
    const flags = caseSensitive ? "g" : "gi";
    const escapeMode = literal ? "literal" : "none";

    return this.createSafeRegex(pattern, {
      flags,
      escapeMode,
      allowComplexPatterns: false, // Be conservative for search operations
    });
  }

  /**
   * Creates a safe filename matching regex for find-like operations
   */
  static createFilenameRegex(pattern: string): RegExp {
    return this.createSafeRegex(pattern, {
      flags: "i",
      escapeMode: "glob",
      allowComplexPatterns: false,
    });
  }
}
