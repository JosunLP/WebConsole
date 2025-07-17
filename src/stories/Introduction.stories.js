export default {
  title: '📚 Introduction',
  parameters: {
    docs: {
      page: () => {
        return `
          <div style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem;">
            <h1>🖥️ WebConsole Test Suite</h1>

            <p>Willkommen zur <strong>WebConsole Storybook Test Suite</strong>! Diese interaktive Testumgebung ersetzt die einfache <code>test.html</code> und bietet umfassende Tests für alle WebConsole-Components.</p>

            <h2>🎯 Was ist WebConsole?</h2>

            <p>WebConsole ist eine <strong>modulare, vollständig im Browser laufende Console-Bibliothek</strong> für moderne Web-Anwendungen.</p>

            <h3>✨ Features</h3>
            <ul>
              <li>🔧 <strong>Modulare Architektur</strong> - Kernel, VFS, StateManager, Parser</li>
              <li>🗂️ <strong>Virtuelles Dateisystem</strong> - POSIX-ähnlich mit localStorage-Backend</li>
              <li>🎨 <strong>Framework-agnostisch</strong> - Angular, React, Vue, Svelte, Web Components</li>
              <li>🔒 <strong>Sicherheit</strong> - Sandbox, CSP-kompatibel, keine eval()-Nutzung</li>
              <li>📦 <strong>Tree-Shaking</strong> - Minimale Bundle-Größe durch modularen Aufbau</li>
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
              <li>Alle Console-Instanzen haben ein vorkonfiguriertes VFS mit Demo-Dateien</li>
              <li>Themes können über den <code>theme</code>-Befehl gewechselt werden</li>
              <li>Verwenden Sie <code>help</code> für eine Übersicht der verfügbaren Befehle</li>
              <li>Das VFS ist persistent - Änderungen bleiben zwischen Stories erhalten</li>
            </ul>
          </div>
        `;
      },
    },
  },
};

export const Welcome = () => {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <h1>🖥️ WebConsole Test Suite</h1>
      <p>Wählen Sie eine Story aus der Sidebar, um die WebConsole zu testen!</p>
    </div>
  `;
};
