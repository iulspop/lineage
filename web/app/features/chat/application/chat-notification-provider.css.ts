import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const toast = style({
  "@media": {
    "(max-width: 40rem)": {
      bottom: theme.space[4],
      left: theme.space[4],
      right: theme.space[4],
      width: "auto",
    },
  },
  alignItems: "center",
  background: theme.color.background.elevated,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  bottom: theme.space[5],
  boxShadow: theme.shadow.elevated,
  display: "grid",
  gap: theme.space[1],
  gridTemplateColumns: "minmax(0, 1fr) auto",
  maxWidth: "22rem",
  padding: theme.space[3],
  position: "fixed",
  right: theme.space[5],
  width: `calc(100vw - ${theme.space[8]})`,
  zIndex: theme.zIndex.progress,
})

export const title = style({
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.semibold,
})
export const detail = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
})
export const dismiss = style({
  background: "transparent",
  border: 0,
  borderRadius: theme.radius.sm,
  color: theme.color.text.muted,
  cursor: "pointer",
  fontSize: theme.font.role.metadata,
  gridColumn: "2",
  gridRow: "1 / span 2",
  minHeight: "2rem",
  paddingInline: theme.space[2],
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: "none" },
    "&:hover": {
      background: theme.color.background.subtle,
      color: theme.color.text.primary,
    },
  },
})

export const visuallyHidden = style({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
})
