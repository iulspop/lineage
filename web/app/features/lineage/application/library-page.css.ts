import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[8],
  margin: "0 auto",
  maxWidth: "72rem",
})
export const primaryAction = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.md,
  color: theme.color.intent.primary.foreground,
  display: "inline-flex",
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  minHeight: "2.75rem",
  padding: `0 ${theme.space[4]}`,
  textDecoration: "none",
})
export const search = style({
  alignItems: "center",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "flex",
  gap: theme.space[3],
  padding: `${theme.space[3]} ${theme.space[4]}`,
  selectors: {
    "&:focus-within": {
      borderColor: theme.color.focus,
      boxShadow: `0 0 0 3px ${theme.color.accent.subtle}`,
    },
  },
})
globalStyle(`${search} input`, {
  background: "transparent",
  border: 0,
  color: theme.color.text.primary,
  flex: 1,
  font: "inherit",
  minWidth: 0,
  outline: 0,
})
export const grid = style({
  "@media": { "screen and (max-width: 48rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
})
export const card = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  color: theme.color.text.primary,
  display: "grid",
  gap: theme.space[3],
  padding: theme.space[6],
  selectors: {
    "&:hover": {
      borderColor: theme.color.border.strong,
      transform: "translateY(-2px)",
    },
  },
  textDecoration: "none",
  transition: `border-color ${theme.duration.fast} ${theme.easing.standard}, transform ${theme.duration.fast} ${theme.easing.standard}`,
})
globalStyle(`${card} code`, {
  color: theme.color.text.muted,
  fontSize: theme.font.size.xs,
})
globalStyle(`${card} h2`, {
  fontSize: theme.font.size.xl,
  margin: 0,
  textTransform: "capitalize",
})
globalStyle(`${card} p`, { color: theme.color.text.secondary, margin: 0 })
export const cardTopline = style({
  alignItems: "center",
  color: theme.color.text.link,
  display: "flex",
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  justifyContent: "space-between",
})
export const empty = style({
  alignItems: "center",
  background: theme.color.background.card,
  border: `1px dashed ${theme.color.border.interactive}`,
  borderRadius: theme.radius.lg,
  display: "flex",
  flexDirection: "column",
  gap: theme.space[3],
  padding: `${theme.space[10]} ${theme.space[6]}`,
  textAlign: "center",
})
globalStyle(`${empty} h2`, { margin: 0 })
globalStyle(`${empty} p`, {
  color: theme.color.text.secondary,
  margin: 0,
  maxWidth: "30rem",
})
