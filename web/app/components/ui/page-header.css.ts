import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const root = style({
  "@media": {
    "screen and (max-width: 40rem)": {
      flexDirection: "column",
      gap: theme.space[4],
    },
  },
  alignItems: "flex-start",
  display: "flex",
  gap: theme.space[6],
  justifyContent: "space-between",
  minWidth: 0,
})

export const content = style({
  display: "grid",
  gap: theme.space[2],
  minWidth: 0,
})

export const eyebrow = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.medium,
})

export const title = style({
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
  lineHeight: theme.font.lineHeight.tight,
})

export const description = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.relaxed,
  maxWidth: "62ch",
})

export const actions = style({
  alignItems: "center",
  display: "flex",
  flexShrink: 0,
  gap: theme.space[2],
})
