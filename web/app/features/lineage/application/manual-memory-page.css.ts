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
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(20rem, 0.9fr)",
})

const card = {
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.sm,
  display: "grid",
  gap: theme.space[6],
  padding: theme.space[6],
} as const

export const quickCard = style({
  ...card,
  "@media": {
    "screen and (max-width: 42rem)": {
      alignItems: "stretch",
      gridTemplateColumns: "1fr",
    },
  },
  alignItems: "end",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  padding: theme.space[5],
})

export const quickField = style({ display: "grid", gap: theme.space[2] })
globalStyle(`${quickField} > span`, {
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
})
globalStyle(`${quickField} textarea`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.strong}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  font: "inherit",
  fontSize: theme.font.size.lg,
  lineHeight: theme.font.lineHeight.normal,
  minHeight: "8rem",
  padding: `${theme.space[3]} ${theme.space[4]}`,
  resize: "vertical",
  width: "100%",
})
globalStyle(`${quickField} textarea:focus`, {
  borderColor: theme.color.intent.primary.background,
  outline: `2px solid ${theme.color.accent.subtle}`,
  outlineOffset: "2px",
})

export const quickHelp = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
  gridColumn: "1 / -1",
  margin: 0,
})
globalStyle(`${quickHelp} code`, {
  color: theme.color.text.primary,
  fontWeight: theme.font.weight.semibold,
})

export const quickError = style({
  color: theme.color.text.danger,
  gridColumn: "1 / -1",
  margin: 0,
})
globalStyle(`${quickError} p`, { margin: 0 })

export const advanced = style({ display: "grid", gap: theme.space[4] })
globalStyle(`${advanced} > summary`, {
  color: theme.color.text.secondary,
  cursor: "pointer",
  fontWeight: theme.font.weight.semibold,
  justifySelf: "start",
})
globalStyle(`${advanced}[open] > summary`, { marginBottom: theme.space[4] })

export const formCard = style(card)
export const previewCard = style({
  ...card,
  position: "sticky",
  top: theme.space[6],
})

export const sectionHeading = style({
  alignItems: "flex-start",
  display: "flex",
  gap: theme.space[3],
})
globalStyle(`${sectionHeading} svg`, {
  color: theme.color.intent.primary.background,
  flexShrink: 0,
  height: "1.5rem",
  marginTop: theme.space[1],
  width: "1.5rem",
})
globalStyle(`${sectionHeading} h2`, {
  fontSize: theme.font.size.xl,
  margin: 0,
})
globalStyle(`${sectionHeading} p`, {
  color: theme.color.text.secondary,
  margin: `${theme.space[1]} 0 0`,
})

export const field = style({ display: "grid", gap: theme.space[2] })
globalStyle(`${field} > span`, { fontWeight: theme.font.weight.semibold })
globalStyle(`${field} small`, { color: theme.color.text.secondary })
globalStyle(`${field} input, ${field} select, ${field} textarea`, {
  background: theme.color.background.canvas,
  border: `1px solid ${theme.color.border.strong}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  font: "inherit",
  lineHeight: theme.font.lineHeight.normal,
  minHeight: "2.75rem",
  padding: `${theme.space[3]} ${theme.space[4]}`,
  resize: "vertical",
  width: "100%",
})
globalStyle(
  `${field} input:focus, ${field} select:focus, ${field} textarea:focus`,
  {
    borderColor: theme.color.intent.primary.background,
    outline: `2px solid ${theme.color.accent.subtle}`,
    outlineOffset: "2px",
  },
)

export const twoColumns = style({
  "@media": { "screen and (max-width: 36rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "1fr 1fr",
})

export const reviewPreview = style({
  background: theme.color.background.subtle,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[4],
  padding: theme.space[6],
})
globalStyle(`${reviewPreview} p`, {
  fontSize: theme.font.size.lg,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
})
globalStyle(`${reviewPreview} summary`, {
  color: theme.color.intent.primary.background,
  cursor: "pointer",
  fontWeight: theme.font.weight.semibold,
})

export const previewLabel = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.bold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})

export const resolution = style({
  borderTop: `1px solid ${theme.color.border.default}`,
  display: "grid",
  gap: theme.space[2],
  marginTop: theme.space[4],
  paddingTop: theme.space[4],
})

export const diagnostics = style({
  background: theme.color.intent.danger.subtle,
  borderRadius: theme.radius.md,
  color: theme.color.text.primary,
  padding: theme.space[5],
})
globalStyle(`${diagnostics} h3`, { margin: `0 0 ${theme.space[3]}` })
globalStyle(`${diagnostics} ul`, {
  display: "grid",
  gap: theme.space[3],
  listStyle: "none",
  margin: 0,
  padding: 0,
})
globalStyle(`${diagnostics} li`, { display: "grid", gap: theme.space[1] })
globalStyle(`${diagnostics} code`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.size.xs,
})

export const emptyPreview = style({
  alignItems: "center",
  border: `1px dashed ${theme.color.border.strong}`,
  borderRadius: theme.radius.md,
  color: theme.color.text.secondary,
  display: "flex",
  minHeight: "14rem",
  padding: theme.space[6],
  textAlign: "center",
})

const actionBase = {
  alignItems: "center",
  borderRadius: theme.radius.md,
  display: "inline-flex",
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  justifyContent: "center",
  minHeight: "2.75rem",
  padding: `${theme.space[3]} ${theme.space[5]}`,
  textDecoration: "none",
} as const

export const headerActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})
export const secondaryAction = style({
  ...actionBase,
  border: `1px solid ${theme.color.border.strong}`,
  color: theme.color.text.primary,
})
export const backLink = style({
  ...actionBase,
  color: theme.color.text.secondary,
  justifySelf: "start",
})
