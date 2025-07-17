/**
 * Theme-bezogene Typdefinitionen
 */

import { ColorValue, CSSCustomProperty } from './primitive.type.js';

/**
 * Theme-Token Map
 */
export type ThemeTokens = Record<CSSCustomProperty, ColorValue | string>;
