import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[6],
  margin: "0 auto",
  maxWidth: "68rem",
})
export const back = style({
  alignItems: "center",
  color: theme.color.text.secondary,
  display: "inline-flex",
  gap: theme.space[2],
  textDecoration: "none",
  width: "fit-content",
})
export const actions = style({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
export const primaryAction = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.md,
  color: theme.color.text.inverse,
  display: "inline-flex",
  gap: theme.space[2],
  padding: `${theme.space[2]} ${theme.space[4]}`,
  textDecoration: "none",
})
export const secondaryAction = style({
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  cursor: "pointer",
  font: "inherit",
  padding: `${theme.space[2]} ${theme.space[4]}`,
})
export const reviewCard = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[5],
  padding: theme.space[6],
})
export const meta = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
globalStyle(`${meta} span`, {
  background: theme.color.background.subtle,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  fontSize: theme.font.size.xs,
  padding: `${theme.space[1]} ${theme.space[2]}`,
})
export const presentation = style({
  display: "grid",
  gap: theme.space[2],
  minHeight: "8rem",
  placeContent: "center",
  textAlign: "center",
})
export const eyebrow = style({
  color: theme.color.text.link,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.bold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})
export const reveal = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  border: 0,
  borderRadius: theme.radius.md,
  color: theme.color.text.inverse,
  cursor: "pointer",
  display: "inline-flex",
  gap: theme.space[2],
  justifySelf: "center",
  padding: `${theme.space[3]} ${theme.space[5]}`,
})
export const resolution = style({
  background: theme.color.background.subtle,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[2],
  padding: theme.space[5],
})
globalStyle(`${presentation} p, ${resolution} p`, {
  fontSize: theme.font.size.xl,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
})
export const grid = style({
  "@media": { "screen and (max-width: 48rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
})
export const panel = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[4],
  padding: theme.space[5],
})
globalStyle(`${panel} h2, ${panel} h3, ${panel} p`, { margin: 0 })
globalStyle(`${panel} p`, { color: theme.color.text.secondary })
globalStyle(`${panel} dl`, { display: "grid", gap: theme.space[3], margin: 0 })
globalStyle(`${panel} dl > div`, {
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
})
globalStyle(`${panel} dt`, { color: theme.color.text.secondary })
globalStyle(`${panel} dd`, {
  fontWeight: theme.font.weight.semibold,
  margin: 0,
  textAlign: "right",
})
export const list = style({
  display: "grid",
  gap: theme.space[3],
  listStyle: "none",
  margin: 0,
  padding: 0,
})
globalStyle(`${list} li`, { display: "grid", gap: theme.space[1] })
globalStyle(`${list} span`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
})
export const dependencies = style({
  "@media": { "screen and (max-width: 48rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
})
globalStyle(`${dependencies} article`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[2],
  padding: theme.space[4],
})
globalStyle(`${dependencies} code`, {
  color: theme.color.text.muted,
  fontSize: theme.font.size.xs,
  overflowWrap: "anywhere",
})
