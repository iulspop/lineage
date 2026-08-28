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
  flexWrap: "wrap",
  gap: theme.space[4],
  justifyContent: "space-between",
})
globalStyle(`${toolbar} h2`, { margin: `${theme.space[1]} 0 0` })
export const revealActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
globalStyle(`${revealActions} button`, {
  alignItems: "center",
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  cursor: "pointer",
  display: "inline-flex",
  font: "inherit",
  gap: theme.space[2],
  minHeight: "2.75rem",
  padding: `${theme.space[2]} ${theme.space[3]}`,
})
globalStyle(`${revealActions} button:disabled`, {
  cursor: "wait",
  opacity: 0.6,
})
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
export const memoryList = style({ display: "grid", gap: theme.space[4] })
export const memory = style({
  "@media": {
    "screen and (max-width: 36rem)": {
      alignItems: "stretch",
      flexDirection: "column",
    },
  },
  alignItems: "stretch",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.xs,
  color: theme.color.text.primary,
  display: "flex",
  gap: theme.space[6],
  justifyContent: "space-between",
  overflow: "hidden",
  padding: theme.space[5],
  position: "relative",
  selectors: {
    "&::before": {
      background: theme.color.accent.solid,
      borderRadius: theme.radius.full,
      content: '""',
      inset: `${theme.space[4]} auto ${theme.space[4]} 0`,
      opacity: 0,
      position: "absolute",
      transition: `opacity ${theme.duration.fast} ${theme.easing.standard}`,
      width: "3px",
    },
    "&:focus-within": {
      borderColor: theme.color.border.interactive,
      boxShadow: theme.shadow.focus,
    },
    "&:hover": {
      borderColor: theme.color.border.interactive,
      boxShadow: theme.shadow.elevated,
      transform: "translateY(-1px)",
    },
    "&:hover::before": { opacity: 1 },
  },
  transition: `border-color ${theme.duration.normal} ${theme.easing.standard}, box-shadow ${theme.duration.normal} ${theme.easing.standard}, transform ${theme.duration.fast} ${theme.easing.standard}`,
})
export const memoryMain = style({
  alignContent: "start",
  display: "grid",
  flex: 1,
  gap: theme.space[3],
  minWidth: 0,
})
globalStyle(`${memoryMain} h3`, {
  fontSize: theme.font.size.lg,
  fontWeight: theme.font.weight.semibold,
  lineHeight: theme.font.lineHeight.tight,
  margin: 0,
  maxWidth: "48rem",
})
globalStyle(`${memoryMain} h3 a`, {
  color: theme.color.text.primary,
  textDecoration: "none",
  textDecorationThickness: "1px",
  textUnderlineOffset: "0.18em",
})
globalStyle(`${memoryMain} h3 a:hover`, {
  color: theme.color.text.link,
  textDecoration: "underline",
})
export const memoryResolution = style({
  background: theme.color.accent.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[2],
  marginTop: theme.space[1],
  padding: `${theme.space[3]} ${theme.space[4]}`,
})
globalStyle(`${memoryResolution} p`, {
  color: theme.color.text.primary,
  margin: 0,
})
export const memoryAside = style({
  "@media": {
    "screen and (max-width: 36rem)": {
      alignItems: "center",
      borderLeft: 0,
      borderTop: `1px solid ${theme.color.border.subtle}`,
      gridTemplateColumns: "1fr auto",
      justifyItems: "stretch",
      paddingLeft: 0,
      paddingTop: theme.space[4],
    },
  },
  alignContent: "space-between",
  alignItems: "end",
  borderLeft: `1px solid ${theme.color.border.subtle}`,
  display: "grid",
  flexShrink: 0,
  gap: theme.space[4],
  justifyItems: "end",
  minWidth: "10.5rem",
  paddingLeft: theme.space[5],
})
globalStyle(`${memoryAside} button`, {
  alignItems: "center",
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.primary,
  cursor: "pointer",
  display: "inline-flex",
  font: "inherit",
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  minHeight: "2.5rem",
  padding: `${theme.space[2]} ${theme.space[4]}`,
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, border-color ${theme.duration.fast} ${theme.easing.standard}`,
})
globalStyle(`${memoryAside} button:hover`, {
  background: theme.color.accent.subtle,
  borderColor: theme.color.border.interactive,
})
globalStyle(`${memoryAside} button:focus-visible`, {
  boxShadow: theme.shadow.focus,
  outline: 0,
})
globalStyle(`${memoryAside} button:disabled`, {
  cursor: "wait",
  opacity: 0.6,
})
export const badges = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
globalStyle(`${badges} span`, {
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tracked,
  padding: `${theme.space[1]} ${theme.space[2]}`,
  textTransform: "capitalize",
})
export const due = style({
  background: `${theme.color.intent.warning.subtle} !important`,
  borderColor: `${theme.color.intent.warning.background} !important`,
  color: `${theme.color.text.warning} !important`,
})
export const memoryMeta = style({
  display: "flex",
  gap: theme.space[4],
  margin: 0,
})
globalStyle(`${memoryMeta} div`, {
  display: "grid",
  gap: theme.space[1],
  textAlign: "right",
})
globalStyle(`${memoryMeta} dt`, {
  color: theme.color.text.muted,
  fontSize: theme.font.size.xs,
})
globalStyle(`${memoryMeta} dd`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  margin: 0,
  textTransform: "capitalize",
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
export const sectionStack = style({ display: "grid", gap: theme.space[5] })
export const sectionHeader = style({
  alignItems: "end",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
})
globalStyle(`${sectionHeader} h2, ${sectionHeader} p`, { margin: 0 })
globalStyle(`${sectionHeader} p`, {
  color: theme.color.text.secondary,
  marginTop: theme.space[1],
})
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
export const disclosureButton = style({
  alignItems: "center",
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  cursor: "pointer",
  display: "inline-flex",
  font: "inherit",
  gap: theme.space[2],
  marginBottom: theme.space[3],
  minHeight: "2.75rem",
  padding: `${theme.space[2]} ${theme.space[3]}`,
})
globalStyle(`${disclosureButton}:disabled`, {
  cursor: "wait",
  opacity: 0.6,
})
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
