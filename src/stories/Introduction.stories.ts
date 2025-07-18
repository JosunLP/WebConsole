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

        <p>Willkommen zur <strong>WebConsole Storybook Test Suite</strong>! Diese interaktive Testumgebung ersetzt die einfache <code>test.html</code> und bietet umfassende Tests für alle WebConsole-Components.</p>

        <h2>🎯 Was ist WebConsole?</h2>

        <p>WebConsole ist eine <strong>modulare, vollständig im Browser laufende Console-Bibliothek</strong> für moderne Web-Anwendungen.</p>

        <h3>✨ Features</h3>
        <ul>
          <li>🔧 <strong>Modulare Architektur</strong> - Kernel, VFS, StateManager, Parser</li>
          <li>🗂️ <strong>Virtual File System</strong> - POSIX-like with localStorage backend</li>
          <li>🎨 <strong>Framework-agnostisch</strong> - Angular, React, Vue, Svelte, Web Components</li>
          <li>🔒 <strong>Sicherheit</strong> - Sandbox, CSP-kompatibel, keine eval()-Nutzung</li>
          <li>📦 <strong>Tree-Shaking</strong> - Minimal bundle size through modular structure</li>
        </ul>

        <h2>🧪 Test-Kategorien</h2>
        <ul>
          <li><strong>Core System</strong> - Kernel, VFS, CommandRegistry</li>
          <li><strong>Framework Components</strong> - React, Angular, Vue, Svelte</li>
          <li><strong>Web Components</strong> - Native Custom Elements</li>
          <li><strong>Built-in Commands</strong> - echo, ls, cat, theme, etc.</li>
          <li><strong>Theme System</strong> - CSS Custom Properties</li>
        </ul>

        <h2>🚀 Verwendung</h2>
        <p>Navigieren Sie durch die Sidebar links, um verschiedene Components zu testen. Jede Story bietet eine vollständig interaktive WebConsole-Instanz.</p>

        <h3>💡 Hinweise</h3>
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
