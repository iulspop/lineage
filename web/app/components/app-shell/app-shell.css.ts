import { globalStyle, style } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const shell = style({
  background: theme.color.background.canvas,
  minHeight: "100dvh",
})

export const skipLink = style({
  background: theme.color.intent.primary.background,
  borderRadius: theme.radius.sm,
  color: theme.color.intent.primary.foreground,
  left: theme.space[3],
  padding: `${theme.space[2]} ${theme.space[3]}`,
  position: "fixed",
  selectors: { "&:focus": { transform: "translateY(0)" } },
  top: theme.space[3],
  transform: "translateY(-200%)",
  zIndex: theme.zIndex.progress,
})

export const header = style({
  "@media": {
    "screen and (max-width: 64rem)": {
      alignItems: "center",
      borderBottom: `1px solid ${theme.color.border.default}`,
      borderRight: 0,
      bottom: "auto",
      display: "flex",
      flexDirection: "row",
      height: theme.layout.shellHeaderHeight,
      justifyContent: "space-between",
      padding: `0 ${theme.space[4]}`,
      right: 0,
      width: "auto",
    },
  },
  background: theme.color.background.sunken,
  borderRight: `1px solid ${theme.color.border.default}`,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  left: 0,
  padding: `${theme.space[5]} ${theme.space[3]} ${theme.space[4]}`,
  position: "fixed",
  top: 0,
  width: theme.layout.railWidth,
  zIndex: theme.zIndex.progress,
})

export const brand = style({
  alignItems: "center",
  color: theme.color.text.primary,
  display: "inline-flex",
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.semibold,
  gap: theme.space[2],
  minHeight: theme.layout.controlHeightCompact,
  paddingInline: theme.space[2],
  textDecoration: "none",
})

export const brandMark = style({
  color: theme.color.accent.solid,
  height: "1.25rem",
  strokeWidth: 1.9,
  width: "1.25rem",
})

export const brandName = style({
  letterSpacing: theme.font.letterSpacing.tight,
})

export const desktopNavigation = style({
  "@media": { "screen and (max-width: 64rem)": { display: "none" } },
  marginTop: theme.space[6],
})

export const navigation = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[1],
})

export const navLink = style({
  alignItems: "center",
  borderRadius: theme.radius.md,
  color: theme.color.text.secondary,
  display: "flex",
  fontSize: theme.font.role.body,
  fontWeight: theme.font.weight.medium,
  gap: theme.space[3],
  minHeight: theme.layout.controlHeight,
  paddingInline: theme.space[3],
  selectors: {
    "&:hover": {
      background: theme.color.background.subtle,
      color: theme.color.text.primary,
    },
  },
  textDecoration: "none",
  transition: `background ${theme.duration.fast} ${theme.easing.standard}, color ${theme.duration.fast} ${theme.easing.standard}`,
})

globalStyle(`${navLink} > svg`, {
  flexShrink: 0,
  height: "1.2rem",
  strokeWidth: 1.8,
  width: "1.2rem",
})

export const navLinkActive = style({
  background: theme.color.accent.subtle,
  color: theme.color.accent.foreground,
})

export const account = style({
  "@media": { "screen and (max-width: 64rem)": { display: "none" } },
  borderTop: `1px solid ${theme.color.border.default}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.space[1],
  marginTop: "auto",
  minWidth: 0,
  paddingTop: theme.space[3],
})

export const accountEmail = style({
  color: theme.color.text.muted,
  fontSize: theme.font.role.metadata,
  overflow: "hidden",
  padding: `${theme.space[1]} ${theme.space[2]} ${theme.space[2]}`,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

export const accountLink = style([navLink])

globalStyle(`${account} form`, { display: "flex" })
globalStyle(`${account} form button`, {
  fontWeight: theme.font.weight.medium,
  justifyContent: "flex-start",
  minHeight: theme.layout.controlHeight,
  paddingInline: theme.space[3],
  width: "100%",
})

export const mobileAccount = style({
  "@media": { "screen and (max-width: 64rem)": { display: "block" } },
  display: "none",
  position: "relative",
})

globalStyle(`${mobileAccount} summary`, {
  alignItems: "center",
  borderRadius: theme.radius.sm,
  color: theme.color.text.secondary,
  cursor: "pointer",
  display: "flex",
  height: theme.layout.mobileControlHeight,
  justifyContent: "center",
  userSelect: "none",
  width: theme.layout.mobileControlHeight,
})

globalStyle(`${mobileAccount} summary > svg`, {
  height: "1.25rem",
  strokeWidth: 1.8,
  width: "1.25rem",
})

globalStyle(`${mobileAccount} summary::-webkit-details-marker`, {
  display: "none",
})

globalStyle(`${mobileAccount} summary:hover`, {
  background: theme.color.background.subtle,
  color: theme.color.text.primary,
})

export const mobileAccountMenu = style({
  background: theme.color.background.elevated,
  border: `1px solid ${theme.color.border.default}`,
  borderRadius: theme.radius.md,
  boxShadow: theme.shadow.elevated,
  display: "grid",
  minWidth: "min(19rem, calc(100vw - 2rem))",
  padding: theme.space[2],
  position: "absolute",
  right: 0,
  top: `calc(100% + ${theme.space[2]})`,
})

export const mobileAccountEmail = style({
  borderBottom: `1px solid ${theme.color.border.default}`,
  color: theme.color.text.muted,
  fontSize: theme.font.role.supporting,
  marginBottom: theme.space[1],
  maxWidth: "18rem",
  overflow: "hidden",
  padding: `${theme.space[2]} ${theme.space[2]} ${theme.space[3]}`,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

globalStyle(`${mobileAccountMenu} form`, { display: "flex" })
globalStyle(`${mobileAccountMenu} form button`, {
  fontWeight: theme.font.weight.medium,
  justifyContent: "flex-start",
  minHeight: theme.layout.mobileControlHeight,
  paddingInline: theme.space[3],
  width: "100%",
})

export const mobileNavigation = style({
  "@media": {
    "screen and (max-width: 48rem)": { display: "block" },
  },
  background: theme.color.background.elevated,
  borderTop: `1px solid ${theme.color.border.default}`,
  bottom: 0,
  display: "none",
  left: 0,
  padding: `${theme.space[1]} ${theme.space[2]} calc(${theme.space[1]} + env(safe-area-inset-bottom))`,
  position: "fixed",
  right: 0,
  zIndex: theme.zIndex.progress,
})

globalStyle(`${mobileNavigation} nav`, {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
})

globalStyle(`${mobileNavigation} ${navLink}`, {
  flexDirection: "column",
  fontSize: theme.font.role.metadata,
  gap: "0.125rem",
  justifyContent: "center",
  minHeight: "3.5rem",
  padding: theme.space[1],
})

export const ownerPrompt = style({
  "@media": {
    "screen and (max-width: 64rem)": {
      marginLeft: 0,
      paddingTop: `calc(${theme.layout.shellHeaderHeight} + ${theme.space[2]})`,
    },
  },
  alignItems: "center",
  borderBottom: `1px solid ${theme.color.border.default}`,
  color: theme.color.text.secondary,
  display: "flex",
  fontSize: theme.font.role.supporting,
  gap: theme.space[2],
  justifyContent: "space-between",
  marginLeft: theme.layout.railWidth,
  padding: `${theme.space[2]} ${theme.layout.pagePadding}`,
})

globalStyle(`${ownerPrompt} a`, {
  color: theme.color.text.link,
  fontWeight: theme.font.weight.medium,
})

export const main = style({
  "@media": {
    "screen and (max-width: 48rem)": {
      paddingBottom: "6rem",
      paddingInline: theme.space[4],
    },
    "screen and (max-width: 64rem)": {
      marginLeft: 0,
      paddingTop: `calc(${theme.layout.shellHeaderHeight} + ${theme.space[6]})`,
    },
  },
  marginLeft: theme.layout.railWidth,
  minWidth: 0,
  padding: `${theme.space[8]} ${theme.layout.pagePadding} ${theme.space[12]}`,
})
