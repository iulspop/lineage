import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: "54rem",
  padding: `${theme.space[8]} ${theme.layout.pagePadding} ${theme.space[12]}`,
})
export const header = style({
  "@media": { "(max-width: 40rem)": { flexDirection: "column" } },
  alignItems: "flex-start",
  display: "flex",
  gap: theme.space[5],
  justifyContent: "space-between",
  marginBottom: theme.space[8],
})
globalStyle(`${header} h1`, {
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
})
globalStyle(`${header} > div > p`, {
  color: theme.color.text.muted,
})
export const eyebrow = style({
  color: `${theme.color.text.muted} !important`,
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tracked,
  marginBottom: theme.space[1],
  textTransform: "uppercase",
})
export const backLink = style({
  color: theme.color.text.secondary,
  flex: "0 0 auto",
  fontSize: theme.font.role.control,
})
export const status = style({ marginBottom: theme.space[5] })
export const success = style({
  color: theme.color.intent.success.foreground,
  marginBottom: theme.space[5],
})
export const section = style({
  borderTop: `1px solid ${theme.color.border.subtle}`,
  paddingBlock: theme.space[8],
  selectors: { "&:first-of-type": { borderTop: 0, paddingTop: 0 } },
})
export const sectionHeading = style({ marginBottom: theme.space[4] })
globalStyle(`${sectionHeading} h2`, {
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
})
globalStyle(`${sectionHeading} p`, {
  color: theme.color.text.muted,
  marginTop: theme.space[1],
})
export const workspaceList = style({
  display: "grid",
  gap: theme.space[3],
  listStyle: "none",
  padding: 0,
})
export const workspaceCard = style({
  "@media": {
    "(max-width: 34rem)": { alignItems: "flex-start", flexWrap: "wrap" },
  },
  alignItems: "center",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "flex",
  gap: theme.space[3],
  minHeight: "4.5rem",
  padding: theme.space[4],
})
globalStyle(`${workspaceCard} > svg`, {
  color: theme.color.icon.muted,
  flex: "0 0 auto",
  height: "1.25rem",
  width: "1.25rem",
})
export const workspaceCopy = style({
  display: "flex",
  flex: "1 1 12rem",
  flexDirection: "column",
  minWidth: 0,
})
globalStyle(`${workspaceCopy} strong`, {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})
globalStyle(`${workspaceCopy} span`, {
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
})
export const activeBadge = style({
  alignItems: "center",
  background: theme.color.intent.success.subtle,
  borderRadius: theme.radius.full,
  color: theme.color.intent.success.foreground,
  display: "inline-flex",
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[1],
  padding: `${theme.space[1]} ${theme.space[3]}`,
})
globalStyle(`${activeBadge} svg`, { height: "0.9rem", width: "0.9rem" })
export const createForm = style({
  alignItems: "flex-start",
  display: "grid",
  gap: theme.space[4],
  maxWidth: "32rem",
})
globalStyle(`${createForm} > label:first-child`, {
  display: "grid",
  gap: theme.space[2],
  width: "100%",
})
globalStyle(
  `${createForm} input[type="text"], ${createForm} input:not([type])`,
  {
    background: theme.color.background.card,
    border: `1px solid ${theme.color.border.default}`,
    borderRadius: theme.radius.md,
    color: theme.color.text.primary,
    font: "inherit",
    minHeight: theme.layout.controlHeight,
    paddingInline: theme.space[3],
    width: "100%",
  },
)
export const confirmation = style({
  alignItems: "flex-start",
  color: theme.color.text.secondary,
  display: "flex",
  fontSize: theme.font.role.supporting,
  gap: theme.space[2],
})
