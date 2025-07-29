import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  managerHead: (head) => `
    ${head}
    <script>
      window.STORYBOOK_DISABLE_TELEMETRY = true;
    </script>
  `,
  "stories": [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs"
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;