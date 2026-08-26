import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: "64rem",
  padding: `${theme.space[8]} ${theme.layout.pagePadding} ${theme.space[12]}`,
})
export const header = style({
  alignItems: "flex-start",
  display: "flex",
  gap: theme.space[5],
  justifyContent: "space-between",
  marginBottom: theme.space[8],
})
export const title = style({
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
  lineHeight: theme.font.lineHeight.tight,
})
export const subtitle = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  marginTop: theme.space[2],
})
export const backLink = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.role.control,
  fontWeight: theme.font.weight.medium,
  paddingBlock: theme.space[1],
})

export const layout = style({
  "@media": {
    "(max-width: 42rem)": { gap: theme.space[6], gridTemplateColumns: "1fr" },
  },
  alignItems: "start",
  display: "grid",
  gap: theme.space[10],
  gridTemplateColumns: "10rem minmax(0, 1fr)",
})
export const sectionNav = style({
  "@media": {
    "(max-width: 42rem)": {
      borderBottom: `1px solid ${theme.color.border.subtle}`,
      flexDirection: "row",
      overflowX: "auto",
      paddingBottom: theme.space[3],
      position: "static",
    },
  },
  display: "flex",
  flexDirection: "column",
  gap: theme.space[1],
  position: "sticky",
  top: theme.space[6],
})
globalStyle(`${sectionNav} a`, {
  borderRadius: theme.radius.sm,
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
  padding: `${theme.space[2]} ${theme.space[3]}`,
  textDecoration: "none",
  whiteSpace: "nowrap",
})
globalStyle(`${sectionNav} a:hover`, {
  background: theme.color.background.subtle,
  color: theme.color.text.primary,
})
globalStyle(`${sectionNav} a:focus-visible`, {
  boxShadow: theme.shadow.focus,
  outline: "none",
})

export const sections = style({ minWidth: 0 })
export const section = style({
  borderTop: `1px solid ${theme.color.border.subtle}`,
  paddingBlock: theme.space[8],
  scrollMarginTop: theme.space[6],
  selectors: { "&:first-child": { borderTop: 0, paddingTop: 0 } },
})
export const sectionHeading = style({ marginBottom: theme.space[4] })
globalStyle(`${sectionHeading} h2`, {
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
})
globalStyle(`${sectionHeading} p`, {
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  marginTop: theme.space[1],
})

export const settingRow = style({
  "@media": {
    "(max-width: 34rem)": { alignItems: "flex-start", flexWrap: "wrap" },
  },
  alignItems: "center",
  display: "flex",
  gap: theme.space[3],
  minHeight: "3.5rem",
  paddingBlock: theme.space[2],
})
export const rowIcon = style({
  color: theme.color.icon.muted,
  flex: "0 0 auto",
})
export const rowIconPlaceholder = style({ flex: "0 0 1.0625rem" })
export const settingCopy = style({
  display: "flex",
  flex: "1 1 14rem",
  flexDirection: "column",
  gap: theme.space[1],
  minWidth: 0,
})
export const settingTitle = style({
  color: theme.color.text.primary,
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.medium,
})
export const settingDescription = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  lineHeight: theme.font.lineHeight.normal,
})
export const badge = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  flex: "0 0 auto",
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.medium,
  padding: `${theme.space[1]} ${theme.space[2]}`,
})
export const rowLink = style({
  color: theme.color.intent.primary.background,
  flex: "0 0 auto",
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
})
export const notificationRows = style({
  borderTop: `1px solid ${theme.color.border.subtle}`,
  marginTop: theme.space[2],
  paddingTop: theme.space[2],
})

export const passkeyList = style({
  borderTop: `1px solid ${theme.color.border.subtle}`,
  listStyle: "none",
  marginTop: theme.space[2],
  padding: 0,
})
export const passkeyItem = style({
  alignItems: "center",
  display: "flex",
  fontSize: theme.font.role.supporting,
  gap: theme.space[3],
  justifyContent: "space-between",
  minHeight: "3rem",
  paddingBlock: theme.space[2],
})
export const status = style({
  fontSize: theme.font.role.supporting,
  marginTop: theme.space[2],
})
export const success = style({ color: theme.color.intent.success.foreground })
