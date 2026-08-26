import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const input = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.interactive}`,
  borderRadius: theme.radius.md,
  boxShadow: theme.shadow.xs,
  color: theme.color.text.primary,
  fontSize: theme.font.size.sm,
  minHeight: theme.layout.controlHeight,
  minWidth: 0,
  outline: "none",
  padding: `${theme.space[2]} ${theme.space[3]}`,
  selectors: {
    "&::placeholder": { color: theme.color.text.muted, opacity: 0.8 },
    "&:disabled": {
      background: theme.color.background.sunken,
      color: theme.color.text.muted,
      cursor: "not-allowed",
      opacity: 0.7,
    },
    "&:focus-visible": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
    "&:hover:not(:disabled):not(:focus-visible)": {
      borderColor: theme.color.border.strong,
    },
    "&[aria-invalid='true']": {
      borderColor: theme.color.intent.danger.background,
      boxShadow: "0 0 0 3px rgb(220 38 38 / 0.18)",
    },
  },
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, border-color ${theme.duration.fast} ${theme.easing.standard}, box-shadow ${theme.duration.fast} ${theme.easing.standard}`,
  width: "100%",
})

export const textarea = style([
  input,
  {
    lineHeight: theme.font.lineHeight.normal,
    minHeight: "5rem",
    paddingBlock: theme.space[3],
    resize: "vertical",
  },
])
