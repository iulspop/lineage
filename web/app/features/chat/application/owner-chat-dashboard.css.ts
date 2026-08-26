import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  "@media": {
    "(max-width: 48rem)": {
      borderInline: 0,
      borderRadius: 0,
      minHeight: "calc(100dvh - 7rem - env(safe-area-inset-bottom))",
    },
  },
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  marginInline: "auto",
  maxWidth: "52rem",
  minHeight: "min(42rem, calc(100dvh - 3rem))",
  overflow: "hidden",
  width: "100%",
})
export const header = style({
  alignItems: "center",
  borderBottom: `1px solid ${theme.color.border.subtle}`,
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "2.25rem minmax(0, 1fr)",
  minHeight: "4.25rem",
  padding: `${theme.space[2]} ${theme.space[4]}`,
})
export const backLink = style({
  alignItems: "center",
  borderRadius: theme.radius.md,
  color: theme.color.icon.default,
  display: "inline-flex",
  height: "2.25rem",
  justifyContent: "center",
  selectors: {
    "&:hover": { background: theme.color.background.subtle },
  },
  textDecoration: "none",
  width: "2.25rem",
})
export const heading = style({ minWidth: 0 })
export const title = style({
  color: theme.color.text.primary,
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
  lineHeight: theme.font.lineHeight.compact,
})
export const subtitle = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  marginTop: theme.space[1],
})
export const empty = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  flexDirection: "column",
  fontSize: theme.font.role.supporting,
  gap: theme.space[1],
  justifyContent: "center",
  minHeight: "28rem",
  padding: theme.space[6],
  textAlign: "center",
})
globalStyle(`${empty} svg`, { marginBottom: theme.space[2] })
globalStyle(`${empty} strong`, {
  color: theme.color.text.primary,
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
})
export const list = style({ listStyle: "none", margin: 0, padding: 0 })
export const listItem = style({
  borderBottom: `1px solid ${theme.color.border.subtle}`,
  selectors: { "&:last-child": { borderBottom: 0 } },
})
export const conversation = style({
  alignItems: "center",
  color: theme.color.text.primary,
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "2.5rem minmax(0, 1fr) auto",
  minHeight: "4.75rem",
  padding: `${theme.space[3]} ${theme.space[4]}`,
  selectors: {
    "&:hover": { background: theme.color.background.subtle },
  },
  textDecoration: "none",
  transition: `background ${theme.duration.fast} ${theme.easing.standard}`,
})
export const avatar = style({
  alignItems: "center",
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  display: "inline-flex",
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.semibold,
  height: "2.5rem",
  justifyContent: "center",
  width: "2.5rem",
})
export const conversationMain = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[1],
  minWidth: 0,
})
export const conversationTopline = style({
  alignItems: "baseline",
  display: "flex",
  gap: theme.space[3],
  justifyContent: "space-between",
  minWidth: 0,
})
globalStyle(`${conversationTopline} strong`, {
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})
globalStyle(`${conversationTopline} time`, {
  color: theme.color.text.muted,
  flex: "0 0 auto",
  fontSize: theme.font.role.metadata,
})
export const conversationBottomline = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[2],
  minWidth: 0,
})
export const preview = style({
  color: theme.color.text.secondary,
  flex: "1 1 auto",
  fontSize: theme.font.role.supporting,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})
export const presence = style({
  color: theme.color.text.muted,
  flex: "0 0 auto",
  fontSize: theme.font.role.metadata,
})
export const badge = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.full,
  color: theme.color.intent.primary.foreground,
  display: "inline-flex",
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.semibold,
  height: "1.25rem",
  justifyContent: "center",
  minWidth: "1.25rem",
  paddingInline: theme.space[1],
})
export const chevron = style({ color: theme.color.icon.muted })
export const visuallyHidden = style({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
})
