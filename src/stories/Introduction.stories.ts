export default {
  title: "📚 Introduction",
  parameters: {
    layout: "fullscreen",
  },
};

export const Welcome = {
  render: () => {
    return `
      <div style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <h1>🖥️ WebConsole Test Suite</h1>

        <p>Welcome to the <strong>WebConsole Storybook Test Suite</strong>! This interactive test environment replaces the simple <code>test.html</code> and provides comprehensive tests for all WebConsole components.</p>

        <h2>🎯 What is WebConsole?</h2>

        <p>WebConsole is a <strong>modular, fully browser-based console library</strong> for modern web applications.</p>

        <h3>✨ Features</h3>
        <ul>
          <li>🔧 <strong>Modular Architecture</strong> - Kernel, VFS, StateManager, Parser</li>
          <li>🗂️ <strong>Virtual File System</strong> - POSIX-like with localStorage backend</li>
          <li>🎨 <strong>Framework-agnostic</strong> - Angular, React, Vue, Svelte, Web Components</li>
          <li>🔒 <strong>Security</strong> - Sandbox, CSP-compatible, no eval() usage</li>
          <li>📦 <strong>Tree-Shaking</strong> - Minimal bundle size through modular structure</li>
        </ul>

        <h2>🧪 Test Categories</h2>
        <ul>
          <li><strong>Core System</strong> - Kernel, VFS, CommandRegistry</li>
          <li><strong>Framework Components</strong> - React, Angular, Vue, Svelte</li>
          <li><strong>Web Components</strong> - Native Custom Elements</li>
          <li><strong>Built-in Commands</strong> - echo, ls, cat, theme, etc.</li>
          <li><strong>Theme System</strong> - CSS Custom Properties</li>
        </ul>

        <h2>🚀 Usage</h2>
        <p>Navigate through the sidebar on the left to test various components. Each story offers a fully interactive WebConsole instance.</p>

        <h3>💡 Notes</h3>
        <ul>
          <li>All console instances have a preconfigured VFS with demo files</li>
          <li>Themes can be switched using the <code>theme</code> command</li>
          <li>Use <code>help</code> for an overview of available commands</li>
          <li>The VFS is persistent - changes persist between stories</li>
        </ul>
      </div>
    `;
  },
};
