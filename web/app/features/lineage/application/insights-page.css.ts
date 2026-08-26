import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[8],
  margin: "0 auto",
  maxWidth: "76rem",
})
export const summaryGrid = style({
  "@media": {
    "screen and (max-width: 34rem)": { gridTemplateColumns: "1fr" },
    "screen and (max-width: 52rem)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
})
export const panel = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[5],
  padding: theme.space[6],
})
export const panelHeading = style({
  alignItems: "end",
  display: "flex",
  justifyContent: "space-between",
})
globalStyle(`${panelHeading} h2`, {
  fontSize: theme.font.size.xl,
  margin: `${theme.space[1]} 0 0`,
})
export const eyebrow = style({
  color: theme.color.text.link,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.bold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})
export const chart = style({
  alignItems: "end",
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "repeat(7, 1fr)",
  minHeight: "10rem",
})
export const barColumn = style({
  alignItems: "center",
  color: theme.color.text.secondary,
  display: "flex",
  flexDirection: "column",
  fontSize: theme.font.size.xs,
  gap: theme.space[2],
  justifyContent: "end",
})
export const bar = style({
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.sm,
  display: "block",
  maxWidth: "2.5rem",
  minHeight: "0.5rem",
  width: "100%",
})
export const barValue = style({
  color: theme.color.text.primary,
  fontWeight: theme.font.weight.semibold,
})
export const twoColumn = style({
  "@media": { "screen and (max-width: 48rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
})
export const stack = style({ display: "grid", gap: theme.space[2] })
export const rowLink = style({
  alignItems: "center",
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  padding: theme.space[3],
  selectors: { "&:hover": { background: theme.color.background.subtle } },
  textDecoration: "none",
})
globalStyle(`${rowLink} > span:first-child`, {
  display: "grid",
  gap: theme.space[1],
})
globalStyle(`${rowLink} small`, { color: theme.color.text.secondary })
export const filters = style({
  alignItems: "end",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[3],
})
globalStyle(`${filters} label`, {
  color: theme.color.text.secondary,
  display: "grid",
  fontSize: theme.font.size.sm,
  gap: theme.space[1],
})
globalStyle(`${filters} select`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  minHeight: "2.5rem",
  padding: `0 ${theme.space[3]}`,
})
globalStyle(`${filters} button`, {
  background: theme.color.intent.primary.background,
  border: 0,
  borderRadius: theme.radius.md,
  color: theme.color.intent.primary.foreground,
  cursor: "pointer",
  fontWeight: theme.font.weight.semibold,
  minHeight: "2.5rem",
  padding: `0 ${theme.space[4]}`,
})
export const tableWrap = style({ overflowX: "auto" })
export const table = style({
  borderCollapse: "collapse",
  minWidth: "48rem",
  width: "100%",
})
globalStyle(`${table} th`, {
  borderBottom: `1px solid ${theme.color.border.strong}`,
  color: theme.color.text.secondary,
  fontSize: theme.font.size.xs,
  padding: theme.space[3],
  textAlign: "left",
  textTransform: "uppercase",
})
globalStyle(`${table} td`, {
  borderBottom: `1px solid ${theme.color.border.default}`,
  padding: theme.space[3],
  verticalAlign: "top",
})
globalStyle(`${table} td:nth-child(2)`, {
  display: "grid",
  gap: theme.space[1],
})
globalStyle(`${table} a`, {
  color: theme.color.text.link,
  fontWeight: theme.font.weight.semibold,
})
globalStyle(`${table} small`, { color: theme.color.text.secondary })
export const rating = style({
  background: theme.color.background.subtle,
  borderRadius: theme.radius.sm,
  display: "inline-block",
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.bold,
  padding: `${theme.space[1]} ${theme.space[2]}`,
  textTransform: "uppercase",
})
export const empty = style({ color: theme.color.text.secondary, margin: 0 })
export const srTable = style({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
})
