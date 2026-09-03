import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: "68rem",
  padding: `${theme.space[8]} ${theme.layout.pagePadding} ${theme.space[12]}`,
})

export const header = style({
  "@media": {
    "(max-width: 38rem)": { alignItems: "flex-start", flexDirection: "column" },
  },
  alignItems: "center",
  display: "flex",
  gap: theme.space[5],
  justifyContent: "space-between",
  marginBottom: theme.space[8],
})

export const eyebrow = style({
  color: theme.color.intent.primary.background,
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tracked,
  marginBottom: theme.space[2],
  textTransform: "uppercase",
})

export const title = style({
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tight,
  lineHeight: theme.font.lineHeight.tight,
})

export const subtitle = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  lineHeight: theme.font.lineHeight.normal,
  marginTop: theme.space[2],
  maxWidth: "38rem",
})

export const backLink = style({
  alignItems: "center",
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  display: "inline-flex",
  flex: "0 0 auto",
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
  gap: theme.space[2],
  padding: `${theme.space[2]} ${theme.space[3]}`,
  selectors: {
    "&:focus-visible": { boxShadow: theme.shadow.focus, outline: "none" },
    "&:hover": {
      background: theme.color.background.subtle,
      color: theme.color.text.primary,
    },
  },
  textDecoration: "none",
})

export const overview = style({
  "@media": { "(max-width: 42rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[3],
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  marginBottom: theme.space[8],
})

export const overviewCard = style({
  alignItems: "center",
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.lg,
  display: "flex",
  gap: theme.space[3],
  padding: theme.space[4],
})

export const overviewIcon = style({
  alignItems: "center",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  color: theme.color.intent.primary.background,
  display: "flex",
  flex: "0 0 auto",
  height: "2.5rem",
  justifyContent: "center",
  width: "2.5rem",
})

export const overviewLabel = style({
  color: theme.color.text.muted,
  display: "block",
  fontSize: theme.font.role.metadata,
})

export const overviewValue = style({
  color: theme.color.text.primary,
  display: "block",
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
  marginTop: theme.space[1],
})

export const stack = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[5],
})

export const connectionGuide = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.interactive}`,
  borderRadius: theme.radius.lg,
  overflow: "hidden",
})

export const guideHeader = style({
  alignItems: "flex-start",
  display: "flex",
  gap: theme.space[3],
  padding: `${theme.space[5]} ${theme.space[5]} ${theme.space[4]}`,
})

globalStyle(`${guideHeader} h2`, {
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
})

globalStyle(`${guideHeader} p`, {
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  lineHeight: theme.font.lineHeight.normal,
  marginTop: theme.space[1],
})

export const guideBody = style({
  "@media": {
    "(max-width: 42rem)": { gridTemplateColumns: "1fr" },
  },
  borderTop: `1px solid ${theme.color.border.subtle}`,
  display: "grid",
  gap: theme.space[5],
  gridTemplateColumns: "minmax(0, 1fr) minmax(16rem, 0.8fr)",
  padding: theme.space[5],
})

export const guideSteps = style({
  color: theme.color.text.secondary,
  display: "flex",
  flexDirection: "column",
  fontSize: theme.font.role.supporting,
  gap: theme.space[3],
  lineHeight: theme.font.lineHeight.normal,
  margin: 0,
  paddingLeft: theme.space[5],
})

export const endpointBlock = style({
  alignSelf: "start",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  minWidth: 0,
  padding: theme.space[4],
})

export const endpointLabel = style({
  color: theme.color.text.muted,
  display: "block",
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.medium,
  marginBottom: theme.space[2],
})

export const endpointValue = style({
  color: theme.color.text.primary,
  display: "block",
  fontFamily: theme.font.family.mono,
  fontSize: theme.font.role.metadata,
  overflowWrap: "anywhere",
  userSelect: "all",
})

export const panel = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.lg,
  overflow: "hidden",
})

export const panelHeader = style({
  alignItems: "flex-start",
  borderBottom: `1px solid ${theme.color.border.subtle}`,
  display: "flex",
  gap: theme.space[3],
  padding: theme.space[5],
})

export const panelHeaderIcon = style({
  color: theme.color.icon.muted,
  flex: "0 0 auto",
  marginTop: theme.space[1],
})

globalStyle(`${panelHeader} h2`, {
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
})

globalStyle(`${panelHeader} p`, {
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  lineHeight: theme.font.lineHeight.normal,
  marginTop: theme.space[1],
})

export const emptyState = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  padding: `${theme.space[10]} ${theme.space[5]}`,
  textAlign: "center",
})

export const emptyIcon = style({
  alignItems: "center",
  background: theme.color.background.subtle,
  borderRadius: theme.radius.full,
  color: theme.color.icon.muted,
  display: "flex",
  height: "3rem",
  justifyContent: "center",
  marginBottom: theme.space[3],
  width: "3rem",
})

export const emptyTitle = style({
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
})

export const emptyDescription = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  marginTop: theme.space[1],
  maxWidth: "26rem",
})

export const connectionList = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
})

export const connectionItem = style({
  "@media": {
    "(max-width: 38rem)": { alignItems: "stretch", flexDirection: "column" },
  },
  alignItems: "center",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  padding: theme.space[5],
  selectors: {
    "& + &": { borderTop: `1px solid ${theme.color.border.subtle}` },
  },
})

export const connectionIdentity = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[3],
  minWidth: 0,
})

export const appIcon = style({
  alignItems: "center",
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  color: theme.color.intent.primary.background,
  display: "flex",
  flex: "0 0 auto",
  height: "2.75rem",
  justifyContent: "center",
  width: "2.75rem",
})

export const connectionCopy = style({ minWidth: 0 })
export const connectionTitle = style({
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
})
export const connectionMeta = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  lineHeight: theme.font.lineHeight.normal,
  marginTop: theme.space[1],
})

export const chips = style({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space[2],
  marginTop: theme.space[2],
})

export const chip = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.medium,
  padding: `${theme.space[1]} ${theme.space[2]}`,
})

export const registrationForm = style({ padding: theme.space[5] })
export const formGrid = style({
  "@media": { "(max-width: 42rem)": { gridTemplateColumns: "1fr" } },
  display: "grid",
  gap: theme.space[4],
  gridTemplateColumns: "minmax(0, 2fr) minmax(12rem, 1fr)",
})
export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[2],
})
export const fieldWide = style({ gridColumn: "1 / -1" })
export const label = style({
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
})
export const help = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  lineHeight: theme.font.lineHeight.normal,
})
export const selectTrigger = style({
  alignItems: "center",
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.interactive}`,
  borderRadius: theme.radius.md,
  boxShadow: theme.shadow.xs,
  color: theme.color.text.primary,
  cursor: "pointer",
  display: "flex",
  fontFamily: "inherit",
  fontSize: theme.font.size.sm,
  justifyContent: "space-between",
  minHeight: theme.layout.controlHeight,
  outline: "none",
  padding: `${theme.space[2]} ${theme.space[3]}`,
  selectors: {
    "&:focus-visible": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
    "&:hover": { borderColor: theme.color.border.strong },
    "&[data-popup-open]": {
      borderColor: theme.color.focus,
      boxShadow: theme.shadow.focus,
    },
  },
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, border-color ${theme.duration.fast} ${theme.easing.standard}, box-shadow ${theme.duration.fast} ${theme.easing.standard}`,
  width: "100%",
})

export const selectIcon = style({
  alignItems: "center",
  color: theme.color.text.muted,
  display: "flex",
  selectors: {
    "[data-popup-open] &": { transform: "rotate(180deg)" },
  },
  transition: `transform ${theme.duration.fast} ${theme.easing.standard}`,
})

export const selectPositioner = style({
  outline: "none",
  zIndex: 50,
})

export const selectPopup = style({
  background: theme.color.background.card,
  border: `1px solid ${theme.color.border.interactive}`,
  borderRadius: theme.radius.md,
  boxShadow: theme.shadow.elevated,
  minWidth: "var(--anchor-width)",
  outline: "none",
  padding: theme.space[1],
  transformOrigin: "var(--transform-origin)",
})

export const selectItem = style({
  alignItems: "center",
  borderRadius: theme.radius.sm,
  color: theme.color.text.primary,
  cursor: "pointer",
  display: "flex",
  fontSize: theme.font.size.sm,
  gap: theme.space[3],
  justifyContent: "space-between",
  minHeight: theme.layout.controlHeight,
  outline: "none",
  padding: `${theme.space[2]} ${theme.space[3]}`,
  selectors: {
    "&[data-highlighted]": { background: theme.color.background.sunken },
    "&[data-selected]": {
      color: theme.color.text.link,
      fontWeight: theme.font.weight.semibold,
    },
  },
})

export const selectIndicator = style({
  alignItems: "center",
  color: theme.color.text.link,
  display: "flex",
})

export const formFooter = style({
  alignItems: "center",
  borderTop: `1px solid ${theme.color.border.subtle}`,
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.space[5],
  paddingTop: theme.space[4],
})

export const result = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.md,
  margin: `0 ${theme.space[5]} ${theme.space[5]}`,
  padding: theme.space[4],
})
export const resultTitle = style({ fontWeight: theme.font.weight.semibold })
export const resultValue = style({
  color: theme.color.text.muted,
  fontFamily: theme.font.family.mono,
  fontSize: theme.font.role.metadata,
  marginTop: theme.space[2],
  overflowWrap: "anywhere",
})

export const clientList = style({
  borderTop: `1px solid ${theme.color.border.subtle}`,
  listStyle: "none",
  margin: 0,
  padding: 0,
})
export const clientItem = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  padding: `${theme.space[4]} ${theme.space[5]}`,
  selectors: {
    "& + &": { borderTop: `1px solid ${theme.color.border.subtle}` },
  },
})
export const clientUri = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  marginTop: theme.space[1],
  overflowWrap: "anywhere",
})
export const statusBadge = style({
  background: theme.color.background.subtle,
  border: `1px solid ${theme.color.border.subtle}`,
  borderRadius: theme.radius.full,
  color: theme.color.text.secondary,
  flex: "0 0 auto",
  fontSize: theme.font.role.metadata,
  fontWeight: theme.font.weight.medium,
  padding: `${theme.space[1]} ${theme.space[2]}`,
})
export const status = style({ fontSize: theme.font.role.supporting })
