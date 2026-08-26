import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: theme.layout.authWidth,
  padding: `${theme.space[16]} ${theme.space[4]}`,
})

export const title = style({
  color: theme.color.text.primary,
  fontSize: theme.font.size["3xl"],
  fontWeight: theme.font.weight.bold,
  lineHeight: theme.font.lineHeight.tight,
  marginBottom: theme.space[2],
})

export const description = style({
  color: theme.color.text.muted,
  marginBottom: theme.space[8],
})

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[4],
})

export const codeInput = style({
  fontSize: theme.font.size.xl,
  letterSpacing: "0.2em",
  textAlign: "center",
})

export const fullWidth = style({
  width: "100%",
})
