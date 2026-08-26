import { globalStyle, style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const button = style({
  alignItems: "center",
  border: "1px solid transparent",
  borderRadius: theme.radius.md,
  display: "inline-flex",
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  justifyContent: "center",
  lineHeight: theme.font.lineHeight.compact,
  outline: "none",
  selectors: {
    "&:active:not(:disabled)": { transform: "translateY(1px)" },
    "&:disabled": { cursor: "not-allowed", opacity: 0.48 },
    "&:focus-visible": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
    "&[aria-busy='true']": { cursor: "progress" },
  },
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, border-color ${theme.duration.fast} ${theme.easing.standard}, color ${theme.duration.fast} ${theme.easing.standard}, box-shadow ${theme.duration.fast} ${theme.easing.standard}, transform ${theme.duration.fast} ${theme.easing.standard}`,
  userSelect: "none",
  whiteSpace: "nowrap",
})

globalStyle(`${button} > svg`, {
  flexShrink: 0,
  height: "1rem",
  width: "1rem",
})

export const variant = styleVariants({
  default: {
    background: theme.color.intent.primary.background,
    boxShadow: theme.shadow.xs,
    color: theme.color.intent.primary.foreground,
    selectors: {
      "&:hover:not(:disabled)": {
        background: theme.color.intent.primary.hover,
      },
    },
  },
  destructive: {
    background: theme.color.intent.danger.subtle,
    color: theme.color.text.danger,
    selectors: {
      "&:hover:not(:disabled)": {
        background: theme.color.intent.danger.background,
        color: theme.color.intent.danger.foreground,
      },
    },
  },
  ghost: {
    background: "transparent",
    color: theme.color.text.secondary,
    selectors: {
      "&:hover:not(:disabled)": {
        background: theme.color.background.subtle,
        color: theme.color.text.primary,
      },
    },
  },
  link: {
    background: "transparent",
    color: theme.color.text.link,
    height: "auto",
    padding: 0,
    selectors: { "&:hover:not(:disabled)": { textDecoration: "underline" } },
  },
  outline: {
    background: theme.color.background.card,
    borderColor: theme.color.border.interactive,
    boxShadow: theme.shadow.xs,
    color: theme.color.text.primary,
    selectors: {
      "&:hover:not(:disabled)": {
        background: theme.color.background.subtle,
        borderColor: theme.color.border.strong,
      },
    },
  },
  secondary: {
    background: theme.color.background.subtle,
    borderColor: theme.color.border.subtle,
    color: theme.color.text.primary,
    selectors: {
      "&:hover:not(:disabled)": { background: theme.color.border.default },
    },
  },
})

export const size = styleVariants({
  default: {
    minHeight: theme.layout.controlHeight,
    padding: `0 ${theme.space[4]}`,
  },
  icon: {
    height: theme.layout.controlHeight,
    padding: 0,
    width: theme.layout.controlHeight,
  },
  "icon-lg": { height: "3rem", padding: 0, width: "3rem" },
  "icon-sm": {
    height: theme.layout.controlHeightCompact,
    padding: 0,
    width: theme.layout.controlHeightCompact,
  },
  "icon-xs": { height: "2rem", padding: 0, width: "2rem" },
  lg: {
    fontSize: theme.font.size.base,
    minHeight: "3rem",
    padding: `0 ${theme.space[5]}`,
  },
  sm: {
    minHeight: theme.layout.controlHeightCompact,
    padding: `0 ${theme.space[3]}`,
  },
  xs: {
    fontSize: theme.font.size.xs,
    minHeight: "2rem",
    padding: `0 ${theme.space[2]}`,
  },
})
