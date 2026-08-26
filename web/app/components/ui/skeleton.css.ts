import { keyframes, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

const pulse = keyframes({
  "0%, 100%": { opacity: 0.55 },
  "50%": { opacity: 1 },
})

export const skeleton = style({
  "@media": { "(prefers-reduced-motion: reduce)": { animation: "none" } },
  animation: `${pulse} 1.6s ${theme.easing.standard} infinite`,
  background: theme.color.background.subtle,
  borderRadius: theme.radius.sm,
  minHeight: "1rem",
})
