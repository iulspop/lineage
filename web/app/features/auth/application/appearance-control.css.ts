import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const fieldset = style({ border: 0, margin: 0, padding: 0 })
export const legend = style({
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
})
export const description = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  marginTop: theme.space[1],
})
export const options = style({
  "@media": { "screen and (max-width: 28rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[2],
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  marginTop: theme.space[4],
})
export const option = style({
  alignItems: "center",
  background: theme.color.background.elevated,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.sm,
  color: theme.color.text.secondary,
  cursor: "pointer",
  display: "flex",
  font: "inherit",
  fontSize: theme.font.size.sm,
  gap: theme.space[3],
  minHeight: "3rem",
  padding: theme.space[2],
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: "none" },
    "&:hover": {
      background: theme.color.background.subtle,
      borderColor: theme.color.border.interactive,
    },
  },
})
export const optionActive = style({
  background: theme.color.accent.subtle,
  borderColor: theme.color.accent.solid,
  color: theme.color.text.primary,
})
export const preview = style({
  background: "linear-gradient(135deg, #ffffff 0 50%, #e7eaf0 50%)",
  border: "1px solid rgba(100, 116, 139, 0.35)",
  borderRadius: theme.radius.xs,
  height: "1.75rem",
  selectors: {
    '&[data-theme="dark"]': {
      background: "linear-gradient(135deg, #111318 0 50%, #252933 50%)",
    },
    '&[data-theme="system"]': {
      background: "linear-gradient(135deg, #ffffff 0 49%, #111318 51%)",
    },
  },
  width: "2.25rem",
})
