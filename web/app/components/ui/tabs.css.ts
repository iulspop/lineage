import { style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const root = style({
  display: "flex",
  gap: theme.space[3],
  minWidth: 0,
  selectors: {
    '&[data-orientation="horizontal"]': { flexDirection: "column" },
  },
})

export const list = style({
  alignItems: "center",
  borderRadius: theme.radius.md,
  color: theme.color.text.muted,
  display: "flex",
  justifyContent: "flex-start",
  maxWidth: "100%",
  overflowX: "auto",
  padding: "3px",
  width: "fit-content",
})

export const listVariant = styleVariants({
  default: {
    background: theme.color.background.sunken,
    border: `1px solid ${theme.color.border.subtle}`,
  },
  line: {
    background: "transparent",
    borderBottom: `1px solid ${theme.color.border.default}`,
    borderRadius: 0,
    gap: theme.space[1],
    padding: 0,
    width: "100%",
  },
})

export const trigger = style({
  alignItems: "center",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: theme.radius.sm,
  color: theme.color.text.muted,
  display: "inline-flex",
  flex: "0 0 auto",
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  justifyContent: "center",
  minHeight: theme.layout.controlHeightCompact,
  outline: "none",
  padding: `0 ${theme.space[3]}`,
  position: "relative",
  selectors: {
    "&:disabled": { cursor: "not-allowed", opacity: 0.5 },
    "&:focus-visible": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
    "&:hover:not(:disabled)": { color: theme.color.text.primary },
    "&[data-active]": {
      background: "transparent",
      color: theme.color.text.primary,
    },
    "&[data-active]::after": {
      background: theme.color.intent.primary.background,
      bottom: "-1px",
      content: "",
      height: "2px",
      left: theme.space[2],
      position: "absolute",
      right: theme.space[2],
    },
  },
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, color ${theme.duration.fast} ${theme.easing.standard}`,
  whiteSpace: "nowrap",
})

export const content = style({
  flex: 1,
  fontSize: theme.font.size.sm,
  minWidth: 0,
  outline: "none",
})
