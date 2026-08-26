import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[6],
  margin: "0 auto",
  maxWidth: "72rem",
  width: "100%",
})

export const header = style({
  display: "grid",
  gap: theme.space[2],
})

export const eyebrow = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})

export const grid = style({
  display: "grid",
  gap: theme.space[5],
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 28rem), 1fr))",
})

export const card = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[4],
  padding: theme.space[6],
})

export const form = style({
  display: "grid",
  gap: theme.space[3],
})

export const error = style({
  background: theme.color.intent.danger.subtle,
  borderRadius: theme.radius.md,
  color: theme.color.text.danger,
  padding: theme.space[4],
})

export const success = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  overflowWrap: "anywhere",
  padding: theme.space[4],
})

export const diagnostics = style({
  background: theme.color.intent.danger.subtle,
  borderRadius: theme.radius.md,
  color: theme.color.text.danger,
  display: "grid",
  gap: theme.space[2],
  padding: theme.space[4],
})

export const preview = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[3],
  padding: theme.space[4],
})

globalStyle(`${preview} pre`, {
  background: theme.color.background.canvas,
  borderRadius: theme.radius.sm,
  maxHeight: "24rem",
  overflow: "auto",
  padding: theme.space[3],
  whiteSpace: "pre-wrap",
})
