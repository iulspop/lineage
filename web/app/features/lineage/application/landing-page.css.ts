import { style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  background: theme.color.background.canvas,
  color: theme.color.text.primary,
  minHeight: "100dvh",
})

export const shell = style({
  marginInline: "auto",
  maxWidth: theme.layout.contentWide,
  padding: `${theme.space[5]} ${theme.layout.pagePadding} ${theme.space[8]}`,
})

export const nav = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
})

export const brand = style({
  alignItems: "center",
  color: theme.color.text.primary,
  display: "inline-flex",
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  textDecoration: "none",
})

export const brandMark = style({
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.sm,
  color: theme.color.intent.primary.foreground,
  height: "1.75rem",
  padding: theme.space[1],
  width: "1.75rem",
})

export const navActions = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[2],
})

const linkButtonBase = style({
  alignItems: "center",
  border: "1px solid transparent",
  borderRadius: theme.radius.md,
  display: "inline-flex",
  fontSize: theme.font.role.control,
  fontWeight: theme.font.weight.medium,
  gap: theme.space[2],
  justifyContent: "center",
  minHeight: theme.layout.controlHeightCompact,
  paddingInline: theme.space[3],
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: "none" },
  },
  textDecoration: "none",
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, border-color ${theme.duration.fast} ${theme.easing.standard}, color ${theme.duration.fast} ${theme.easing.standard}`,
  whiteSpace: "nowrap",
})

export const linkButton = styleVariants({
  default: [
    linkButtonBase,
    {
      background: theme.color.intent.primary.background,
      color: theme.color.intent.primary.foreground,
      selectors: {
        "&:hover": { background: theme.color.intent.primary.hover },
      },
    },
  ],
  ghost: [
    linkButtonBase,
    {
      color: theme.color.text.secondary,
      selectors: {
        "&:hover": {
          background: theme.color.background.subtle,
          color: theme.color.text.primary,
        },
      },
    },
  ],
})

export const largeLinkButton = style({
  minHeight: theme.layout.controlHeight,
  paddingInline: theme.space[4],
})

export const hero = style({
  "@media": {
    "(max-width: 56rem)": {
      gridTemplateColumns: "minmax(0, 1fr)",
      minHeight: "auto",
      paddingBlock: theme.space[10],
    },
  },
  alignItems: "center",
  display: "grid",
  gap: theme.space[12],
  gridTemplateColumns: "minmax(0, 0.9fr) minmax(28rem, 1.1fr)",
  minHeight: "min(42rem, calc(100dvh - 5rem))",
  paddingBlock: theme.space[12],
})

export const heroCopy = style({ maxWidth: "36rem" })
export const eyebrow = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
  marginBottom: theme.space[4],
})
export const title = style({
  fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
  fontWeight: theme.font.weight.semibold,
  letterSpacing: "-0.04em",
  lineHeight: "1.02",
  marginBottom: theme.space[5],
})
export const lead = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.size.lg,
  lineHeight: theme.font.lineHeight.relaxed,
  marginBottom: theme.space[6],
})
export const ctaRow = style({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
  marginBottom: theme.space[3],
})
export const reassurance = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  lineHeight: theme.font.lineHeight.normal,
})

export const preview = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.sm,
  padding: theme.space[6],
})
export const previewHeader = style({
  alignItems: "start",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  marginBottom: theme.space[6],
})
export const previewEyebrow = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  marginBottom: theme.space[1],
})
export const previewTitle = style({
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
})
export const previewCount = style({
  background: theme.color.background.subtle,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  fontSize: theme.font.role.metadata,
  padding: `${theme.space[1]} ${theme.space[3]}`,
  whiteSpace: "nowrap",
})
export const reviewFlow = style({ display: "grid", gap: theme.space[3] })
export const reviewStep = style({
  alignItems: "start",
  background: theme.color.background.sunken,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "auto minmax(0, 1fr)",
  padding: theme.space[4],
})
export const stepNumber = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.full,
  color: theme.color.intent.primary.foreground,
  display: "inline-flex",
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.semibold,
  height: "1.5rem",
  justifyContent: "center",
  width: "1.5rem",
})
export const stepLabel = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  marginBottom: theme.space[1],
})
export const stepContent = style({
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
})
export const previewFootnote = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  lineHeight: theme.font.lineHeight.normal,
  marginTop: theme.space[4],
})

export const sections = style({
  "@media": { "(max-width: 44rem)": { gridTemplateColumns: "1fr" } },
  borderTop: `1px solid ${theme.color.border.subtle}`,
  display: "grid",
  gap: theme.space[6],
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  paddingBlock: theme.space[10],
})
export const section = style({ paddingRight: theme.space[4] })
export const sectionIcon = style({
  color: theme.color.text.muted,
  height: "1.25rem",
  marginBottom: theme.space[3],
  width: "1.25rem",
})
export const sectionTitle = style({
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
  marginBottom: theme.space[2],
})
export const sectionCopy = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.role.supporting,
  lineHeight: theme.font.lineHeight.relaxed,
})
export const footer = style({
  alignItems: "center",
  borderTop: `1px solid ${theme.color.border.subtle}`,
  color: theme.color.text.muted,
  display: "flex",
  fontSize: theme.font.role.metadata,
  gap: theme.space[4],
  justifyContent: "space-between",
  paddingTop: theme.space[6],
})
export const footerLink = style({
  color: theme.color.text.primary,
  fontWeight: theme.font.weight.medium,
})
