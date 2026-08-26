import { style, styleVariants } from "@vanilla-extract/css"

import { theme } from "~/design-system/theme.css"

export const fieldSet = style({
  border: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.space[6],
  minInlineSize: 0,
  padding: 0,
})

export const fieldLegend = style({
  fontWeight: theme.font.weight.medium,
  marginBottom: theme.space[3],
})

export const fieldLegendVariant = styleVariants({
  label: { fontSize: theme.font.size.sm },
  legend: { fontSize: theme.font.size.base },
})

export const fieldGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[6],
  width: "100%",
})

export const field = style({
  color: theme.color.text.primary,
  display: "flex",
  gap: theme.space[3],
  selectors: {
    "&[data-invalid='true']": {
      color: theme.color.text.danger,
    },
  },
  width: "100%",
})

export const fieldOrientation = styleVariants({
  horizontal: {
    alignItems: "center",
    flexDirection: "row",
  },
  responsive: {
    "@media": {
      "screen and (min-width: 28rem)": {
        alignItems: "center",
        flexDirection: "row",
      },
    },
    flexDirection: "column",
  },
  vertical: { flexDirection: "column" },
})

export const fieldContent = style({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: theme.space[1],
  lineHeight: theme.font.lineHeight.normal,
})

export const fieldLabel = style({
  alignItems: "center",
  display: "flex",
  gap: theme.space[2],
  lineHeight: theme.font.lineHeight.normal,
  width: "fit-content",
})

export const fieldTitle = style({
  alignItems: "center",
  display: "flex",
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  gap: theme.space[2],
  lineHeight: theme.font.lineHeight.normal,
  width: "fit-content",
})

export const fieldDescription = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  lineHeight: theme.font.lineHeight.normal,
})

export const fieldSeparator = style({
  color: theme.color.text.muted,
  fontSize: theme.font.size.sm,
  minHeight: "1.25rem",
  position: "relative",
})

export const fieldSeparatorLine = style({
  inset: 0,
  position: "absolute",
  top: "50%",
})

export const fieldSeparatorContent = style({
  background: theme.color.background.canvas,
  color: theme.color.text.muted,
  display: "block",
  marginInline: "auto",
  paddingInline: theme.space[2],
  position: "relative",
  width: "fit-content",
})

export const fieldError = style({
  color: theme.color.text.danger,
  fontSize: theme.font.size.sm,
})

export const fieldErrorList = style({
  display: "flex",
  flexDirection: "column",
  gap: theme.space[1],
  listStyle: "disc",
  marginLeft: theme.space[4],
})
