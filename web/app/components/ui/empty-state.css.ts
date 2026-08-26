import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const root = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: theme.space[3],
  justifyContent: "center",
  minHeight: "10rem",
  padding: `${theme.space[6]} ${theme.space[4]}`,
  textAlign: "center",
})
export const icon = style({ color: theme.color.icon.muted })
export const copy = style({
  display: "grid",
  gap: theme.space[1],
  maxWidth: "28rem",
})
export const title = style({
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
})
export const description = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.xs,
})
