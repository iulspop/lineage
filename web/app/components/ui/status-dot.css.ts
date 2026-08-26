import { style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const dot = style({
  border: `2px solid ${theme.color.background.card}`,
  borderRadius: theme.radius.full,
  height: "0.625rem",
  width: "0.625rem",
})
export const status = styleVariants({
  danger: { background: theme.color.intent.danger.background },
  neutral: { background: theme.color.icon.muted },
  online: { background: theme.color.intent.success.background },
  warning: { background: theme.color.intent.warning.background },
})
