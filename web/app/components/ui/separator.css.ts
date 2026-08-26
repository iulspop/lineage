import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const separator = style({
  background: theme.color.border.subtle,
  flexShrink: 0,
  selectors: {
    '&[data-orientation="horizontal"]': { height: "1px", width: "100%" },
    '&[data-orientation="vertical"]': { alignSelf: "stretch", width: "1px" },
  },
})
