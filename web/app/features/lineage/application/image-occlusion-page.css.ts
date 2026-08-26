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
  alignItems: "start",
  display: "grid",
  gap: theme.space[6],
  gridTemplateColumns: "minmax(0, 1.05fr) minmax(20rem, 0.95fr)",
})
export const card = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.sm,
  display: "grid",
  gap: theme.space[5],
  padding: theme.space[6],
})
globalStyle(`${card} h2`, {
  alignItems: "center",
  display: "flex",
  fontSize: theme.font.size.xl,
  gap: theme.space[2],
  margin: 0,
})
export const field = style({ display: "grid", gap: theme.space[2] })
globalStyle(`${field} > span`, { fontWeight: theme.font.weight.semibold })
globalStyle(`${field} small`, { color: theme.color.text.secondary })
globalStyle(`${field} input, ${field} textarea`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.strong}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  font: "inherit",
  minHeight: "2.75rem",
  padding: `${theme.space[3]} ${theme.space[4]}`,
  width: "100%",
})
export const regionGrid = style({
  "@media": {
    "screen and (max-width: 34rem)": { gridTemplateColumns: "1fr 1fr" },
  },
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "repeat(4, 1fr)",
})
export const imageStage = style({
  borderRadius: theme.radius.md,
  overflow: "hidden",
  position: "relative",
})
globalStyle(`${imageStage} img`, {
  display: "block",
  height: "auto",
  width: "100%",
})
export const occlusion = style({
  background: theme.color.text.primary,
  border: `2px solid ${theme.color.background.card}`,
  boxShadow: theme.shadow.sm,
  position: "absolute",
})
export const challenge = style({
  fontSize: theme.font.size.lg,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
})
export const empty = style({
  alignItems: "center",
  border: `1px dashed ${theme.color.border.strong}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.secondary,
  display: "flex",
  minHeight: "16rem",
  padding: theme.space[6],
  textAlign: "center",
})
export const error = style({
  background: theme.color.intent.danger.subtle,
  borderRadius: theme.radius.md,
  padding: theme.space[5],
})
