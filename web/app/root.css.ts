import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const errorPage = style({
  alignContent: "center",
  marginInline: "auto",
  maxWidth: theme.layout.contentWidth,
  minHeight: "100dvh",
  padding: `${theme.space[10]} ${theme.layout.pagePadding}`,
})

globalStyle(`${errorPage} h1`, {
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
  marginBottom: theme.space[2],
})

globalStyle(`${errorPage} > p`, {
  color: theme.color.text.secondary,
  fontSize: theme.font.role.body,
  lineHeight: theme.font.lineHeight.relaxed,
})

export const stackTrace = style({
  background: theme.color.background.sunken,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  fontSize: theme.font.role.metadata,
  marginTop: theme.space[5],
  maxHeight: "24rem",
  overflow: "auto",
  padding: theme.space[4],
  width: "100%",
})
