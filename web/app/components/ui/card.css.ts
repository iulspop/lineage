import { style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const card = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  color: theme.color.text.primary,
  display: "flex",
  flexDirection: "column",
  fontSize: theme.font.size.sm,
  minWidth: 0,
})

export const cardSize = styleVariants({
  default: { gap: theme.space[5], paddingBlock: theme.space[5] },
  sm: { gap: theme.space[3], paddingBlock: theme.space[3] },
})

export const header = style({
  display: "grid",
  gap: theme.space[1],
  gridTemplateColumns: "minmax(0, 1fr) auto",
  paddingInline: theme.space[6],
})

export const title = style({
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tight,
  lineHeight: theme.font.lineHeight.compact,
})

export const description = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.normal,
})

export const action = style({
  alignSelf: "start",
  gridColumnStart: 2,
  gridRow: "1 / span 2",
  justifySelf: "end",
})

export const content = style({ paddingInline: theme.space[6] })

export const footer = style({
  alignItems: "center",
  borderTop: `1px solid ${theme.color.border.subtle}`,
  display: "flex",
  gap: theme.space[3],
  paddingBlockStart: theme.space[4],
  paddingInline: theme.space[6],
})
