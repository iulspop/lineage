import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const shell = style({
  background: theme.color.background.canvas,
  color: theme.color.text.primary,
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  minHeight: "100dvh",
  padding: `${theme.space[4]} clamp(${theme.space[4]}, 4vw, ${theme.space[8]})`,
})

export const topbar = style({
  alignItems: "center",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  minHeight: "3rem",
})

export const topbarActions = style({
  display: "flex",
  gap: theme.space[2],
  justifyContent: "flex-end",
})

export const iconButton = style({
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: theme.radius.md,
  color: theme.color.text.muted,
  cursor: "pointer",
  display: "inline-flex",
  height: "2.75rem",
  justifyContent: "center",
  padding: 0,
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: 0 },
    "&:hover": {
      background: theme.color.background.subtle,
      color: theme.color.text.primary,
    },
  },
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, color ${theme.duration.fast} ${theme.easing.standard}`,
  width: "2.75rem",
})

export const iconLink = style([
  iconButton,
  { justifySelf: "start", textDecoration: "none" },
])

export const sessionProgress = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  fontSize: theme.font.role.metadata,
  gap: theme.space[2],
  justifyContent: "center",
})

export const stage = style({
  alignItems: "center",
  display: "grid",
  justifyItems: "center",
  paddingBlock: `clamp(${theme.space[6]}, 8vh, 6rem)`,
})

export const reviewSurface = style({
  display: "grid",
  gap: `clamp(${theme.space[6]}, 7vh, 5rem)`,
  maxWidth: "68rem",
  width: "100%",
})

export const content = style({
  color: theme.color.text.primary,
  display: "grid",
  fontSize: "clamp(2rem, 4vw, 4rem)",
  fontWeight: theme.font.weight.medium,
  gap: theme.space[5],
  letterSpacing: "-0.03em",
  lineHeight: 1.16,
  marginInline: "auto",
  maxWidth: "28ch",
  textAlign: "center",
  textWrap: "balance",
  width: "100%",
})

export const imageOcclusionHint = style({
  fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
  fontWeight: theme.font.weight.medium,
  letterSpacing: "-0.015em",
  lineHeight: theme.font.lineHeight.relaxed,
})

export const reviewImage = style({
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.elevated,
  marginInline: "auto",
  maxHeight: "55vh",
  maxWidth: "52rem",
  overflow: "hidden",
  position: "relative",
})

export const visuallyHidden = style({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
})

export const reviewOcclusion = style({
  background: theme.color.text.primary,
  border: `2px solid ${theme.color.background.card}`,
  boxShadow: theme.shadow.sm,
  position: "absolute",
})

export const reviewTargetOcclusion = style({
  alignItems: "center",
  background: theme.color.text.primary,
  border: `4px solid ${theme.color.text.danger}`,
  boxShadow: `0 0 0 3px ${theme.color.background.card}`,
  color: theme.color.text.inverse,
  display: "flex",
  fontSize: "clamp(1.5rem, 5vw, 3.5rem)",
  fontWeight: theme.font.weight.bold,
  justifyContent: "center",
  position: "absolute",
})

export const recallControls = style({
  alignItems: "center",
  display: "grid",
  gap: theme.space[4],
  justifyItems: "center",
  marginInline: "auto",
  maxWidth: "36rem",
  width: "100%",
})

export const attemptField = style({
  display: "grid",
  gap: theme.space[2],
  width: "100%",
})

export const instruction = style({
  color: theme.color.text.muted,
  margin: 0,
  textAlign: "center",
})

export const assessmentForm = style({ width: "100%" })

export const assessmentGroup = style({
  "@media": {
    "screen and (max-width: 42rem)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
  border: 0,
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  margin: 0,
  padding: 0,
})

export const completionControls = style({
  "@media": {
    "screen and (max-width: 36rem)": {
      alignItems: "stretch",
      flexDirection: "column",
    },
  },
  alignItems: "center",
  display: "flex",
  gap: theme.space[5],
  justifyContent: "space-between",
  marginInline: "auto",
  maxWidth: "42rem",
  width: "100%",
})

export const centeredState = style({
  alignItems: "center",
  display: "grid",
  gap: theme.space[4],
  justifyItems: "center",
  maxWidth: "38rem",
  textAlign: "center",
})

export const eyebrow = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: "0.08em",
  margin: 0,
  textTransform: "uppercase",
})

export const actions = style({ display: "flex", gap: theme.space[3] })

export const continueLink = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.md,
  color: theme.color.intent.primary.foreground,
  display: "inline-flex",
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[3],
  justifyContent: "center",
  minHeight: "3rem",
  paddingInline: theme.space[5],
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: 0 },
  },
  textDecoration: "none",
})

export const secondaryLink = style({
  alignItems: "center",
  color: theme.color.text.primary,
  display: "inline-flex",
  fontWeight: theme.font.weight.semibold,
  minHeight: "3rem",
  paddingInline: theme.space[4],
  textDecoration: "none",
})

export const shortcutHelp = style({
  background: theme.color.background.elevated,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.elevated,
  display: "grid",
  gap: theme.space[4],
  maxWidth: "26rem",
  padding: theme.space[5],
  position: "fixed",
  right: theme.space[5],
  top: "4.75rem",
  width: `calc(100vw - ${theme.space[8]})`,
  zIndex: 10,
})

export const shortcutHelpHeader = style({
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
})

export const editPanel = style({
  background: theme.color.background.elevated,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: `${theme.shadow.elevated}, 0 0 0 100vmax rgb(0 0 0 / 55%)`,
  display: "grid",
  gap: theme.space[3],
  left: "50%",
  maxHeight: "calc(100dvh - 2rem)",
  maxWidth: "42rem",
  overflowY: "auto",
  padding: theme.space[5],
  position: "fixed",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "calc(100vw - 2rem)",
  zIndex: 20,
})

export const editHeader = style({
  alignItems: "start",
  display: "flex",
  justifyContent: "space-between",
})

export const editTextarea = style({
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  font: "inherit",
  lineHeight: theme.font.lineHeight.relaxed,
  padding: theme.space[3],
  resize: "vertical",
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: 0 },
  },
})

export const editActions = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  fontSize: theme.font.role.metadata,
  justifyContent: "space-between",
})

export const error = style({
  background: theme.color.intent.danger.subtle,
  borderRadius: theme.radius.md,
  color: theme.color.text.danger,
  marginInline: "auto",
  maxWidth: "42rem",
  padding: theme.space[3],
  textAlign: "center",
  width: "100%",
})

export const footer = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  fontSize: theme.font.role.metadata,
  justifyContent: "space-between",
  minHeight: "3rem",
})

globalStyle(`${content} h1`, {
  font: "inherit",
  letterSpacing: "inherit",
  margin: 0,
})
globalStyle(`${content} p`, { margin: 0 })
globalStyle(`${reviewImage} img`, {
  display: "block",
  height: "100%",
  objectFit: "contain",
  width: "100%",
})
globalStyle(`${recallControls} > button`, {
  minHeight: "3.5rem",
  minWidth: "14rem",
})
globalStyle(`${recallControls} kbd`, {
  background: "transparent",
  color: "inherit",
  marginLeft: theme.space[3],
})
globalStyle(`${assessmentGroup} > button`, {
  display: "grid",
  gap: theme.space[1],
  minHeight: "5rem",
})
globalStyle(`${assessmentGroup} > button span:nth-child(2)`, {
  fontSize: theme.font.role.metadata,
  opacity: 0.75,
})
globalStyle(`${assessmentGroup} kbd`, { opacity: 0.55 })
globalStyle(`${assessmentGroup} legend`, {
  color: theme.color.text.muted,
  marginBottom: theme.space[3],
  textAlign: "center",
  width: "100%",
})
globalStyle(`${completionControls} p`, {
  color: theme.color.text.muted,
  marginBottom: 0,
})
globalStyle(`${centeredState} h1`, {
  fontSize: "clamp(2rem, 5vw, 4rem)",
  margin: 0,
})
globalStyle(`${centeredState} p`, {
  color: theme.color.text.muted,
  margin: 0,
})
globalStyle(`${shortcutHelp} dd`, {
  color: theme.color.text.muted,
  margin: 0,
})
globalStyle(`${shortcutHelp} dl`, {
  display: "grid",
  gap: theme.space[3],
  margin: 0,
})
globalStyle(`${shortcutHelp} dl > div`, {
  alignItems: "center",
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "5rem 1fr",
})
globalStyle(`${shortcutHelp} dt`, { margin: 0 })
globalStyle(`${editHeader} h2`, { marginBlock: `${theme.space[1]} 0` })
