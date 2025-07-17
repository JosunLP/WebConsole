/**
 * Style utilities for loading SASS/CSS files
 */

/**
 * Load CSS content from a SASS file
 * This function should be used to import styles in components
 */
export async function loadStyles(path: string): Promise<string> {
  try {
    // In development, we can import the raw CSS
    // In production, this would be pre-compiled
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load styles from ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.warn(`Could not load styles from ${path}:`, error);
    return "";
  }
}

/**
 * Create a CSS stylesheet for a component
 */
export function createStyleSheet(css: string): string {
  return `<style>${css}</style>`;
}

/**
 * Apply styles to a shadow root
 */
export function applyStylesToShadowRoot(
  shadowRoot: ShadowRoot,
  css: string,
): void {
  const style = document.createElement("style");
  style.textContent = css;
  shadowRoot.appendChild(style);
}
