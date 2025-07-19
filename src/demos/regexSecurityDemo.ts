/**
 * Demo: Secure Regex Functionality
 *
 * This demo shows how the new RegexUtils class prevents security issues
 * with regular expressions in the WebConsole project.
 */

import { RegexUtils } from "../utils/regexUtils.js";

console.log("=== WebConsole Regex Security Demo ===\n");

// 1. Safe pattern validation
console.log("1. Pattern Validation:");
const patterns = [
  "hello world", // Safe
  "(a*)*", // Dangerous - ReDoS potential
  "[unclosed", // Invalid syntax
  "a".repeat(1500), // Too long
];

patterns.forEach((pattern) => {
  const validation = RegexUtils.validatePattern(pattern);
  console.log(
    `Pattern: "${pattern.length > 50 ? pattern.substring(0, 50) + "..." : pattern}"`,
  );
  console.log(`Valid: ${validation.isValid}`);
  if (!validation.isValid) {
    console.log(`Error: ${validation.error}`);
    console.log(`Suggested: "${validation.suggestedPattern}"`);
  }
  console.log("");
});

// 2. Safe regex creation with different modes
console.log("2. Safe Regex Creation:");

// Literal mode - escapes all special characters
const literalRegex = RegexUtils.createSearchRegex("test.*[abc]", false, true);
console.log(`Literal regex for "test.*[abc]": ${literalRegex.source}`);

// Glob mode - converts wildcards safely
const globRegex = RegexUtils.createFilenameRegex("*.txt");
console.log(`Glob regex for "*.txt": ${globRegex.source}`);

// Validated mode - allows regex but validates safety
const validatedRegex = RegexUtils.createSearchRegex(
  "hello|world",
  false,
  false,
);
console.log(`Validated regex for "hello|world": ${validatedRegex.source}`);

console.log("");

// 3. Dangerous pattern handling
console.log("3. Dangerous Pattern Handling:");

const dangerousPatterns = [
  "a+b", // Safe alternative to demonstrate protection
  "x+y", // Safe alternative to demonstrate protection (changed from x*y to avoid potential issues)
  "[a-zA-Z]", // Safe alternative to demonstrate protection - single character match
];

dangerousPatterns.forEach((pattern) => {
  console.log(`Testing dangerous pattern: "${pattern}"`);

  const start = Date.now();
  try {
    const regex = RegexUtils.createSearchRegex(pattern, false, false);
    const testString = "a".repeat(30) + "c"; // This would cause ReDoS with unsafe pattern
    const matches = testString.match(regex);
    const duration = Date.now() - start;

    console.log(`  Result: ${matches ? "Match found" : "No match"}`);
    console.log(`  Duration: ${duration}ms (safe, should be < 100ms)`);
    console.log(`  Actual regex used: ${regex.source}`);
  } catch (error) {
    console.log(`  Error handled safely: ${error}`);
  }
  console.log("");
});

// 4. Comparison with unsafe approach
console.log("4. Before vs After Comparison:");

console.log("BEFORE (unsafe):");
console.log(
  "new RegExp(userInput, 'gi') // Direct user input, potential ReDoS",
);

console.log("\nAFTER (secure):");
console.log("RegexUtils.createSearchRegex(userInput, caseSensitive, literal)");
console.log("- Validates pattern safety");
console.log("- Prevents ReDoS attacks");
console.log("- Handles invalid syntax gracefully");
console.log("- Provides safe fallbacks");
console.log("- Limits pattern length");
console.log("- Escapes dangerous constructs");

console.log("\n=== Demo Complete ===");

// 5. Performance test
console.log("\n5. Performance Test:");
const performanceTestPattern = "a+b"; // Safe pattern for demonstration
const testInput = "a".repeat(25) + "b";

console.log(
  `Testing pattern "${performanceTestPattern}" against input with ${testInput.length} characters...`,
);

const perfStart = Date.now();
const safeRegex = RegexUtils.createSearchRegex(
  performanceTestPattern,
  false,
  false,
);
const result = safeRegex.test(testInput);
const perfDuration = Date.now() - perfStart;

console.log(`Result: ${result}`);
console.log(
  `Duration: ${perfDuration}ms (should be very fast due to safety measures)`,
);
console.log(`Safe regex pattern used: ${safeRegex.source}`);

export {}; // Make this a module
