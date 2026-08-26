import { style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: "48rem",
})

export const header = style({
  alignItems: "end",
  borderBottom: `1px solid ${theme.color.border.default}`,
  display: "flex",
  justifyContent: "space-between",
  marginBottom: theme.space[6],
  paddingBottom: theme.space[4],
})

export const eyebrow = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
})

export const title = style({
  color: theme.color.text.primary,
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
})

export const progress = style({
  color: theme.color.text.muted,
  display: "grid",
  fontSize: theme.font.role.supporting,
  gap: theme.space[1],
  textAlign: "right",
})

export const memoryLink = style({
  color: theme.color.intent.primary.background,
  fontWeight: theme.font.weight.semibold,
  textDecoration: "none",
})

export const shortcutBar = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  fontSize: theme.font.size.sm,
  gap: theme.space[3],
  justifyContent: "space-between",
  marginBottom: theme.space[3],
})

export const shortcutButton = style({
  background: "transparent",
  border: 0,
  color: theme.color.intent.primary.background,
  cursor: "pointer",
  font: "inherit",
  fontWeight: theme.font.weight.semibold,
  padding: theme.space[1],
})

export const shortcutHelp = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[2],
  marginBottom: theme.space[4],
  padding: theme.space[4],
})

export const corpusPicker = style({
  "@media": {
    "screen and (max-width: 40rem)": {
      alignItems: "stretch",
      gridTemplateColumns: "1fr",
    },
  },
  alignItems: "end",
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "minmax(0, 1fr) minmax(10rem, 0.55fr) auto",
  marginBottom: theme.space[4],
})

export const pickerField = style({ display: "grid", gap: theme.space[2] })

export const corpusSelect = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.sm,
  color: theme.color.text.primary,
  minHeight: "2.5rem",
  paddingInline: theme.space[3],
})

export const card = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  display: "grid",
  gap: theme.space[6],
  padding: theme.space[6],
})

export const content = style({
  color: theme.color.text.primary,
  display: "grid",
  fontSize: theme.font.role.sectionTitle,
  gap: theme.space[3],
  lineHeight: theme.font.lineHeight.relaxed,
  minHeight: "8rem",
})

export const form = style({ display: "grid", gap: theme.space[3] })

export const actions = style({ display: "flex", justifyContent: "flex-end" })

export const resolution = style({ display: "grid", gap: theme.space[4] })

export const assessmentGroup = style({
  border: 0,
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
  padding: 0,
})

export const complete = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
})

export const sessionSummary = style({
  display: "grid",
  gap: theme.space[4],
  textAlign: "center",
})

export const continueLink = style({
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.sm,
  color: theme.color.intent.primary.foreground,
  fontWeight: theme.font.weight.semibold,
  padding: `${theme.space[3]} ${theme.space[4]}`,
  textDecoration: "none",
})

export const secondaryLink = style({
  color: theme.color.text.primary,
  fontWeight: theme.font.weight.semibold,
  padding: theme.space[3],
  textDecoration: "none",
})

export const history = style({
  display: "grid",
  gap: theme.space[3],
  marginTop: theme.space[8],
})

export const historyList = style({
  display: "grid",
  gap: theme.space[2],
  listStyle: "none",
  margin: 0,
  padding: 0,
})

export const historyItem = style({
  alignItems: "start",
  borderBottom: `1px solid ${theme.color.border.default}`,
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  paddingBlock: theme.space[3],
})

export const historyMeta = style({
  color: theme.color.text.muted,
  display: "grid",
  fontSize: theme.font.role.metadata,
  gap: theme.space[1],
  textAlign: "right",
})

export const emptyHistory = style({ color: theme.color.text.muted })
