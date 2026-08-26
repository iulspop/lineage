import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const item = style({
  background: theme.color.background.elevated,
  border: `1px solid ${theme.color.focus}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.focus,
  padding: theme.space[4],
})

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[3],
})

export const field = style({
  display: "grid",
  gap: theme.space[2],
})

export const actions = style({
  display: "flex",
  gap: theme.space[2],
  justifyContent: "flex-end",
})
