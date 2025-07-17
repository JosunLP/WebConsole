import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Add global SASS variables
        additionalData: `
          $color-bg-primary: #1e1e1e;
          $color-text-primary: #cccccc;
          $color-border: #3e3e42;
          $color-accent: #569cd6;
          $color-error: #f85149;
          $color-success: #7ee787;
          $color-warning: #f9c74f;
          $font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          $font-size: 14px;
          $line-height: 1.4;
          $spacing-md: 8px;
          $border-radius: 4px;
        `,
      },
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'WebConsole',
      fileName: 'web-console',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@angular/core',
        '@angular/common',
        'vue',
        'svelte',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
          vue: 'Vue',
          svelte: 'Svelte',
        },
      },
    },
  },
  esbuild: {
    target: 'es2020',
  },
});
