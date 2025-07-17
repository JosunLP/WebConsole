export default {
  title: "Components/WebConsole Element",
  parameters: {
    layout: "centered",
  },
};

export const Default = {
  render: () => {
    return `
      <div>
        <h3>Native WebConsole Custom Element</h3>
        <web-console
          style="width: 800px; height: 400px; border: 1px solid #ccc;"
          theme="default"
          prompt="$ ">
        </web-console>

        <script type="module">
          // Ensure WebConsole is loaded
          import('../../src/index.js').then(() => {
            console.log('WebConsole loaded successfully');
          }).catch(err => {
            console.warn('WebConsole loading failed:', err);
          });
        </script>
      </div>
    `;
  },
};

export const WithDarkTheme = {
  render: () => {
    return `
      <div>
        <h3>WebConsole - Dark Theme</h3>
        <web-console
          style="width: 800px; height: 400px; border: 1px solid #333;"
          theme="monokai"
          prompt="❯ ">
        </web-console>
      </div>
    `;
  },
};

export const WithLightTheme = {
  render: () => {
    return `
      <div>
        <h3>WebConsole - Light Theme</h3>
        <web-console
          style="width: 800px; height: 400px; border: 1px solid #ddd;"
          theme="light"
          prompt="$ ">
        </web-console>
      </div>
    `;
  },
};
