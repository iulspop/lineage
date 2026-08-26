import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const workspace = style({
  "@media": {
    "(max-width: 40rem)": {
      padding: 0,
    },
  },
  alignItems: "flex-start",
  display: "flex",
  minHeight: "100dvh",
  padding: `${theme.space[6]} ${theme.space[4]}`,
  width: "100%",
})
