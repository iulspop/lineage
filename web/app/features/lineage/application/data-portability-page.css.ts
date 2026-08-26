import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[6],
  margin: "0 auto",
  maxWidth: "58rem",
})
export const card = style({
  "@media": { "screen and (max-width: 42rem)": { gridTemplateColumns: "1fr" } },
  alignItems: "start",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[6],
  gridTemplateColumns: "minmax(0, 1fr) minmax(15rem, 0.7fr)",
  padding: theme.space[6],
})
globalStyle(`${card} h2`, { fontSize: theme.font.size.xl, margin: 0 })
globalStyle(`${card} p`, {
  color: theme.color.text.secondary,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: `${theme.space[2]} 0 0`,
})
globalStyle(`${card} form`, { display: "grid", gap: theme.space[4] })
globalStyle(`${card} label`, {
  color: theme.color.text.secondary,
  display: "grid",
  fontSize: theme.font.size.sm,
  gap: theme.space[2],
})
globalStyle(`${card} input[type="file"]`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  padding: theme.space[3],
})
globalStyle(`${card} button`, {
  background: theme.color.intent.primary.background,
  border: 0,
  borderRadius: theme.radius.md,
  color: theme.color.intent.primary.foreground,
  cursor: "pointer",
  fontWeight: theme.font.weight.semibold,
  minHeight: "2.75rem",
  padding: `0 ${theme.space[4]}`,
})
export const confirm = style({
  alignItems: "start",
  gridTemplateColumns: "auto 1fr",
})
export const error = style({
  background: theme.color.intent.danger.background,
  borderRadius: theme.radius.md,
  color: theme.color.intent.danger.foreground,
  margin: 0,
  padding: theme.space[4],
})
export const success = style({
  background: theme.color.intent.success.background,
  borderRadius: theme.radius.md,
  color: theme.color.intent.success.foreground,
  margin: 0,
  padding: theme.space[4],
})
