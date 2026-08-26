import { style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const badge = style({
  alignItems: "center",
  border: "1px solid transparent",
  borderRadius: theme.radius.full,
  display: "inline-flex",
  flexShrink: 0,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[1],
  height: "1.5rem",
  justifyContent: "center",
  letterSpacing: "0.01em",
  padding: `0 ${theme.space[2]}`,
  selectors: {
    "&:focus-visible": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
  },
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, color ${theme.duration.fast} ${theme.easing.standard}`,
  whiteSpace: "nowrap",
  width: "fit-content",
})

export const variant = styleVariants({
  default: {
    background: theme.color.intent.primary.background,
    color: theme.color.intent.primary.foreground,
  },
  destructive: {
    background: theme.color.intent.danger.subtle,
    color: theme.color.text.danger,
  },
  ghost: { color: theme.color.text.secondary },
  link: {
    color: theme.color.text.link,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  outline: {
    borderColor: theme.color.border.interactive,
    color: theme.color.text.primary,
  },
  secondary: {
    background: theme.color.background.subtle,
    color: theme.color.text.secondary,
  },
  success: {
    background: theme.color.intent.success.subtle,
    color: theme.color.text.success,
  },
  warning: {
    background: theme.color.intent.warning.subtle,
    color: theme.color.text.warning,
  },
})
