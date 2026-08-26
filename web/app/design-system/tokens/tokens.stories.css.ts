import { style } from "@vanilla-extract/css"

import { theme } from "../theme.css"

export const page = style({
  background: `linear-gradient(135deg, ${theme.color.background.canvas}, ${theme.color.background.subtle})`,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.sm,
  display: "grid",
  gap: theme.space[8],
  maxWidth: "68rem",
  padding: theme.space[8],
})

export const hero = style({
  display: "grid",
  gap: theme.space[3],
  maxWidth: "46rem",
})

export const eyebrow = style({
  color: theme.color.text.link,
  fontFamily: theme.font.family.mono,
  fontSize: theme.font.size.xs,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})

export const heroTitle = style({
  color: theme.color.text.primary,
  fontSize: theme.font.size["4xl"],
  fontWeight: theme.font.weight.bold,
  letterSpacing: "-0.04em",
  lineHeight: theme.font.lineHeight.tight,
  margin: 0,
})

export const heroDescription = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.size.lg,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
})

export const section = style({
  display: "grid",
  gap: theme.space[4],
})

export const sectionHeader = style({
  display: "grid",
  gap: theme.space[2],
  maxWidth: "42rem",
})

export const title = style({
  color: theme.color.text.primary,
  fontSize: theme.font.size.xl,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: "-0.02em",
  lineHeight: theme.font.lineHeight.tight,
  margin: 0,
})

export const description = style({
  color: theme.color.text.secondary,
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.relaxed,
  margin: 0,
})

export const grid = style({
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
})

export const swatch = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.xs,
  overflow: "hidden",
})

export const swatchColor = style({
  height: "5.5rem",
})

export const swatchBody = style({
  background: theme.color.background.card,
  display: "grid",
  gap: theme.space[1],
  padding: theme.space[3],
})

export const name = style({
  color: theme.color.text.primary,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
})

export const value = style({
  color: theme.color.text.muted,
  fontFamily: theme.font.family.mono,
  fontSize: theme.font.size.xs,
})

export const tokenCard = style({
  background: `linear-gradient(180deg, ${theme.color.background.card}, ${theme.color.background.subtle})`,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.xs,
  display: "grid",
  gap: theme.space[3],
  minHeight: "9rem",
  padding: theme.space[4],
})

export const tokenPreview = style({
  alignItems: "center",
  color: theme.color.text.primary,
  display: "flex",
  minHeight: theme.space[10],
})

export const typographyStack = style({
  display: "grid",
  gap: theme.space[4],
})

export const typeSpecimen = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.xs,
  display: "grid",
  gap: theme.space[2],
  padding: theme.space[5],
})

export const typeSpecimenText = style({
  color: theme.color.text.primary,
  margin: 0,
})

export const typeMeta = style({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
})

export const pill = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  fontFamily: theme.font.family.mono,
  fontSize: theme.font.size.xs,
  padding: `${theme.space[1]} ${theme.space[2]}`,
})
