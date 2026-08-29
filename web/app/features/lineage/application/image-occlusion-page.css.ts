import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[8],
  margin: "0 auto",
  maxWidth: "82rem",
})
export const layout = style({
  "@media": { "screen and (max-width: 64rem)": { gridTemplateColumns: "1fr" } },
  alignItems: "start",
  display: "grid",
  gap: theme.space[6],
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(22rem, 0.8fr)",
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
export const pasteTarget = style({
  border: `1px dashed ${theme.color.border.strong}`,
  borderRadius: theme.radius.lg,
  minHeight: "18rem",
  outline: "none",
  overflow: "hidden",
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus },
  },
})
export const pasteEmpty = style({
  alignItems: "center",
  color: theme.color.text.secondary,
  display: "flex",
  flexDirection: "column",
  gap: theme.space[2],
  justifyContent: "center",
  minHeight: "18rem",
  padding: theme.space[8],
  textAlign: "center",
})
globalStyle(`${pasteEmpty} svg`, { height: "2rem", width: "2rem" })
export const imageEditor = style({
  cursor: "crosshair",
  position: "relative",
  touchAction: "none",
  userSelect: "none",
})
globalStyle(`${imageEditor} img`, {
  display: "block",
  height: "auto",
  pointerEvents: "none",
  width: "100%",
})
const regionBase = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  position: "absolute" as const,
}
export const drawnRegion = style({
  ...regionBase,
  background: `color-mix(in srgb, ${theme.color.intent.warning.background} 38%, transparent)`,
  border: `3px solid ${theme.color.intent.warning.background}`,
  boxShadow: `0 0 0 2px ${theme.color.background.canvas}, inset 0 0 0 1px ${theme.color.background.canvas}`,
  color: theme.color.text.inverse,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.bold,
  pointerEvents: "none",
  textShadow: "0 1px 2px rgb(0 0 0 / 85%)",
})
export const drawingRegion = style({
  ...regionBase,
  background: `color-mix(in srgb, ${theme.color.intent.warning.background} 28%, transparent)`,
  border: `3px dashed ${theme.color.intent.warning.background}`,
  boxShadow: `0 0 0 2px ${theme.color.background.canvas}`,
  pointerEvents: "none",
})
export const regions = style({ display: "grid", gap: theme.space[4] })
export const sectionHeading = style({
  alignItems: "end",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
})
globalStyle(`${sectionHeading} h2, ${sectionHeading} p`, { margin: 0 })
globalStyle(`${sectionHeading} p`, {
  color: theme.color.text.secondary,
  marginTop: theme.space[1],
})
globalStyle(`${sectionHeading} > span`, {
  color: theme.color.text.secondary,
  whiteSpace: "nowrap",
})
export const regionCard = style({
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[4],
  margin: 0,
  padding: theme.space[4],
})
globalStyle(`${regionCard} legend`, {
  fontWeight: theme.font.weight.bold,
  paddingInline: theme.space[2],
})
export const removeRegion = style({
  alignItems: "center",
  background: "transparent",
  border: 0,
  color: theme.color.text.danger,
  cursor: "pointer",
  display: "inline-flex",
  font: "inherit",
  gap: theme.space[2],
  justifySelf: "start",
  padding: 0,
})
export const emptyRegions = style({
  border: `1px dashed ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.secondary,
  margin: 0,
  padding: theme.space[5],
  textAlign: "center",
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
export const targetOcclusion = style({
  background: theme.color.text.primary,
  border: `3px solid ${theme.color.text.danger}`,
  boxShadow: `0 0 0 2px ${theme.color.background.card}`,
  position: "absolute",
})
export const promptPreview = style({
  borderTop: `1px solid ${theme.color.border.default}`,
  display: "grid",
  gap: theme.space[3],
  paddingTop: theme.space[4],
})
export const previewNote = style({
  color: theme.color.text.secondary,
  margin: 0,
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
