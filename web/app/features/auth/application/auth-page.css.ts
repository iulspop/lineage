import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: "100dvh",
  padding: theme.layout.pagePadding,
})

export const panel = style({
  "@media": {
    "(max-width: 40rem)": {
      borderInline: 0,
      borderRadius: 0,
      boxShadow: "none",
      padding: `${theme.space[8]} ${theme.space[4]}`,
    },
  },
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.sm,
  maxWidth: theme.layout.authWidth,
  padding: theme.space[8],
  width: "100%",
})

export const brand = style({
  alignItems: "center",
  color: theme.color.text.primary,
  display: "inline-flex",
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  marginBottom: theme.space[8],
  textDecoration: "none",
})

export const logo = style({
  borderRadius: theme.radius.sm,
  height: "1.75rem",
  width: "1.75rem",
})

export const heading = style({
  color: theme.color.text.primary,
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tight,
  lineHeight: theme.font.lineHeight.tight,
  marginBottom: theme.space[2],
})

export const subcopy = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.role.supporting,
  lineHeight: theme.font.lineHeight.normal,
  marginBottom: theme.space[6],
})

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[3],
})

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[3],
})

export const field = style({
  display: "grid",
  gap: theme.space[2],
})

export const label = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
})

export const codeInput = style({
  fontFamily: theme.font.family.mono,
  fontSize: theme.font.size.lg,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: "0.22em",
  textAlign: "center",
  textTransform: "uppercase",
})

export const fullWidth = style({ width: "100%" })
export const icon = style({ height: "1rem", width: "1rem" })

export const divider = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  fontSize: theme.font.role.metadata,
  gap: theme.space[3],
  paddingBlock: theme.space[2],
})

export const dividerLine = style({
  background: theme.color.border.subtle,
  flex: 1,
  height: "1px",
})

export const textAction = style({
  background: "transparent",
  color: theme.color.text.secondary,
  marginInline: "auto",
  selectors: {
    "&:hover": { background: "transparent", color: theme.color.text.primary },
  },
  width: "fit-content",
})

export const footer = style({
  borderTop: `1px solid ${theme.color.border.subtle}`,
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  marginTop: theme.space[6],
  paddingTop: theme.space[5],
})

export const footerLink = style({
  color: theme.color.text.primary,
  fontWeight: theme.font.weight.medium,
})
