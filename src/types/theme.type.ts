/**
 * Theme-related type definitions
 */

import { ColorValue } from "./primitive.type.js";

/**
 * Predefined theme tokens
 */
export interface ThemeTokens {
  // Colors
  "color-bg-primary": ColorValue;
  "color-bg-secondary": ColorValue;
  "color-text-primary": ColorValue;
  "color-text-secondary": ColorValue;
  "color-accent": ColorValue;
  "color-border": ColorValue;
  "color-error": ColorValue;
  "color-success": ColorValue;
  "color-warning": ColorValue;

  // Typography
  "font-family": string;
  "font-size": string;
  "line-height": string;

  // Layout
  "border-radius": string;
  "spacing-sm": string;
  "spacing-md": string;
  "spacing-lg": string;

  // Additional custom tokens
  [key: string]: string;
}
