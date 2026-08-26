import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: theme.layout.authWidth,
  padding: `${theme.space[12]} ${theme.space[4]}`,
})

export const card = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "flex",
  flexDirection: "column",
  gap: theme.space[4],
  padding: theme.space[6],
})

export const title = style({
  color: theme.color.text.primary,
  fontSize: theme.font.size.xl,
  fontWeight: theme.font.weight.bold,
})

export const body = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.relaxed,
})

export const backLink = style({
  color: theme.color.text.primary,
  fontSize: theme.font.size.sm,
  width: "fit-content",
})
