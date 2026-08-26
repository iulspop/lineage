import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[8],
  margin: "0 auto",
  maxWidth: "76rem",
})
export const layout = style({
  "@media": { "screen and (max-width: 58rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[5],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
})
export const card = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[5],
  padding: theme.space[6],
})
export const form = style({ display: "grid", gap: theme.space[4] })
export const check = style({
  alignItems: "start",
  display: "flex",
  fontWeight: theme.font.weight.normal,
  gap: theme.space[2],
})
export const preview = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[4],
  padding: theme.space[6],
})
export const inventory = style({ display: "grid", gap: theme.space[4] })

globalStyle(`${card} h2, ${preview} h2, ${inventory} h2`, { margin: 0 })
globalStyle(`${card} h2`, {
  alignItems: "center",
  display: "flex",
  gap: theme.space[2],
})
globalStyle(`${form} > label`, {
  display: "grid",
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
})
globalStyle(`${form} input:not([type]), ${form} textarea`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.strong}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  font: "inherit",
  padding: theme.space[3],
  width: "100%",
})
globalStyle(`${form} fieldset`, {
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[2],
  margin: 0,
  padding: theme.space[4],
})
globalStyle(`${inventory} article`, {
  borderTop: `1px solid ${theme.color.border.default}`,
  display: "grid",
  gap: theme.space[2],
  paddingBlock: theme.space[4],
})
globalStyle(`${inventory} small`, {
  color: theme.color.text.secondary,
  display: "block",
})
globalStyle(`${inventory} p`, { margin: 0 })
