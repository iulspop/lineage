import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const nav = style({
  alignItems: "center",
  borderBottom: `1px solid ${theme.color.border.default}`,
  display: "flex",
  gap: theme.space[4],
  overflowX: "auto",
})

export const link = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "inline-flex",
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
  gap: theme.space[2],
  minHeight: theme.layout.controlHeightCompact,
  paddingInline: theme.space[1],
  position: "relative",
  selectors: {
    "&:hover": { color: theme.color.text.primary },
  },
  whiteSpace: "nowrap",
})

export const activeLink = style({
  color: theme.color.text.primary,
  selectors: {
    "&::after": {
      background: theme.color.intent.primary.background,
      bottom: "-1px",
      content: "",
      height: "2px",
      left: 0,
      position: "absolute",
      right: 0,
    },
  },
})

export const count = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.normal,
})
