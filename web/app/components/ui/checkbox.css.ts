import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const root = style({
  alignItems: "center",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.sm,
  boxShadow: theme.shadow.xs,
  color: theme.color.intent.primary.foreground,
  display: "flex",
  flexShrink: 0,
  height: "1rem",
  justifyContent: "center",
  outline: "none",
  position: "relative",
  selectors: {
    "&::after": {
      content: "",
      inset: "-0.5rem -0.75rem",
      position: "absolute",
    },
    "&:disabled": {
      opacity: 0.5,
    },
    "&:focus-visible": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
    "&[data-checked]": {
      background: theme.color.intent.primary.background,
      borderColor: theme.color.intent.primary.background,
    },
  },
  transition: `background ${theme.duration.normal} ${theme.easing.standard}, border-color ${theme.duration.normal} ${theme.easing.standard}, box-shadow ${theme.duration.normal} ${theme.easing.standard}`,
  width: "1rem",
})

export const indicator = style({
  display: "grid",
  placeContent: "center",
  selectors: {},
})
