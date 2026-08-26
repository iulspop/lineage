import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const item = style({
  "@media": {
    "screen and (max-width: 30rem)": {
      alignItems: "start",
      gridTemplateColumns: "auto minmax(0, 1fr)",
    },
  },
  alignItems: "center",
  background: theme.color.background.elevated,
  borderBottom: `1px solid ${theme.color.border.subtle}`,
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  padding: `${theme.space[3]} ${theme.space[4]}`,
  selectors: {
    "&:hover": {
      background: theme.color.background.subtle,
    },
    "&:last-child": { borderBottom: 0 },
  },
  transition: `background-color ${theme.duration.fast} ${theme.easing.standard}`,
})
export const content = style({ minWidth: 0 })
export const completedTitle = style({
  color: theme.color.text.muted,
  textDecoration: "line-through",
})
export const description = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.relaxed,
  marginTop: theme.space[1],
  overflowWrap: "anywhere",
})
export const status = style({
  color: theme.color.text.muted,
  display: "block",
  fontSize: theme.font.role.metadata,
  marginTop: theme.space[1],
})
export const toggle = style({ borderColor: theme.color.border.interactive })
export const toggleChecked = style({
  background: theme.color.intent.primary.background,
  borderColor: theme.color.intent.primary.background,
  color: theme.color.intent.primary.foreground,
})
export const actions = style({
  "@media": {
    "screen and (max-width: 30rem)": {
      gridColumn: "2",
      justifyContent: "flex-end",
    },
  },
  alignItems: "center",
  display: "flex",
  gap: theme.space[1],
  opacity: 0.62,
  selectors: { [`${item}:hover &`]: { opacity: 1 } },
})
export const checkIcon = style({ height: "0.875rem", width: "0.875rem" })
export const actionIcon = style({ height: "1rem", width: "1rem" })
