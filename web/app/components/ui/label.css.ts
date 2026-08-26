import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const label = style({
  alignItems: "center",
  display: "flex",
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  gap: theme.space[2],
  lineHeight: theme.font.lineHeight.tight,
  userSelect: "none",
})
