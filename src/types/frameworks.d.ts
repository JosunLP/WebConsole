// Type definitions for framework-specific components

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

declare module "*.svelte" {
  import { SvelteComponent } from "svelte";
  const component: typeof SvelteComponent;
  export default component;
}
