import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  display: "grid",
  gap: theme.space[8],
  margin: "0 auto",
  maxWidth: "72rem",
})

export const onboarding = style({
  "@media": {
    "screen and (max-width: 64rem)": {
      gridTemplateColumns: "1fr",
    },
  },
  alignItems: "center",
  background: `linear-gradient(135deg, ${theme.color.background.card} 0%, ${theme.color.accent.subtle} 100%)`,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  display: "grid",
  gap: theme.space[6],
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  padding: theme.space[8],
})

export const onboardingIcon = style({
  alignItems: "center",
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.lg,
  color: theme.color.intent.primary.foreground,
  display: "flex",
  height: "3.5rem",
  justifyContent: "center",
  width: "3.5rem",
})

export const onboardingCopy = style({
  display: "grid",
  gap: theme.space[2],
})
globalStyle(`${onboardingCopy} h2`, {
  fontSize: theme.font.size["2xl"],
  margin: 0,
})
globalStyle(`${onboardingCopy} p`, {
  color: theme.color.text.secondary,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
  maxWidth: "42rem",
})

export const actions = style({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[3],
})

const actionBase = {
  alignItems: "center",
  borderRadius: theme.radius.md,
  display: "inline-flex",
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  justifyContent: "center",
  minHeight: "2.75rem",
  padding: `${theme.space[3]} ${theme.space[5]}`,
  textDecoration: "none",
} as const

export const primaryAction = style({
  ...actionBase,
  background: theme.color.intent.primary.background,
  color: theme.color.intent.primary.foreground,
  selectors: { "&:hover": { background: theme.color.intent.primary.hover } },
})

export const secondaryAction = style({
  ...actionBase,
  border: `1px solid ${theme.color.border.strong}`,
  color: theme.color.text.primary,
  selectors: { "&:hover": { background: theme.color.background.subtle } },
})

export const reviewHero = style({
  "@media": {
    "screen and (max-width: 40rem)": {
      alignItems: "stretch",
      flexDirection: "column",
      gap: theme.space[6],
    },
  },
  alignItems: "center",
  background: theme.color.text.primary,
  borderRadius: theme.radius.lg,
  color: theme.color.background.canvas,
  display: "flex",
  justifyContent: "space-between",
  padding: theme.space[8],
})

export const heroLabel = style({ fontSize: theme.font.size.sm, opacity: 0.72 })
export const dueCount = style({
  display: "block",
  fontSize: "clamp(3rem, 8vw, 5.5rem)",
  letterSpacing: "-0.07em",
  lineHeight: 0.95,
  marginTop: theme.space[2],
})
export const heroSupporting = style({
  margin: `${theme.space[2]} 0 0`,
  opacity: 0.72,
})
export const nextReview = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[2],
  opacity: 0.82,
})

export const stats = style({
  "@media": {
    "screen and (max-width: 40rem)": {
      gridTemplateColumns: "1fr",
    },
  },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
})

export const section = style({ display: "grid", gap: theme.space[4] })
export const sectionHeading = style({
  alignItems: "end",
  display: "flex",
  justifyContent: "space-between",
})
globalStyle(`${sectionHeading} h2`, {
  fontSize: theme.font.size["2xl"],
  margin: `${theme.space[1]} 0 0`,
})
export const eyebrow = style({
  color: theme.color.text.link,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.bold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})
export const textLink = style({
  alignItems: "center",
  color: theme.color.text.link,
  display: "inline-flex",
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[1],
  textDecoration: "none",
})

export const corpusGrid = style({
  "@media": {
    "screen and (max-width: 64rem)": { gridTemplateColumns: "1fr" },
  },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
})
export const corpusCard = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  color: theme.color.text.primary,
  display: "grid",
  gap: theme.space[2],
  padding: theme.space[5],
  selectors: {
    "&:hover": {
      borderColor: theme.color.border.strong,
      boxShadow: theme.shadow.sm,
      transform: "translateY(-1px)",
    },
  },
  textDecoration: "none",
  transition: `border-color ${theme.duration.fast} ${theme.easing.standard}, box-shadow ${theme.duration.fast} ${theme.easing.standard}, transform ${theme.duration.fast} ${theme.easing.standard}`,
})
export const corpusTitle = style({
  fontSize: theme.font.size.lg,
  fontWeight: theme.font.weight.semibold,
  textTransform: "capitalize",
})
export const corpusMeta = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
})

export const quickActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[3],
})
globalStyle(`${quickActions} a`, {
  ...actionBase,
  background: theme.color.background.subtle,
  color: theme.color.text.primary,
})
