/**
 * Svelte WebConsole Component Stub
 * This is a build-time stub to avoid Svelte dependency issues
 */

// Stub component for Svelte
export class WebConsole {
  constructor(options: any) {
    if (typeof window !== 'undefined') {
      console.warn(
        'Svelte WebConsole component requires svelte to be installed'
      );
    }
  }
}

export default WebConsole;
