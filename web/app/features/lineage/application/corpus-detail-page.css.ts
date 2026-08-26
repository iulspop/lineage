import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[6],
  margin: "0 auto",
  maxWidth: "72rem",
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
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
export const secondaryAction = style({
  alignItems: "center",
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  display: "inline-flex",
  gap: theme.space[2],
  padding: `${theme.space[2]} ${theme.space[4]}`,
  textDecoration: "none",
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
export const tabs = style({
  borderBottom: `1px solid ${theme.color.border.default}`,
  display: "flex",
  gap: theme.space[1],
  overflowX: "auto",
})
export const tab = style({
  color: theme.color.text.secondary,
  padding: `${theme.space[3]} ${theme.space[4]}`,
  textDecoration: "none",
  textTransform: "capitalize",
})
export const activeTab = style([
  tab,
  {
    borderBottom: `2px solid ${theme.color.border.interactive}`,
    color: theme.color.text.primary,
    fontWeight: theme.font.weight.semibold,
  },
])
export const summary = style({
  "@media": {
    "screen and (max-width: 48rem)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
})
globalStyle(`${summary} > div`, {
  display: "grid",
  gap: theme.space[1],
  padding: theme.space[5],
})
globalStyle(`${summary} span`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
})
globalStyle(`${summary} strong`, {
  fontSize: theme.font.size.xl,
  textTransform: "capitalize",
})
export const twoColumn = style({
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
globalStyle(`${panel} h2`, { margin: 0 })
globalStyle(`${panel} p`, { color: theme.color.text.secondary, margin: 0 })
globalStyle(`${panel} small`, { color: theme.color.text.muted })
export const cleanList = style({
  display: "grid",
  gap: theme.space[3],
  listStyle: "none",
  margin: 0,
  padding: 0,
})
globalStyle(`${cleanList} li`, { display: "grid", gap: theme.space[1] })
globalStyle(`${cleanList} a`, {
  color: theme.color.text.link,
  fontWeight: theme.font.weight.semibold,
  textDecoration: "none",
})
globalStyle(`${cleanList} span`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
})
export const toolbar = style({
  alignItems: "end",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
})
globalStyle(`${toolbar} h2`, { margin: `${theme.space[1]} 0 0` })
export const eyebrow = style({
  color: theme.color.text.link,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.bold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})
export const filters = style({
  "@media": {
    "screen and (max-width: 34rem)": { gridTemplateColumns: "1fr" },
    "screen and (max-width: 54rem)": { gridTemplateColumns: "1fr 1fr" },
  },
  display: "grid",
  gap: theme.space[2],
  gridTemplateColumns: "minmax(14rem, 1fr) repeat(4, auto) auto",
})
globalStyle(`${filters} select, ${filters} button`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  font: "inherit",
  padding: `${theme.space[2]} ${theme.space[3]}`,
})
globalStyle(`${filters} button`, {
  background: theme.color.intent.primary.background,
  color: theme.color.text.inverse,
  cursor: "pointer",
})
export const search = style({
  alignItems: "center",
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  display: "flex",
  gap: theme.space[2],
  padding: `${theme.space[2]} ${theme.space[3]}`,
  selectors: { "&:focus-within": { borderColor: theme.color.focus } },
})
globalStyle(`${search} input`, {
  background: "transparent",
  border: 0,
  color: theme.color.text.primary,
  font: "inherit",
  outline: 0,
  width: "100%",
})
export const memoryList = style({ display: "grid", gap: theme.space[3] })
export const memory = style({
  "@media": {
    "screen and (max-width: 36rem)": {
      alignItems: "start",
      flexDirection: "column",
    },
  },
  alignItems: "center",
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  color: theme.color.text.primary,
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  padding: theme.space[5],
  textDecoration: "none",
})
export const memoryMain = style({
  display: "grid",
  gap: theme.space[2],
  minWidth: 0,
})
globalStyle(`${memoryMain} code`, {
  color: theme.color.text.muted,
  fontSize: theme.font.size.xs,
})
globalStyle(`${memoryMain} h3`, {
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.semibold,
  margin: 0,
})
export const badges = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
globalStyle(`${badges} span`, {
  background: theme.color.background.subtle,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  fontSize: theme.font.size.xs,
  padding: `${theme.space[1]} ${theme.space[2]}`,
})
export const due = style({
  background: `${theme.color.intent.warning.subtle} !important`,
  color: `${theme.color.text.warning} !important`,
})
export const revision = style({
  color: theme.color.text.secondary,
  flexShrink: 0,
  fontSize: theme.font.size.sm,
  textAlign: "right",
})
export const empty = style({
  background: theme.color.background.card,
  border: `1px dashed ${theme.color.border.interactive}`,
  borderRadius: theme.radius.lg,
  color: theme.color.text.secondary,
  margin: 0,
  padding: theme.space[8],
  textAlign: "center",
})
export const muted = style({ color: theme.color.text.secondary })
export const cardGrid = style({
  "@media": { "screen and (max-width: 48rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
})
export const timeline = style({
  display: "grid",
  gap: theme.space[4],
  listStyle: "none",
  margin: 0,
  padding: 0,
})
globalStyle(`${timeline} li`, {
  borderLeft: `2px solid ${theme.color.border.interactive}`,
  display: "grid",
  gap: theme.space[1],
  paddingLeft: theme.space[4],
})
globalStyle(`${timeline} li > div`, {
  display: "flex",
  gap: theme.space[3],
  justifyContent: "space-between",
})
globalStyle(`${timeline} a`, {
  color: theme.color.text.link,
  textDecoration: "none",
})
globalStyle(`${timeline} span`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
})
export const advancedGrid = style({ display: "grid", gap: theme.space[4] })
export const details = style({
  display: "grid",
  gap: theme.space[3],
  margin: 0,
})
globalStyle(`${details} > div`, { display: "grid", gap: theme.space[1] })
globalStyle(`${details} dt`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
})
globalStyle(`${details} dd`, { margin: 0, overflowWrap: "anywhere" })
export const raw = style([panel, { overflow: "hidden" }])
globalStyle(`${raw} pre`, {
  background: theme.color.background.subtle,
  borderRadius: theme.radius.md,
  fontSize: theme.font.size.xs,
  margin: 0,
  maxHeight: "36rem",
  overflow: "auto",
  padding: theme.space[4],
  whiteSpace: "pre-wrap",
})
