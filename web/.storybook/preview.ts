import type { Preview } from "@storybook/react-vite"

import { lightThemeClass } from "../app/design-system/theme.css"
import "../app/design-system/global.css"

const preview: Preview = {
  decorators: [
    (Story) => {
      document.documentElement.classList.add(lightThemeClass)
      return Story()
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Design System", "UI"],
      },
    },
  },
}

export default preview
