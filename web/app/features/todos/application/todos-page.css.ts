import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const page = style({
  marginInline: "auto",
  maxWidth: theme.layout.contentWide,
})

export const header = style({
  alignItems: "flex-end",
  borderBottom: `1px solid ${theme.color.border.default}`,
  display: "flex",
  gap: theme.space[4],
  justifyContent: "space-between",
  marginBottom: theme.space[4],
  paddingBottom: theme.space[4],
})

export const eyebrow = style({ display: "none" })

export const title = style({
  color: theme.color.text.primary,
  fontSize: theme.font.role.pageTitle,
  fontWeight: theme.font.weight.semibold,
  letterSpacing: theme.font.letterSpacing.tight,
  lineHeight: theme.font.lineHeight.tight,
})

export const subtitle = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  marginTop: theme.space[1],
})

export const headerStats = style({ display: "none" })

export const notice = style({
  "@media": {
    "screen and (max-width: 36rem)": {
      alignItems: "start",
      gridTemplateColumns: "1fr",
    },
  },
  alignItems: "center",
  background: theme.color.background.subtle,
  borderRadius: theme.radius.sm,
  color: theme.color.text.secondary,
  display: "grid",
  gap: `${theme.space[1]} ${theme.space[3]}`,
  gridTemplateColumns: "minmax(0, 1fr) auto",
  marginBottom: theme.space[2],
  padding: `${theme.space[2]} ${theme.space[3]}`,
})

export const noticeTitle = style({
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
})

export const noticeBody = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  gridColumn: "1",
})

export const noticeAction = style({
  "@media": {
    "screen and (max-width: 36rem)": { gridColumn: "1", gridRow: "auto" },
  },
  gridColumn: "2",
  gridRow: "1 / span 2",
})

export const noticeLink = style({
  "@media": {
    "screen and (max-width: 36rem)": { gridColumn: "1", gridRow: "auto" },
  },
  color: theme.color.text.link,
  fontSize: theme.font.role.supporting,
  fontWeight: theme.font.weight.medium,
  gridColumn: "2",
  gridRow: "1 / span 2",
})

export const workspace = style({
  display: "grid",
  gap: theme.space[5],
})

export const capturePanel = style({
  borderBottom: `1px solid ${theme.color.border.default}`,
  paddingBlock: theme.space[2],
})

export const panelIndex = style({ display: "none" })

export const form = style({ display: "grid", gap: theme.space[3] })
export const formHeader = style({ display: "none" })
export const formTitle = style({ display: "none" })
export const formDescription = style({ display: "none" })
export const shortcutHint = style({ display: "none" })

export const formFields = style({ display: "grid", gap: theme.space[3] })
export const titleField = style({ display: "grid", gap: theme.space[1] })
export const descriptionField = style({ display: "grid", gap: theme.space[1] })

export const descriptionInput = style({
  minHeight: "4.5rem",
  resize: "vertical",
})

export const optionalLabel = style({
  color: theme.color.text.muted,
  fontWeight: theme.font.weight.normal,
})

export const formFooter = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[2],
  justifyContent: "flex-end",
})

export const formHint = style({ display: "none" })

export const taskPanel = style({ minWidth: 0 })

export const taskPanelHeader = style({
  alignItems: "flex-end",
  display: "flex",
  gap: theme.space[5],
  justifyContent: "space-between",
})

export const taskPanelTitle = style({
  fontSize: theme.font.role.sectionTitle,
  fontWeight: theme.font.weight.semibold,
  paddingBottom: theme.space[2],
})

export const list = style({
  borderBottom: `1px solid ${theme.color.border.default}`,
  display: "flex",
  flexDirection: "column",
  listStyle: "none",
  margin: 0,
  padding: 0,
})

export const footer = style({
  display: "flex",
  justifyContent: "flex-end",
  minHeight: theme.layout.controlHeightCompact,
  paddingTop: theme.space[2],
})

export const dangerAction = style({ color: theme.color.text.danger })

globalStyle(`${formFooter} button`, {
  "@media": {
    "screen and (max-width: 30rem)": {
      minHeight: theme.layout.mobileControlHeight,
    },
  },
})
