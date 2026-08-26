import { keyframes, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
})

const spin = keyframes({
  to: { transform: "rotate(360deg)" },
})

export const root = style({
  animation: `${pulse} 1.6s ${theme.easing.standard} infinite`,
  height: "0.125rem",
  insetInline: 0,
  position: "fixed",
  top: 0,
  zIndex: theme.zIndex.progress,
})

export const bar = style({
  background: theme.color.intent.primary.background,
  height: "100%",
  transitionDuration: theme.duration.slow,
  transitionProperty: "opacity, width",
  transitionTimingFunction: theme.easing.standard,
  width: 0,
})

export const barComplete = style({
  opacity: 0,
  width: "100%",
})

export const barSubmitting = style({
  width: "41.666667%",
})

export const barLoading = style({
  width: "66.666667%",
})

export const barIdle = style({
  transitionProperty: "none",
})

export const spinnerContainer = style({
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  position: "absolute",
})

export const spinner = style({
  animation: `${spin} 1s linear infinite`,
  color: theme.color.text.primary,
  margin: theme.space[1],
})
